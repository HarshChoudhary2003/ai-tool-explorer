export type ToolIssue = {
  id: string;
  name: string;
  missing: string[];
  warnings: string[];
};

const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+/i;

export function validateTool(tool: any): ToolIssue | null {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!tool.category) missing.push("category");
  if (!tool.pricing) missing.push("pricing");
  if (tool.has_api === null || tool.has_api === undefined) missing.push("API availability");
  if (!tool.website_url || !String(tool.website_url).trim()) missing.push("official URL");
  else if (!URL_RE.test(tool.website_url)) warnings.push("URL looks malformed");

  if (!tool.description || tool.description.trim().length < 20) warnings.push("short/missing description");
  if (!tool.tasks || (Array.isArray(tool.tasks) && tool.tasks.length === 0)) warnings.push("no tasks");
  if (tool.has_api === true && !tool.api_details) warnings.push("API enabled but no api_details");
  if (tool.pricing && tool.pricing !== "free" && !tool.pricing_details) warnings.push("no pricing_details");

  if (missing.length === 0 && warnings.length === 0) return null;
  return { id: tool.id, name: tool.name || "(unnamed)", missing, warnings };
}

export function validateDataset(tools: any[]) {
  const issues = tools.map(validateTool).filter((i): i is ToolIssue => !!i);
  const missingByField: Record<string, number> = {};
  for (const i of issues) for (const f of i.missing) missingByField[f] = (missingByField[f] || 0) + 1;
  return {
    total: tools.length,
    complete: tools.length - issues.length,
    issueCount: issues.length,
    missingByField,
    issues,
  };
}

// Minimal CSV parser (RFC-ish: handles quoted fields, escaped quotes, commas, newlines).
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n" || c === "\r") {
        if (field !== "" || cur.length) { cur.push(field); rows.push(cur); cur = []; field = ""; }
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else field += c;
    }
  }
  if (field !== "" || cur.length) { cur.push(field); rows.push(cur); }
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((v) => v.trim() !== "")).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => { obj[h] = (r[idx] ?? "").trim(); });
    return obj;
  });
}

const ARRAY_FIELDS = new Set(["tasks", "pros", "cons", "use_cases"]);
const BOOL_FIELDS = new Set(["has_api"]);
const NUM_FIELDS = new Set(["rating", "popularity_score"]);

export function normalizeToolRow(row: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === undefined || v === null || v === "") continue;
    if (ARRAY_FIELDS.has(k)) {
      out[k] = Array.isArray(v) ? v : String(v).split(/[|;,]/).map((s) => s.trim()).filter(Boolean);
    } else if (BOOL_FIELDS.has(k)) {
      out[k] = typeof v === "boolean" ? v : /^(true|1|yes|y)$/i.test(String(v));
    } else if (NUM_FIELDS.has(k)) {
      const n = Number(v); if (!Number.isNaN(n)) out[k] = n;
    } else {
      out[k] = v;
    }
  }
  return out;
}