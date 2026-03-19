# Aryeo API - Complete Reference for OpenClaw Integration

Base URL: https://api.aryeo.com/v1
Auth: Bearer token (ARYEO_API_KEY)

## Key Endpoints

### Orders (Invoicing & Billing)
- GET /orders — List all orders (filter by payment_status: PAID, PARTIALLY_PAID, UNPAID; fulfillment_status: FULFILLED, PARTIALLY_FULFILLED, UNFULFILLED)
- POST /orders — Create order
- GET /orders/{order_id} — Get specific order
- POST /orders/{order}/payments — Create manual payment
- PUT /orders/{order}/billing-address — Update billing address
- GET /orders/{order}/payment-info — Get payment info

### Appointments (Scheduling)
- GET /appointments — List appointments
- GET /appointments/{appointment_id} — Get appointment
- PUT /appointments/{appointment_id} — Update appointment
- PUT /appointments/{appointment_id}/cancel — Cancel
- PUT /appointments/{appointment_id}/postpone — Postpone
- PUT /appointments/{appointment_id}/reschedule — Reschedule
- PUT /appointments/{appointment_id}/accept — Accept
- PUT /appointments/{appointment_id}/decline — Decline

### Listings (Properties)
- GET /listings — List all listings
- POST /listings — Create listing
- GET /listings/{listing_id} — Get listing
- PUT /listings/{listing_id} — Update listing
- GET /listings/{listing_id}/stats — Get listing stats

### Products (Services)
- GET /products — List products
- POST /products — Create product

### Tasks (Production)
- GET /tasks — List tasks

### Videos (Media)
- GET /videos — List videos

### Customer Users (Agents/Clients)
- GET /customers — List customers
- POST /customers — Create customer
- GET /customer-users — List customer users

### Scheduling
- Available for managing shoot schedules

### Webhooks
- Supports real-time event notifications for orders, appointments, etc.
- ARYEO_WEBHOOK_SECRET available for verification

## Order Response Fields
- id, identifier, number, title, status, order_status
- fulfillment_status, payment_status
- currency, total_amount
- payment_url, status_url, invoice_url
- address, listing, customer, appointments
