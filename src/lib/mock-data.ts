export type Status = "success" | "warning" | "critical" | "idle";

export type Worker = {
  id: string;
  name: string;
  role: string;
  initials: string;
  project: string;
  task: string;
  zone: string;
  status: Status;
  statusLabel: string;
  aiSession: "active" | "idle" | "offline";
  battery: number;
  hazard: string;
  hazardLevel: Status;
  lastActive: string;
  certifications: string[];
  shift: string;
  glasses: string;
};

export const workers: Worker[] = [
  {
    id: "w-1042",
    name: "John Mercer",
    role: "Steel Foreman",
    initials: "JM",
    project: "Harbor Point Tower",
    task: "Beam alignment — Level 14",
    zone: "Zone C · Core",
    status: "success",
    statusLabel: "On task",
    aiSession: "active",
    battery: 82,
    hazard: "No hazard",
    hazardLevel: "success",
    lastActive: "12s ago",
    certifications: ["OSHA 30", "Rigging II", "Confined Space"],
    shift: "06:00 – 14:00",
    glasses: "Ray-Ban Meta · SM-4412",
  },
  {
    id: "w-1043",
    name: "Aisha Rahman",
    role: "Site Engineer",
    initials: "AR",
    project: "Harbor Point Tower",
    task: "Rebar spacing inspection",
    zone: "Zone A · Podium",
    status: "warning",
    statusLabel: "Needs review",
    aiSession: "active",
    battery: 41,
    hazard: "Helmet strap loose",
    hazardLevel: "warning",
    lastActive: "34s ago",
    certifications: ["PE", "OSHA 30"],
    shift: "07:00 – 15:00",
    glasses: "Ray-Ban Meta · SM-4419",
  },
  {
    id: "w-1044",
    name: "Diego Salazar",
    role: "Crane Operator",
    initials: "DS",
    project: "Northgate Logistics Hub",
    task: "Panel lift sequence 7",
    zone: "Yard · Lift Pad 2",
    status: "critical",
    statusLabel: "Hazard active",
    aiSession: "active",
    battery: 18,
    hazard: "Load swing near exclusion zone",
    hazardLevel: "critical",
    lastActive: "4s ago",
    certifications: ["NCCCO", "OSHA 30"],
    shift: "06:00 – 18:00",
    glasses: "Ray-Ban Meta · SM-4402",
  },
  {
    id: "w-1045",
    name: "Marta Kowalski",
    role: "QA Inspector",
    initials: "MK",
    project: "Riverside Medical Center",
    task: "Blueprint comparison — MEP riser",
    zone: "Zone B · Level 3",
    status: "success",
    statusLabel: "On task",
    aiSession: "active",
    battery: 67,
    hazard: "No hazard",
    hazardLevel: "success",
    lastActive: "1m ago",
    certifications: ["ICC", "OSHA 10"],
    shift: "08:00 – 16:00",
    glasses: "Ray-Ban Meta · SM-4437",
  },
  {
    id: "w-1046",
    name: "Ethan Brooks",
    role: "Electrician",
    initials: "EB",
    project: "Riverside Medical Center",
    task: "Conduit routing — East wing",
    zone: "Zone D · Level 2",
    status: "warning",
    statusLabel: "Low battery",
    aiSession: "idle",
    battery: 12,
    hazard: "Energized panel nearby",
    hazardLevel: "warning",
    lastActive: "6m ago",
    certifications: ["Journeyman", "NFPA 70E"],
    shift: "07:00 – 15:00",
    glasses: "Ray-Ban Meta · SM-4451",
  },
  {
    id: "w-1047",
    name: "Priya Nandan",
    role: "Safety Officer",
    initials: "PN",
    project: "Harbor Point Tower",
    task: "Perimeter guardrail audit",
    zone: "Zone E · Level 9",
    status: "success",
    statusLabel: "On task",
    aiSession: "active",
    battery: 94,
    hazard: "No hazard",
    hazardLevel: "success",
    lastActive: "20s ago",
    certifications: ["CSP", "OSHA 500"],
    shift: "06:00 – 14:00",
    glasses: "Ray-Ban Meta · SM-4408",
  },
  {
    id: "w-1048",
    name: "Tom Whitaker",
    role: "Concrete Lead",
    initials: "TW",
    project: "Northgate Logistics Hub",
    task: "Slab pour prep — Bay 4",
    zone: "Bay 4",
    status: "idle",
    statusLabel: "Off shift",
    aiSession: "offline",
    battery: 0,
    hazard: "—",
    hazardLevel: "idle",
    lastActive: "3h ago",
    certifications: ["ACI", "OSHA 30"],
    shift: "22:00 – 06:00",
    glasses: "Ray-Ban Meta · SM-4460",
  },
  {
    id: "w-1049",
    name: "Lena Fischer",
    role: "BIM Coordinator",
    initials: "LF",
    project: "Harbor Point Tower",
    task: "Clash resolution — Level 14",
    zone: "Site Office",
    status: "success",
    statusLabel: "On task",
    aiSession: "idle",
    battery: 76,
    hazard: "No hazard",
    hazardLevel: "success",
    lastActive: "2m ago",
    certifications: ["Autodesk Pro"],
    shift: "08:00 – 17:00",
    glasses: "Ray-Ban Meta · SM-4471",
  },
];

