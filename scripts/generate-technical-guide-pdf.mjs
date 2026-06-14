/**
 * Generates docs/YVITY_USERS_TECHNICAL_GUIDE.pdf from the markdown source
 * using Edge/Chrome headless print-to-PDF.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const mdPath = path.join(root, "docs", "YVITY_USERS_TECHNICAL_GUIDE.md");
const htmlPath = path.join(root, "docs", "YVITY_USERS_TECHNICAL_GUIDE.html");
const pdfPath = path.join(root, "docs", "YVITY_USERS_TECHNICAL_GUIDE.pdf");

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mdToHtml(md) {
  const lines = md.split("\n");
  const out = [];
  let inTable = false;
  let inCode = false;
  let codeBuf = [];

  const flushCode = () => {
    if (codeBuf.length) {
      out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
      codeBuf = [];
    }
    inCode = false;
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) flushCode();
      else inCode = true;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      out.push(`<h1>${escapeHtml(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(`<h2>${escapeHtml(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("### ")) {
      out.push(`<h3>${escapeHtml(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("#### ")) {
      out.push(`<h4>${escapeHtml(line.slice(5))}</h4>`);
      continue;
    }

    if (line.startsWith("|") && line.includes("|")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      if (!inTable) {
        out.push("<table>");
        inTable = true;
      }
      const tag = inTable && out[out.length - 1] === "<table>" ? "th" : "td";
      if (out[out.length - 1] === "<table>") {
        out.push("<tr>" + cells.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr>");
      } else {
        out.push("<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>");
      }
      continue;
    } else if (inTable) {
      out.push("</table>");
      inTable = false;
    }

    if (line.trim() === "---") {
      out.push("<hr/>");
      continue;
    }
    if (line.trim() === "") {
      continue;
    }
    if (line.startsWith("- ")) {
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    out.push(`<p>${inline(line)}</p>`);
  }
  if (inTable) out.push("</table>");
  flushCode();
  return out.join("\n");
}

function inline(text) {
  let s = escapeHtml(text);
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s;
}

function findBrowser() {
  const candidates = [
    process.env["PROGRAMFILES(X86)"],
    process.env.PROGRAMFILES,
    process.env.LOCALAPPDATA,
  ].filter(Boolean);

  const paths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const md = fs.readFileSync(mdPath, "utf8");
const body = mdToHtml(md);
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>YVITY Users — Technical Onboarding Guide</title>
<style>
  @page { margin: 18mm 16mm; size: A4; }
  body {
    font-family: "Segoe UI", Calibri, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.45;
    color: #1a1a1a;
    max-width: 100%;
  }
  h1 { font-size: 22pt; color: #0A4A4A; border-bottom: 2px solid #F59E0B; padding-bottom: 6px; margin-top: 0; }
  h2 { font-size: 14pt; color: #0A4A4A; margin-top: 22px; page-break-after: avoid; }
  h3 { font-size: 11.5pt; color: #0D6060; margin-top: 16px; page-break-after: avoid; }
  h4 { font-size: 10.5pt; color: #374151; margin-top: 12px; }
  p { margin: 6px 0 10px; }
  li { margin: 4px 0 4px 18px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0 16px; font-size: 9.5pt; }
  th, td { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f0f9f8; color: #0A4A4A; font-weight: 600; }
  tr:nth-child(even) td { background: #fafafa; }
  code, pre { font-family: Consolas, "Courier New", monospace; font-size: 9pt; }
  pre { background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px; overflow-x: auto; white-space: pre-wrap; }
  code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
  strong { color: #0A4A4A; }
</style>
</head>
<body>
${body}
</body>
</html>`;

fs.writeFileSync(htmlPath, html, "utf8");

const browser = findBrowser();
if (!browser) {
  console.error("No Chrome/Edge found. Open docs/YVITY_USERS_TECHNICAL_GUIDE.html and Print to PDF.");
  process.exit(1);
}

const fileUrl = "file:///" + htmlPath.replace(/\\/g, "/");
const result = spawnSync(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--print-to-pdf=${pdfPath}`,
    fileUrl,
  ],
  { encoding: "utf8", timeout: 60000 },
);

if (result.status !== 0 || !fs.existsSync(pdfPath)) {
  console.error(result.stderr || result.stdout || "PDF generation failed");
  console.error("Fallback: open docs/YVITY_USERS_TECHNICAL_GUIDE.html → Print → Save as PDF");
  process.exit(1);
}

console.log("PDF written to:", pdfPath);
