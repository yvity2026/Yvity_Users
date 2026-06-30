function fmtCrore(n) {
  const num = Number(n);
  if (!num || !isFinite(num)) return "";
  if (num >= 10_000_000) return `₹${(num / 10_000_000).toFixed(1)}Cr`;
  if (num >= 100_000) return `₹${(num / 100_000).toFixed(1)}L`;
  if (num >= 1_000) return `₹${(num / 1_000).toFixed(0)}K`;
  return `₹${num}`;
}

export function autoTitle(category, data) {
  switch (category) {
    case "insurance":
      return (
        [data.insurer_name, data.policy_type].filter(Boolean).join(" — ") ||
        "Insurance Policy"
      );
    case "investments":
      return data.fund_name || data.investment_type || "Investment";
    case "bank_accounts":
      return (
        [data.bank_name, data.account_type].filter(Boolean).join(" ") ||
        "Bank Account"
      );
    case "fixed_deposits":
      return data.bank_name ? `${data.bank_name} FD` : "Fixed Deposit";
    case "loans":
      return (
        [data.loan_type, data.lender_name].filter(Boolean).join(" — ") || "Loan"
      );
    case "real_estate":
      return data.property_type || "Property";
    case "gold":
      return (
        [data.gold_type, data.description].filter(Boolean).join(" — ") || "Gold"
      );
    case "documents":
      return (
        [data.document_type, data.name_on_doc].filter(Boolean).join(" — ") ||
        "Document"
      );
    case "nominees":
      return data.name || "Nominee";
    default:
      return "Item";
  }
}

export function autoSubtitle(category, data) {
  switch (category) {
    case "insurance":
      return data.policy_number
        ? `Policy #${data.policy_number}`
        : data.sum_insured
          ? `Cover: ${fmtCrore(data.sum_insured)}`
          : null;
    case "investments":
      return data.investment_type && data.fund_name
        ? data.investment_type
        : data.amount_invested
          ? `Invested: ${fmtCrore(data.amount_invested)}`
          : null;
    case "bank_accounts":
      return data.account_number_last4
        ? `···${data.account_number_last4}`
        : data.branch || null;
    case "fixed_deposits":
      return data.principal_amount
        ? `Principal: ${fmtCrore(data.principal_amount)}`
        : data.maturity_date
          ? `Matures: ${data.maturity_date}`
          : null;
    case "loans":
      return data.outstanding_amount
        ? `Outstanding: ${fmtCrore(data.outstanding_amount)}`
        : data.emi_amount
          ? `EMI: ${fmtCrore(data.emi_amount)}`
          : null;
    case "real_estate":
      return data.area || (data.current_value ? fmtCrore(data.current_value) : null);
    case "gold":
      return data.weight_grams
        ? `${data.weight_grams}g`
        : data.current_value
          ? fmtCrore(data.current_value)
          : null;
    case "documents":
      return (
        data.document_number ||
        (data.expiry_date ? `Expires: ${data.expiry_date}` : null)
      );
    case "nominees":
      return data.relation || null;
    default:
      return null;
  }
}
