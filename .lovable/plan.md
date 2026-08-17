# UPI Integration — Prototype

Real auto-sync from GPay/PhonePe/Paytm isn't possible: those apps have no public API for reading your transactions (only RBI-licensed Account Aggregator / bank partners can). So this stays a frontend prototype that does the two things that genuinely work in a browser, plus a realistic linked-accounts UI.

## 1. Linked Accounts page (`/upi`)

New sidebar entry "UPI & Accounts".

- Cards for GPay, PhonePe, Paytm, BHIM with logo mark, masked UPI ID (e.g. `srujan@okhdfcbank`), status chip (Connected / Not linked), last-synced time.
- "Link account" opens a dialog: enter UPI ID → simulated verification spinner → account appears Connected with a success toast.
- "Sync now" on a connected card: short loading state, then pulls in 3-5 realistic mock UPI transactions (Swiggy, Uber, Amazon, electricity bill…) into the dashboard's transaction list and recomputes totals.
- Clear note on the page explaining sync is simulated in this prototype and what real integration would require (Account Aggregator / bank partner).

## 2. Pay via UPI (this one is real)

- "Pay via UPI" button in the dashboard header and on the new page.
- Dialog: payee UPI ID, amount, note → builds a standard `upi://pay?pa=…&pn=…&am=…&cu=INR&tn=…` deep link.
- On mobile, opens the user's installed UPI app chooser. On desktop, shows a QR code of the same link to scan with a phone.
- After returning, an "I paid / Mark as paid" action logs the expense into the dashboard with method "UPI".

## 3. Shared state

Transactions currently live in `src/routes/index.tsx` local state. Lift them into a small React context provider (`FinanceProvider` in `src/lib/finance-store.tsx`) mounted in `__root.tsx`, so the UPI page and the dashboard share the same list and totals. Still frontend-only, no persistence, no backend.

## Technical notes

- New route `src/routes/upi.tsx` with its own head metadata; sidebar nav item added in `AppSidebar.tsx`.
- New components under `src/components/dashboard/`: `LinkedAccounts.tsx`, `LinkUpiDialog.tsx`, `UpiPayDialog.tsx`.
- Mock UPI merchants/accounts and the deep-link builder in `src/lib/upi.ts`.
- QR rendering via a small `qrcode` package (client-only import).
- Existing design tokens, shadcn dialogs, sonner toasts, skeleton loaders reused — no new color literals.
