// lib/users/seed-users.ts
//
// 13 seeded users per the design doc. Existing 7 persona names (now
// elevated to first-class users) + 3 AP Clerks + 3 AR Clerks for a
// realistic mid-market AP/AR org. Editable + extensible at runtime;
// Reset Demo restores this exact list.

import type { User } from "./types"

export const SEED_USERS: User[] = [
  // ── Admin ────────────────────────────────────────────────
  {
    id: "user-vibs",
    name: "Vibs Abhishek",
    initials: "VA",
    title: "Founder",
    roleId: "admin",
    avatarTone: "indigo",
  },
  {
    id: "user-nipun",
    name: "Nipun Mehra",
    initials: "NM",
    title: "CEO",
    roleId: "admin",
    avatarTone: "indigo",
  },
  // ── Executive + management ───────────────────────────────
  {
    id: "user-priya",
    name: "Priya Mehta",
    initials: "PM",
    title: "CFO",
    roleId: "cfo",
    avatarTone: "sky",
  },
  {
    id: "user-daniel",
    name: "Daniel Park",
    initials: "DP",
    title: "Controller",
    roleId: "controller",
    avatarTone: "emerald",
  },
  {
    id: "user-sasha",
    name: "Sasha Patel",
    initials: "SP",
    title: "AR Manager",
    roleId: "ar-manager",
    avatarTone: "rose",
  },
  {
    id: "user-lena",
    name: "Lena Müller",
    initials: "LM",
    title: "AP Manager",
    roleId: "ap-manager",
    avatarTone: "violet",
  },
  {
    id: "user-olivia",
    name: "Olivia Brooks",
    initials: "OB",
    title: "CPO",
    roleId: "cpo",
    avatarTone: "amber",
  },
  {
    id: "user-marcus",
    name: "Marcus Bauer",
    initials: "MB",
    title: "Treasurer",
    roleId: "treasurer",
    avatarTone: "slate",
  },
  // ── AP Clerks (3) ────────────────────────────────────────
  {
    id: "user-aaron-liu",
    name: "Aaron Liu",
    initials: "AL",
    title: "AP Specialist",
    roleId: "ap-clerk",
    avatarTone: "violet",
  },
  {
    id: "user-jamie-chen",
    name: "Jamie Chen",
    initials: "JC",
    title: "AP Specialist",
    roleId: "ap-clerk",
    avatarTone: "violet",
  },
  {
    id: "user-marco-silva",
    name: "Marco Silva",
    initials: "MS",
    title: "AP Specialist (Tier 2)",
    roleId: "ap-clerk",
    avatarTone: "violet",
  },
  // ── AR Clerks (3) ────────────────────────────────────────
  {
    id: "user-bianca-romero",
    name: "Bianca Romero",
    initials: "BR",
    title: "Cash Application Analyst",
    roleId: "ar-clerk",
    avatarTone: "rose",
  },
  {
    id: "user-hannah-patel",
    name: "Hannah Patel",
    initials: "HP",
    title: "Collections Specialist",
    roleId: "ar-clerk",
    avatarTone: "rose",
  },
  {
    id: "user-wei-zhang",
    name: "Wei Zhang",
    initials: "WZ",
    title: "Cash Application Analyst",
    roleId: "ar-clerk",
    avatarTone: "rose",
  },
]

export const DEFAULT_ACTIVE_USER_ID = "user-vibs"

export function getUser(id: string): User | undefined {
  return SEED_USERS.find((u) => u.id === id)
}
