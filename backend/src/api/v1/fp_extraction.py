from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ...auth.deps import CurrentUser
from ...database import get_db
from ...db.collections import executed_stages, invoices, pipeline_runs
from ...services.fixtures import get_loader
from ...services.invoice_state import get_invoice_schema
from .stages import approve_stage, reject_stage
from ._common import _envelope, _extract_field, _oid, _require_editor

router = APIRouter(tags=["fp_extraction"])

_FIELD_DISPLAY = {
    "fp_number":       "FP Number",
    "vendor_name":     "Vendor Name (FP)",
    "customer_name":   "Customer Name (FP)",
    "taxable_amount":  "Taxable Amount (DPP)",
    "vat_amount":      "VAT Amount (PPN)",
}

# Maps FP field names to the corresponding field in the invoice's extraction schema.
_INVOICE_FIELD_MAP = {
    "vendor_name":    "vendor_name",
    "customer_name":  "customer_legal_entity",
    "taxable_amount": "total_amount_before_vat",
    "vat_amount":     "vat_gst",
}

# Fields that are "required" — mismatches must be acknowledged before approving.
_REQUIRED_FIELDS = {"vendor_name", "customer_name", "taxable_amount", "vat_amount"}


def _normalise_amount(val: str | None) -> str:
    """Strip trailing .00 from numeric strings so comparisons work cleanly."""
    if not val:
        return ""
    try:
        # e.g. "8341667.00" → "8341667.0" → strip → "8341667"
        as_float = float(val.replace(",", ""))
        if as_float == int(as_float):
            return str(int(as_float))
        return str(as_float)
    except (ValueError, AttributeError):
        return val.strip()


def _parse_fp_fixture(fp_fixture: dict, invoice_schema: dict | None = None) -> dict:
    """Return normalised fp data from the fp_extraction fixture.

    If invoice_schema is supplied the returned fields include invoice_value and
    match_status so the FE can render a comparison table without extra requests.
    """
    schema = fp_fixture.get("invoice_schema", {})
    meta = schema.get("metadata", []) or []

    inv_meta = {}
    if invoice_schema:
        for m in (invoice_schema.get("metadata") or []):
            inv_meta[m.get("field", "")] = str(m.get("value") or "")

    by_field = {m["field"]: m for m in meta if m.get("field")}
    fp_number = by_field.get("fp_number", {}).get("value") or ""
    fp_date   = None  # fp_extraction fixture doesn't carry a date field currently

    fields = []
    for field_name in ("vendor_name", "customer_name", "taxable_amount", "vat_amount"):
        m = by_field.get(field_name)
        if m is None:
            continue

        fp_val = m.get("value") or ""
        inv_key = _INVOICE_FIELD_MAP.get(field_name, "")
        inv_val = inv_meta.get(inv_key, "")

        # Normalise amounts before comparing so "8341667.00" vs "8341667" both match.
        fp_norm  = _normalise_amount(fp_val)
        inv_norm = _normalise_amount(inv_val)
        match_status = "match" if fp_norm == inv_norm and fp_norm else "mismatch"

        bbox = _bbox_entry(fp_fixture.get("bbox_schema", {}), m.get("row_id"))
        fields.append({
            "field_name":    field_name,
            "display_name":  _FIELD_DISPLAY.get(field_name, field_name),
            "fp_value":      fp_val,
            "invoice_value": inv_val,
            "match_status":  match_status,
            "required":      field_name in _REQUIRED_FIELDS,
            "row_id":        m.get("row_id"),
            "confidence":    bbox.get("value_confidence"),
            "bbox_left":     bbox.get("bbox_left"),
            "bbox_top":      bbox.get("bbox_top"),
            "bbox_width":    bbox.get("bbox_width"),
            "bbox_height":   bbox.get("bbox_height"),
            "bbox_page":     bbox.get("page", 2),
        })
    return {"fp_number": fp_number, "fp_date": fp_date, "fields": fields}


def _bbox_entry(bbox_schema: dict, row_id: str | None) -> dict:
    """Return the full bbox entry for a given row_id, or empty dict."""
    if not row_id:
        return {}
    for b in bbox_schema.get("metadata", []) or []:
        if b.get("row_id") == row_id:
            return b
    return {}


def _bbox_confidence(bbox_schema: dict, row_id: str | None) -> float | None:
    entry = _bbox_entry(bbox_schema, row_id)
    return entry.get("value_confidence") if entry else None


# ── GET /api/v1/invoices/{id}/stages/fp_extraction ────────────────────────────

