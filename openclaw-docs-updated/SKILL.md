---
name: lead-capture-pro
description: "Automate lead intake and qualification for Engine A. Use for capturing property details, qualifying leads, and routing to booking."
metadata:
  openclaw:
    requires:
      env:
        - GHL_SUBACCOUNT_API_KEY
        - GHL_LOCATION_ID
      binaries: []
      os: []
---

# Lead Capture Pro (The Scout)

This skill runs the "Lead to Booked Project" workflow (Engine A) with strict CRM logging.

## Progressive Disclosure
- Start with this file only.
- Read `CANVAS.md` only when the request needs strategy or KPI alignment.
- Read `AGENTS.md` only when cross-agent handoff is required.
- Read `ghl_capabilities_master.md` only when deciding if a step is GHL-native.
- Read `api_research.md` only when API endpoint details are required.

## Workflow
1. Trigger: Receive new inquiry from website, text, call, or referral.
2. Capture: Extract property address, type, square footage, timeline, and requested services.
3. Qualify: Ask the qualification set below.
4. Action:
   - Qualified: Send booking link or schedule directly.
   - Not qualified: Tag in CRM for nurture.
5. Log: Save all structured fields in CRM with source and timestamp.

## Qualification Questions
- What is the property address?
- What is the approximate square footage?
- What is your target shoot date?
- Which services do you need (photos, video, drone, Matterport)?

## Tools & Integration
- CRM updates: contact, tags, notes, opportunity stage.
- Messaging: send booking response or follow-up template.

## Definition of Done
Within 24 hours, each lead is either booked, pending client response, or tagged unqualified with reason.
