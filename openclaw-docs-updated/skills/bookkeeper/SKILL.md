---
name: bookkeeper
description: "Reconcile Stripe payments, track outstanding invoices, and generate revenue reports for Engine D financial operations."
metadata: {"openclaw": {"requires": {"env": ["STRIPE_SECRET_KEY", "GHL_API_TOKEN", "GHL_LOCATION_ID"]}}}
---

# Bookkeeper (The Bookkeeper)

This skill handles financial reconciliation and revenue reporting for Engine D (Operations).

## Progressive Disclosure
- Start with this file only.
- Read `CANVAS_INDEX.md` sections K.1–K.2 (KPI targets) when generating performance reports.
- Read `CANVAS_INDEX.md` section R.1 (revenue targets) when comparing against weekly/monthly goals.
- Read `CANVAS_INDEX.md` section R.10.5 (retainer MRR target) when reporting subscription revenue.
- Reference `stripe_history.csv` in workspace for historical payment data.

## Workflow

1. **Trigger**: Spawned for daily payment reconciliation, weekly revenue report, or outstanding invoice check.
2. **Pull Stripe transactions**: Retrieve payments for the requested period using Stripe API.
3. **Pull GHL opportunities**: Cross-reference with GHL won opportunities to ensure all payments are logged.
4. **Calculate**:
   - Total revenue for period
   - Transaction count
   - AOV (average order value)
   - MRR from active subscriptions/retainers
   - Comparison to target ($14,400/week or $62,500/month)
5. **Flag**: Outstanding invoices >3 days unpaid. Revenue pace >15% below target.
6. **Return**: Financial report (see report-back format below).

## API Reference

| Service | Endpoint | Purpose |
| :--- | :--- | :--- |
| Stripe | `GET /v1/charges` | Transaction list with amounts and status |
| Stripe | `GET /v1/subscriptions` | Active recurring subscriptions (MRR) |
| Stripe | `GET /v1/invoices?status=open` | Outstanding unpaid invoices |
| GHL | `GET /opportunities/search` | Won opportunities to cross-reference |

Stripe Base URL: `https://api.stripe.com`
Stripe Auth: `Authorization: Bearer {STRIPE_SECRET_KEY}`

## Revenue Targets Reference

- **Weekly**: $14,400 (from Canvas R.1: $750k ÷ 52 weeks)
- **Monthly**: $62,500 (from Canvas R.1: $750k ÷ 12 months)
- **Retainer MRR target**: $15,000–$20,000/month (Canvas R.10.5)

## Definition of Done

A complete report includes: period covered, total revenue, transaction count, AOV, MRR, comparison to target, and flagged items. All amounts in USD.

## Report-Back Format

```
BOOKKEEPER REPORT — [PERIOD]
Revenue: $[amount] | Target: $[target] | Variance: [+/- %]
Transactions: [count] | AOV: $[amount]
MRR (Retainers): $[amount] | Target: $15k-$20k

Outstanding Invoices:
- [Client Name] | $[amount] | [days overdue] | [link]
- (or NONE)

Flags:
- [any issues, or NONE]
```
