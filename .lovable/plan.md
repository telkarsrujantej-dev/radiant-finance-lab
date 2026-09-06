# Admin Members View

Add a secure, owner-only "Members" page that lists every registered user in the Finance Tracker app.

## What we will build

1. **Admin role system**
   - Create a `user_roles` table and a `has_role` security definer function.
   - Mark the current owner account as `admin`.

2. **Admin-only server function**
   - Add `listMembers` that first verifies the caller has the `admin` role, then reads the auth users list through the service-role client.
   - Return only safe fields: user id, email, sign-up date, last sign-in date, and provider.

3. **Admin route and layout**
   - Add `src/routes/_authenticated/_admin/members.tsx` gated by an admin-only `beforeLoad` check.
   - Redirect non-admins to the dashboard.

4. **Members page UI**
   - Total member count card.
   - Sortable table with email, joined date, last active, and provider.
   - Empty state when there are no members besides the owner.
   - Uses the existing design tokens and PageShell.

5. **Sidebar navigation**
   - Add a "Members" item in the AppSidebar, visible only to admins.

## Security notes

- Emails are PII, so the members list is strictly admin-only via role check + admin route gate.
- Direct `auth.users` access is done server-side with service role; the browser never sees the service key.
- Non-admin users cannot reach the route or the server function.

## Out of scope

- Real-time "currently online" users (this requires active session tracking; we can add it later if needed).
- Member management actions such as banning or deleting accounts.