export type Project = {
  id: string;
  name: string;
  code: string;
  client: string;
  status: "On track" | "At risk" | "Delayed";
  statusLevel: Status;
  progress: number;
  workers: number;
  blueprint: string;
  blueprintLevel: Status;
  ai: string;
  aiLevel: Status;
  lastActivity: string;
  location: string;
  phase: string;
  budget: string;
};

export const projects: Project[] = [
  {
    id: "harbor-point-tower",
    name: "Harbor Point Tower",
    code: "HPT-2041",
    client: "Meridian Development Group",
    status: "On track",
    statusLevel: "success",
    progress: 68,
    workers: 42,
    blueprint: "v14 approved",
    blueprintLevel: "success",
    ai: "12 sessions live",
    aiLevel: "success",
    lastActivity: "38 seconds ago",
    location: "Pier 9, Oakland CA",
    phase: "Structure · Level 14 of 22",
    budget: "$184.2M",
  },
  {
    id: "northgate-logistics-hub",
    name: "Northgate Logistics Hub",
    code: "NLH-1187",
    client: "Cascade Freight Partners",
    status: "At risk",
    statusLevel: "warning",
    progress: 44,
    workers: 31,
    blueprint: "v8 pending approval",
    blueprintLevel: "warning",
    ai: "6 sessions live",
    aiLevel: "success",
    lastActivity: "2 minutes ago",
    location: "Northgate, Seattle WA",
    phase: "Envelope · Bay 4 pour",
    budget: "$92.6M",
  },
  {
    id: "riverside-medical-center",
    name: "Riverside Medical Center",
    code: "RMC-3320",
    client: "St. Aldwyn Health System",
    status: "On track",
    statusLevel: "success",
    progress: 81,
    workers: 27,
    blueprint: "v21 approved",
    blueprintLevel: "success",
    ai: "9 sessions live",
    aiLevel: "success",
    lastActivity: "5 minutes ago",
    location: "Riverside, Portland OR",
    phase: "MEP rough-in · Level 3",
    budget: "$140.9M",
  },
  {
    id: "westline-transit-depot",
    name: "Westline Transit Depot",
    code: "WTD-0904",
    client: "Regional Transit Authority",
    status: "Delayed",
    statusLevel: "critical",
    progress: 23,
    workers: 14,
    blueprint: "v3 changes requested",
    blueprintLevel: "critical",
    ai: "AI indexing paused",
    aiLevel: "warning",
    lastActivity: "1 hour ago",
    location: "Westline, Sacramento CA",
    phase: "Foundations · Grid B",
    budget: "$61.4M",
  },
];

export type ActivityEvent = {
  id: string;
  time: string;
  title: string;
  detail: string;
  level: Status;
  kind: "session" | "hazard" | "issue" | "blueprint" | "inspection";
};

