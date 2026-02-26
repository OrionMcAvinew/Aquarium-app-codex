export default function OrganizationsPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Organizations & RBAC</h2>
      <div className="rounded bg-slate-900 p-4 text-sm space-y-2">
        <p>Roles: OWNER, ADMIN, MEMBER</p>
        <p>Members can be invited with local mailbox token flow.</p>
        <p>Use API: <code>/v1/orgs</code>, <code>/v1/orgs/:orgId/members</code>, <code>/v1/orgs/:orgId/invites</code>.</p>
      </div>
    </div>
  );
}