@router.get("/invoices/{invoice_id}/stages/fp_extraction")
async def get_fp_extraction(invoice_id: str, current_user: CurrentUser):
    db = get_db()
    oid = _oid(invoice_id)

    run = await pipeline_runs(db).find_one({"_id": oid})
    if not run:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice_schema = await get_invoice_schema(db, oid)

    loader = get_loader()
    fixture_key = run.get("fixture_key", "")
    bundle = loader.discover().get(fixture_key)
    fp_fixture = bundle.fp_extraction if bundle else {}

    stage_doc = await executed_stages(db).find_one(
        {"run_id": oid, "stage_slug": "fp_extraction"}
    ) or {}

    fp_data = (
        _parse_fp_fixture(fp_fixture, invoice_schema)
        if fp_fixture
        else {"fp_number": None, "fp_date": None, "fields": []}
    )

    # Load acknowledged field names from invoices.fp_acknowledged_fields
    inv_doc = await invoices(db).find_one({"run_id": oid}, {"fp_acknowledged_fields": 1}) or {}
    ack_names: list[str] = [
        a["field_name"] for a in (inv_doc.get("fp_acknowledged_fields") or [])
    ]

    return _envelope(data={
        "invoice_number":       _extract_field(invoice_schema, "invoice_number"),
        "invoice_date":         _extract_field(invoice_schema, "invoice_date"),
        "vendor_name":          _extract_field(invoice_schema, "vendor_name"),
        "currency":             _extract_field(invoice_schema, "currency"),
        "file_name":            run.get("file_name", ""),
        "fixture_key":          fixture_key,
        "status":               run.get("status", "in_progress"),
        "stage_status":         stage_doc.get("status", "in_review"),
        "fp_number":            fp_data["fp_number"],
        "fp_date":              fp_data.get("fp_date"),
        "fields":               fp_data["fields"],
        "has_fp_document":      bool(fp_fixture),
        "acknowledged_fields":  ack_names,
    })


# ── POST .../approve ──────────────────────────────────────────────────────────

@router.post("/invoices/{invoice_id}/stages/fp_extraction/approve")
async def approve_fp_extraction(invoice_id: str, current_user: CurrentUser):
    _require_editor(current_user)
    db = get_db()
    oid = _oid(invoice_id)

    run = await pipeline_runs(db).find_one({"_id": oid}, {"_id": 1})
    if not run:
        raise HTTPException(status_code=404, detail="Invoice not found")

    result = await approve_stage(
        db, oid,
        slug="fp_extraction",
        current_user=current_user,
        action="fp_extraction.approved",
    )
    return _envelope(data={"next_stage": result["next_stage"]})


# ── POST .../acknowledge ─────────────────────────────────────────────────────

class AcknowledgeRequest(BaseModel):
    field_names: list[str]


@router.post("/invoices/{invoice_id}/stages/fp_extraction/acknowledge")
async def acknowledge_fp_fields(
    invoice_id: str,
    body: AcknowledgeRequest,
    current_user: CurrentUser,
):
    """Persist FP field acknowledgements into invoices.fp_acknowledged_fields."""
    _require_editor(current_user)
    db = get_db()
    oid = _oid(invoice_id)

    run = await pipeline_runs(db).find_one({"_id": oid}, {"_id": 1})
    if not run:
        raise HTTPException(status_code=404, detail="Invoice not found")

    now = datetime.now(timezone.utc)
    inv_doc = await invoices(db).find_one({"run_id": oid}, {"fp_acknowledged_fields": 1}) or {}
    existing: list[dict] = list(inv_doc.get("fp_acknowledged_fields") or [])
    existing_by_name = {a["field_name"]: a for a in existing}

    for fn in body.field_names:
        if fn not in existing_by_name:
            existing_by_name[fn] = {
                "field_name": fn,
                "acknowledged_by": current_user.full_name,
                "acknowledged_at": now,
            }

    await invoices(db).update_one(
        {"run_id": oid},
        {"$set": {"fp_acknowledged_fields": list(existing_by_name.values())}},
        upsert=True,
    )
    return _envelope(data={"acknowledged": body.field_names})


@router.post("/invoices/{invoice_id}/stages/fp_extraction/unacknowledge")
async def unacknowledge_fp_fields(
    invoice_id: str,
    body: AcknowledgeRequest,
    current_user: CurrentUser,
):
    _require_editor(current_user)
    db = get_db()
    oid = _oid(invoice_id)

    run = await pipeline_runs(db).find_one({"_id": oid}, {"_id": 1})
    if not run:
        raise HTTPException(status_code=404, detail="Invoice not found")

    inv_doc = await invoices(db).find_one({"run_id": oid}, {"fp_acknowledged_fields": 1}) or {}
    existing: list[dict] = [
        a for a in (inv_doc.get("fp_acknowledged_fields") or [])
        if a["field_name"] not in body.field_names
    ]
    await invoices(db).update_one(
        {"run_id": oid},
        {"$set": {"fp_acknowledged_fields": existing}},
        upsert=True,
    )
    return _envelope(data={"unacknowledged": body.field_names})


# ── POST .../reject ───────────────────────────────────────────────────────────

class RejectRequest(BaseModel):
    reason: str


@router.post("/invoices/{invoice_id}/stages/fp_extraction/reject")
async def reject_fp_extraction(
    invoice_id: str,
    body: RejectRequest,
    current_user: CurrentUser,
):
    _require_editor(current_user)
    db = get_db()
    oid = _oid(invoice_id)

    run = await pipeline_runs(db).find_one({"_id": oid}, {"_id": 1})
    if not run:
        raise HTTPException(status_code=404, detail="Invoice not found")

    await reject_stage(db, oid, "fp_extraction", current_user, body.reason)
    return _envelope(data={"status": "rejected"})