export const activity: ActivityEvent[] = [
  {
    id: "a1",
    time: "09:42:18",
    title: "John Mercer started AI session",
    detail: "Harbor Point Tower · Zone C · Ray-Ban Meta SM-4412",
    level: "success",
    kind: "session",
  },
  {
    id: "a2",
    time: "09:41:02",
    title: "Helmet violation detected",
    detail: "Aisha Rahman · chin strap unfastened · confidence 0.94",
    level: "warning",
    kind: "hazard",
  },
  {
    id: "a3",
    time: "09:38:47",
    title: "Load swing near exclusion zone",
    detail: "Diego Salazar · Northgate Lift Pad 2 · escalated to supervisor",
    level: "critical",
    kind: "hazard",
  },
  {
    id: "a4",
    time: "09:31:26",
    title: "Issue reported",
    detail: "Cracked formwork panel · Bay 4 · priority High",
    level: "warning",
    kind: "issue",
  },
  {
    id: "a5",
    time: "09:24:09",
    title: "Blueprint comparison completed",
    detail: "RMC-3320 v21 · 3 deviations flagged on MEP riser",
    level: "success",
    kind: "blueprint",
  },
  {
    id: "a6",
    time: "09:12:55",
    title: "Inspection finished",
    detail: "Priya Nandan · guardrail audit Level 9 · pass",
    level: "success",
    kind: "inspection",
  },
  {
    id: "a7",
    time: "08:58:31",
    title: "Marta Kowalski started AI session",
    detail: "Riverside Medical Center · Zone B",
    level: "success",
    kind: "session",
  },
];

export type Issue = {
  id: string;
  ref: string;
  title: string;
  summary: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  worker: string;
  location: string;
  reported: string;
  column: "open" | "progress" | "resolved";
  thumb: string;
};

export const issues: Issue[] = [
  {
    id: "i1",
    ref: "ISS-2214",
    title: "Load swing near exclusion zone",
    summary:
      "AI observed repeated load oscillation exceeding 1.4 m amplitude within 3 m of an occupied walkway.",
    priority: "Critical",
    worker: "Diego Salazar",
    location: "Northgate · Lift Pad 2",
    reported: "9 min ago",
    column: "open",
    thumb: "critical",
  },
  {
    id: "i2",
    ref: "ISS-2211",
    title: "Cracked formwork panel",
    summary: "Hairline propagation along tie-rod line; pour scheduled in 4 hours.",
    priority: "High",
    worker: "Tom Whitaker",
    location: "Northgate · Bay 4",
    reported: "27 min ago",
    column: "open",
    thumb: "warning",
  },
  {
    id: "i3",
    ref: "ISS-2208",
    title: "Missing edge protection",
    summary: "Guardrail absent on 6 m span of the Level 9 west perimeter.",
    priority: "High",
    worker: "Priya Nandan",
    location: "Harbor Point · Level 9",
    reported: "1 h ago",
    column: "progress",
    thumb: "warning",
  },
  {
    id: "i4",
    ref: "ISS-2205",
    title: "MEP riser deviates from v21",
    summary: "Conduit bank offset 210 mm from approved coordination model.",
    priority: "Medium",
    worker: "Marta Kowalski",
    location: "Riverside · Level 3",
    reported: "2 h ago",
    column: "progress",
    thumb: "info",
  },
  {
    id: "i5",
    ref: "ISS-2199",
    title: "Helmet strap violation",
    summary: "Worker re-briefed on PPE policy; compliance confirmed by AI recheck.",
    priority: "Low",
    worker: "Aisha Rahman",
    location: "Harbor Point · Zone A",
    reported: "4 h ago",
    column: "resolved",
    thumb: "success",
  },
  {
    id: "i6",
    ref: "ISS-2190",
    title: "Blocked emergency egress",
    summary: "Material pallets relocated; route verified clear at 07:40.",
    priority: "Medium",
    worker: "John Mercer",
    location: "Harbor Point · Zone C",
    reported: "6 h ago",
    column: "resolved",
    thumb: "success",
  },
];

export type Blueprint = {
  id: string;
  name: string;
  project: string;
  version: string;
  uploaded: string;
  indexed: boolean;
  approval: "Approved" | "Pending" | "Changes requested";
  approvalLevel: Status;
  processing: string;
  sheets: number;
  uploader: string;
  size: string;
};

