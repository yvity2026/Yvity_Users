"use client";

type MembershipPaymentRow = {
  id: string;
  paidAt: string;
  planName: string;
  planId: string;
  amountInr: number;
  creditInr: number;
  checkoutKind: string;
  invoiceId: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function checkoutLabel(kind: string): string {
  if (kind === "upgrade") return "Plan upgrade";
  if (kind === "renew") return "Plan renewal";
  return "New subscription";
}

export function openMembershipInvoice(payment: MembershipPaymentRow, action: "view" | "download") {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${payment.invoiceId} — YVITY</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 640px; margin: 2rem auto; color: #111; line-height: 1.5; }
    h1 { font-size: 1.5rem; margin: 0 0 0.25rem; }
    .muted { color: #555; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
    th, td { text-align: left; padding: 0.65rem 0; border-bottom: 1px solid #e5e5e5; }
    th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #666; }
    .total { font-weight: 700; font-size: 1.1rem; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>YVITY Membership Invoice</h1>
  <p class="muted">Invoice ${payment.invoiceId} · Paid ${formatDate(payment.paidAt)}</p>
  <table>
    <thead><tr><th>Description</th><th>Amount</th></tr></thead>
    <tbody>
      <tr><td>${payment.planName} (${checkoutLabel(payment.checkoutKind)})</td><td>${formatInr(payment.amountInr + payment.creditInr)}</td></tr>
      ${
        payment.creditInr > 0
          ? `<tr><td>Unused plan credit applied</td><td>− ${formatInr(payment.creditInr)}</td></tr>`
          : ""
      }
      <tr><td class="total">Total paid</td><td class="total">${formatInr(payment.amountInr)}</td></tr>
    </tbody>
  </table>
  <p class="muted" style="margin-top:2rem">Thank you for your YVITY membership.</p>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");

  if (!win) {
    URL.revokeObjectURL(url);
    return;
  }

  win.addEventListener("load", () => {
    if (action === "download") {
      win.print();
    }
    URL.revokeObjectURL(url);
  });
}
