# Roles and Permissions Overview

Re:Earth CMS uses a **role-based access control (RBAC)** system. Permissions are assigned at the **workspace level** via roles. All projects within a workspace inherit the member's workspace role.

## The Four Roles

| Role | Level | Description |
|---|---|---|
| **OWNER** | Full control | Can do everything, including deleting the workspace |
| **MAINTAINER** | Administrative | Can manage projects, models, schemas, and members; cannot delete the workspace |
| **WRITER** | Contributor | Can create and edit content they own; can publish; cannot manage workspace settings |
| **READER** | Read-only | Can view content but cannot create, edit, or delete anything |

## Role Hierarchy

Roles are **cumulative** — higher roles include all permissions of lower roles:

```
READER ⊂ WRITER ⊂ MAINTAINER ⊂ OWNER
```

An OWNER has all MAINTAINER, WRITER, and READER permissions.

## Ownership-Based Restrictions for WRITER

The **WRITER** role has a special behavior for update and delete operations on content and assets:

- A WRITER can **edit or delete** only items and assets they **created** (ownership-based)
- A WRITER **cannot** edit or delete items/assets created by other users
- A WRITER **can publish** any item in the project regardless of who created it
- The `null` permission values in the matrix (see [Project Permissions](./project-permissions.md)) mean "only if owner"

This is enforced at the backend via the `CanUpdate(obj Ownable)` method:
```go
func (o *Operator) CanUpdate(obj Ownable) bool {
    isMaintainer := o.IsMaintainingProject(obj.Project())
    isWriter := o.IsWritableProject(obj.Project())
    return isMaintainer || (isWriter && o.Owns(obj)) || o.Machine
}
```

## Assigning Roles

Roles are assigned when adding members to a workspace:
1. Go to **Settings** → **Members**
2. Search for a user by email or name
3. Select the role from the dropdown
4. Click **Add Member**

Roles can be changed later by workspace Owners and Maintainers.

## Integration Roles

Integrations can also be workspace/project members with a role. The same permission rules apply to integrations as to human users.

## Public API Access

The public API (unauthenticated access) effectively operates with read-only permissions on public projects. It is equivalent to anonymous access — no write operations are possible without a token.

## Further Reading

- [Workspace Roles](./workspace-roles.md) — detailed description of each role
- [Project Permissions](./project-permissions.md) — full permission matrix by resource type