export const blueprints: Blueprint[] = [
  {
    id: "bp1",
    name: "HPT — Structural Set L14",
    project: "Harbor Point Tower",
    version: "v14",
    uploaded: "Aug 6, 2026",
    indexed: true,
    approval: "Approved",
    approvalLevel: "success",
    processing: "Indexed · 214 components",
    sheets: 48,
    uploader: "Lena Fischer",
    size: "84.2 MB",
  },
  {
    id: "bp2",
    name: "NLH — Envelope & Bay Layout",
    project: "Northgate Logistics Hub",
    version: "v8",
    uploaded: "Aug 8, 2026",
    indexed: true,
    approval: "Pending",
    approvalLevel: "warning",
    processing: "Indexed · awaiting sign-off",
    sheets: 31,
    uploader: "Tom Whitaker",
    size: "52.7 MB",
  },
  {
    id: "bp3",
    name: "RMC — MEP Coordination",
    project: "Riverside Medical Center",
    version: "v21",
    uploaded: "Aug 4, 2026",
    indexed: true,
    approval: "Approved",
    approvalLevel: "success",
    processing: "Indexed · 512 components",
    sheets: 76,
    uploader: "Marta Kowalski",
    size: "121.4 MB",
  },
  {
    id: "bp4",
    name: "WTD — Foundation Grid B",
    project: "Westline Transit Depot",
    version: "v3",
    uploaded: "Aug 9, 2026",
    indexed: false,
    approval: "Changes requested",
    approvalLevel: "critical",
    processing: "Processing · 62%",
    sheets: 18,
    uploader: "Ethan Brooks",
    size: "29.8 MB",
  },
];

export type Report = {
  id: string;
  type: string;
  project: string;
  generated: string;
  confidence: number;
  summary: string;
  pages: number;
};

export const reports: Report[] = [
  {
    id: "r1",
    type: "Daily Report",
    project: "Harbor Point Tower",
    generated: "Aug 9, 2026 · 06:00",
    confidence: 96,
    summary: "42 workers logged, 12 AI sessions, 2 hazards resolved within SLA.",
    pages: 6,
  },
  {
    id: "r2",
    type: "Weekly Report",
    project: "All projects",
    generated: "Aug 8, 2026 · 18:00",
    confidence: 92,
    summary: "Progress +4.1% week over week; PPE compliance up to 97.3%.",
    pages: 18,
  },
  {
    id: "r3",
    type: "Inspection Report",
    project: "Riverside Medical Center",
    generated: "Aug 8, 2026 · 15:20",
    confidence: 89,
    summary: "MEP riser deviations documented against approved v21 set.",
    pages: 11,
  },
  {
    id: "r4",
    type: "Compliance Report",
    project: "Northgate Logistics Hub",
    generated: "Aug 7, 2026 · 09:10",
    confidence: 94,
    summary: "OSHA fall-protection audit trail with 6 corrective actions closed.",
    pages: 14,
  },
];

export type User = {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "Admin" | "Supervisor" | "Engineer" | "Worker";
  status: "Active" | "Invited" | "Suspended";
  projects: string[];
  lastLogin: string;
};

export const users: User[] = [
  {
    id: "u1",
    name: "Dana Whitfield",
    email: "dana.whitfield@Kaya.ai",
    initials: "DW",
    role: "Admin",
    status: "Active",
    projects: ["All projects"],
    lastLogin: "Today · 05:12",
  },
  {
    id: "u2",
    name: "John Mercer",
    email: "j.mercer@meridiangroup.com",
    initials: "JM",
    role: "Supervisor",
    status: "Active",
    projects: ["Harbor Point Tower"],
    lastLogin: "Today · 06:04",
  },
  {
    id: "u3",
    name: "Aisha Rahman",
    email: "a.rahman@meridiangroup.com",
    initials: "AR",
    role: "Engineer",
    status: "Active",
    projects: ["Harbor Point Tower", "Riverside Medical Center"],
    lastLogin: "Today · 07:02",
  },
  {
    id: "u4",
    name: "Diego Salazar",
    email: "d.salazar@cascadefreight.com",
    initials: "DS",
    role: "Worker",
    status: "Active",
    projects: ["Northgate Logistics Hub"],
    lastLogin: "Today · 05:58",
  },
  {
    id: "u5",
    name: "Noah Petrov",
    email: "n.petrov@Kaya.ai",
    initials: "NP",
    role: "Supervisor",
    status: "Invited",
    projects: ["Westline Transit Depot"],
    lastLogin: "—",
  },
  {
    id: "u6",
    name: "Marta Kowalski",
    email: "m.kowalski@staldwyn.org",
    initials: "MK",
    role: "Engineer",
    status: "Active",
    projects: ["Riverside Medical Center"],
    lastLogin: "Yesterday · 16:41",
  },
  {
    id: "u7",
    name: "Grant Oyelaran",
    email: "g.oyelaran@Kaya.ai",
    initials: "GO",
    role: "Worker",
    status: "Suspended",
    projects: ["Northgate Logistics Hub"],
    lastLogin: "Aug 2, 2026",
  },
];

