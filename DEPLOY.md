# Deployment Guide — Invoice Demo (Naman)

## Infrastructure

Two-hop SSH path:

```
Local machine  →  Jump server (10.0.2.16)  →  App server (10.0.131.190)
```

- **Jump server**: `ec2-3-7-80-11.ap-south-1.compute.amazonaws.com` (ap-south-1)
- **App server**: private subnet, reachable only from the jump server
- **Deployed services**:
  - Frontend (Next.js): `0.0.0.0:3002`
  - Backend (Python/uvicorn): `0.0.0.0:8001` → internal port `8099`

---

## Steps

### 1. SSH into the jump server

From the repo root on your local machine:

```bash
cd dev-env
./login.sh
```

### 2. SSH into the app server

From the jump server:

```bash
cd demo-server
./login.sh
```

### 3. Run the deploy script

From the app server:

```bash
cd naman
./deploy.sh
```

The script will:
1. Pull the latest code from `main` on `github.com/naman-neoflo/Invoice-demo-naman`
2. Stop and remove existing Docker containers (`frontend`, `backend`, network)
3. Build fresh Docker images for both services
4. Start containers and confirm they are running

A successful run ends with:

```
========================================
Deployment completed successfully
========================================
```

---

## Container status check

After deploy, verify containers are up:

```bash
docker ps
```

Expected output:

| Container | Image | Ports |
|-----------|-------|-------|
| `invoice-demo-naman-backend-1` | `invoice-demo-naman-backend` | `0.0.0.0:8001->8099/tcp` |
| `invoice-demo-naman-frontend-1` | `invoice-demo-naman-frontend` | `0.0.0.0:3002->3002/tcp` |

---

## Troubleshooting

**Build takes a long time** — frontend build (`npm run build`) typically takes ~135 s. This is expected.

**Containers not starting** — check logs with `docker compose logs backend` or `docker compose logs frontend`.

**Port already in use** — a stale container may not have been removed. Run `docker ps -a` and manually remove it with `docker rm -f <container-id>`.
