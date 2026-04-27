# Buyer Unknown Enquiry Intent

## Why this exists

In some bot-originated enquiries (email or WhatsApp), a BDM can be tagged before the buyer is identified in our system. This document captures the intended behavior so future implementation prompts can reference one stable source of truth.

## Current scope

- Buyer may be unknown at intake time.
- BDM must still be able to continue the enquiry.
- Assume buyer already exists in the system.
- New buyer creation/onboarding is out of scope for now.

## Detailed RFQ behavior

- Buyer field is mandatory.
- If buyer is unknown, the buyer value must be shown as empty (not masked with fallback labels).
- User must select/tag a buyer before proceeding.

## Quick RFQ behavior

- If buyer is unknown, user must tag buyer first.
- Before buyer tagging, buyer/internal group threading should not proceed.
- After buyer is tagged, normal group/thread behavior continues.

## UX principles

- Do not silently assign a default buyer.
- Do not silently convert unknown buyer to a valid selected buyer.
- Keep known-buyer flows unchanged.

## Mock data requirement

- Keep one draft enquiry in mock data with missing buyer identity to make this scenario easy to test in the enquiry list.

## Acceptance checklist

- One draft enquiry appears with no buyer identity in mock list data.
- Detailed RFQ for that enquiry starts with empty buyer and enforces mandatory validation.
- Quick RFQ path clearly prompts buyer tagging when buyer is missing.
- Known-buyer enquiries continue to work as before.