export type Task = {
  id: string;
  ref: string;
  title: string;
  project: string;
  assignee: string;
  due: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Blocked" | "In progress" | "Scheduled" | "Complete";
  progress: number;
};

export const tasks: Task[] = [
  {
    id: "t1",
    ref: "TSK-8841",
    title: "Beam alignment — Level 14 core",
    project: "Harbor Point Tower",
    assignee: "John Mercer",
    due: "Today · 14:00",
    priority: "High",
    status: "In progress",
    progress: 72,
  },
  {
    id: "t2",
    ref: "TSK-8839",
    title: "Rebar spacing inspection — Podium",
    project: "Harbor Point Tower",
    assignee: "Aisha Rahman",
    due: "Today · 12:00",
    priority: "Medium",
    status: "In progress",
    progress: 45,
  },
  {
    id: "t3",
    ref: "TSK-8830",
    title: "Panel lift sequence 7",
    project: "Northgate Logistics Hub",
    assignee: "Diego Salazar",
    due: "Today · 16:30",
    priority: "Critical",
    status: "Blocked",
    progress: 30,
  },
  {
    id: "t4",
    ref: "TSK-8822",
    title: "Slab pour prep — Bay 4",
    project: "Northgate Logistics Hub",
    assignee: "Tom Whitaker",
    due: "Tomorrow · 06:00",
    priority: "High",
    status: "Scheduled",
    progress: 0,
  },
  {
    id: "t5",
    ref: "TSK-8814",
    title: "Conduit routing — East wing",
    project: "Riverside Medical Center",
    assignee: "Ethan Brooks",
    due: "Today · 15:00",
    priority: "Medium",
    status: "In progress",
    progress: 61,
  },
  {
    id: "t6",
    ref: "TSK-8801",
    title: "Guardrail audit — Level 9",
    project: "Harbor Point Tower",
    assignee: "Priya Nandan",
    due: "Today · 10:00",
    priority: "High",
    status: "Complete",
    progress: 100,
  },
];

export const kpis = [
  {
    label: "Workers Online",
    value: "114",
    trend: "+6 vs yesterday",
    trendLevel: "success" as Status,
    sub: "of 132 assigned",
  },
  {
    label: "AI Sessions",
    value: "27",
    trend: "+3 in last hour",
    trendLevel: "success" as Status,
    sub: "Smart Glasses live",
  },
  {
    label: "Critical Hazards",
    value: "2",
    trend: "1 escalated",
    trendLevel: "critical" as Status,
    sub: "requires supervisor",
  },
  {
    label: "Open Issues",
    value: "18",
    trend: "-4 since 06:00",
    trendLevel: "success" as Status,
    sub: "across 4 projects",
  },
];

export const zones = [
  { name: "Zone A · Podium", workers: 18, level: "success" as Status },
  { name: "Zone B · Level 3", workers: 12, level: "success" as Status },
  { name: "Zone C · Core", workers: 24, level: "warning" as Status },
  { name: "Zone D · East wing", workers: 9, level: "success" as Status },
  { name: "Yard · Lift pads", workers: 7, level: "critical" as Status },
];

export const aiHealth = [
  { label: "Vision pipeline", value: 99.4, level: "success" as Status },
  { label: "Voice transcription", value: 97.1, level: "success" as Status },
  { label: "Blueprint indexing", value: 82.6, level: "warning" as Status },
  { label: "Edge sync latency", value: 94.8, level: "success" as Status },
];
