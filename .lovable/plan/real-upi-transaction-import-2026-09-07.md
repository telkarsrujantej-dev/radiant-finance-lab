# Real UPI transaction import

## Goal

Allow signed-in Finance Tracker users to import completed UPI transactions from any supported UPI app through a compliant banking-data connection, while keeping the current dashboard and manual transaction flow intact.

Direct access to Google Pay, PhonePe, or Paytm history is not available through a normal web app. The production path is an approved Account Aggregator/banking-data provider that obtains the user’s consent and returns transaction data. No provider connection is currently available in this workspace, so the app can be prepared first and activated once a provider and credentials are supplied.

## User experience

- Add a **UPI & bank sync** area in Settings showing connection status, last sync, consent status, and a clear Connect/Disconnect action.
- Use a consent-based redirect flow hosted by the selected provider; never collect UPI PINs, bank passwords, or app credentials in Finance Tracker.
- Add a manual **Sync now** action and a visible result summary: imported, skipped as duplicates, and failed items.
- Tag imported records with their source and preserve the existing manual add/edit/delete experience.
- Show safe error states for expired consent, provider downtime, missing permissions, and disconnected accounts.

## Data and sync behavior

- Normalize imported records before saving them into the signed-in user’s workspace.
- Deduplicate using provider transaction identifiers plus account/source context so repeated syncs do not create duplicate expenses.
- Keep imported transactions separate from manual records through source metadata, while mapping date, amount, merchant, category, payment method, and notes into the existing transaction model.
- Store only the minimum provider reference and sync metadata required for reconciliation; do not store credentials, PINs, or sensitive authentication payloads.
- Add secure server-side handling for provider callbacks/webhooks and refresh/sync requests, with authenticated ownership checks and input validation.
- Add database tables/policies for linked consented accounts and sync runs only after the provider contract and payload fields are confirmed.

## Provider activation

1. Choose an Account Aggregator or licensed banking-data partner that supports UPI-linked bank transaction feeds in India.
2. Create the provider application and obtain the required client credentials, redirect URL, webhook details, and compliance approval.
3. Add the credentials through secure project secrets after the provider is selected.
4. Implement and test consent, callback verification, sync, deduplication, and revoke-consent flows.
5. Validate with sandbox data before enabling production imports.

## Technical details

- Keep app-internal operations in authenticated server functions and use public server routes only for provider callbacks/webhooks.
- Verify callback signatures, validate all provider payloads, and use server-side secrets only.
- Extend the current JSON workspace model only as an interim compatibility path; prefer normalized sync tables for reliable deduplication, audit history, and multi-account support.
- Preserve current frontend styling, local/manual transaction controls, and per-user access rules.
- Do not implement direct scraping, screen reading, UPI PIN handling, or unofficial Google Pay/PhonePe/Paytm access.

## Not included until provider selection

- Live imports from a real UPI app
- Provider-specific credentials or production consent
- Automatic background sync
- Payment initiation from the Finance Tracker