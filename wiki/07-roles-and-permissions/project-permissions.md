# Project Permissions

This page explains how permissions are enforced at the project level and how the backend implements access control.

## Permission Enforcement Points

Permissions are enforced at two levels:

1. **Frontend** — the UI hides or disables buttons and forms based on the user's role. This is a UX convenience only; it does not replace backend enforcement.
2. **Backend** — the use case layer checks permissions before every operation. Invalid or unauthorized requests return an error regardless of how they arrive.

---

## Backend Permission Model

### The Operator

Every API request resolves to an **Operator** — a struct containing:
- The identity (user ID or integration ID)
- Lists of workspace IDs the operator can read, write, maintain, or own
- Lists of project IDs the operator can read, write, maintain, or own

```go
type Operator struct {
    ReadableProjects     project.IDList
    WritableProjects     project.IDList
    MaintainableProjects project.IDList
    OwningProjects       project.IDList
    // ...
}
```

Permission checks are method calls on the Operator:

```go
operator.IsWritableProject(projectID)    // true for WRITER, MAINTAINER, OWNER
operator.IsMaintainingProject(projectID) // true for MAINTAINER, OWNER
operator.IsOwningProject(projectID)      // true for OWNER only
```

### Ownership Check

For update/delete operations by WRITERs, an additional ownership check is applied:

```go
func (o *Operator) CanUpdate(obj Ownable) bool {
    isMaintainer := o.IsMaintainingProject(obj.Project())
    isWriter     := o.IsWritableProject(obj.Project())
    return isMaintainer || (isWriter && o.Owns(obj)) || o.Machine
}

func (o *Operator) Owns(obj Ownable) bool {
    return (o.AcOperator != nil && o.AcOperator.User != nil && obj.User() != nil && *o.AcOperator.User == *obj.User()) ||
           (o.Integration != nil && obj.Integration() != nil && *o.Integration == *obj.Integration())
}
```

This means:
- A MAINTAINER can update/delete any item
- A WRITER can only update/delete items they created
- A machine (M2M) operator can always update/delete

---

## Per-Resource Permission Summary

### Workspace Resources

| Operation | Required Check |
|---|---|
| Read workspace | `IsReadableWorkspace` |
| Update workspace | `IsOwningWorkspace` |
| Delete workspace | `IsOwningWorkspace` |
| Add member | `IsMaintainingWorkspace` |
| Remove member | `IsMaintainingWorkspace` |
| Change member role | `IsMaintainingWorkspace` |

### Project Resources

| Operation | Required Check |
|---|---|
| Read project | `IsReadableProject` |
| Create project | `IsWritableWorkspace` |
| Update project | `IsMaintainingProject` |
| Delete project | `IsMaintainingProject` |
| Publish project | `IsMaintainingProject` |

### Model and Schema

| Operation | Required Check |
|---|---|
| Read model/schema | `IsReadableProject` |
| Create model | `IsWritableProject` |
| Update model | `IsWritableProject` |
| Delete model | `IsWritableProject` |
| Create/update/delete field | `IsWritableProject` |

### Items

| Operation | Required Check |
|---|---|
| Read item | `IsReadableProject` |
| Create item | `IsWritableProject` |
| Update item | `CanUpdate(item)` (maintainer or owner of item) |
| Delete item | `CanUpdate(item)` (maintainer or owner of item) |
| Publish item | `IsWritableProject` |
| Unpublish item | `IsWritableProject` |

### Assets

| Operation | Required Check |
|---|---|
| Read asset | `IsReadableProject` |
| Upload asset | `IsWritableProject` |
| Update asset | `CanUpdate(asset)` (maintainer or owner of asset) |
| Delete asset | `CanUpdate(asset)` (maintainer or owner of asset) |

### Requests

| Operation | Required Check |
|---|---|
| Read request | `IsReadableProject` |
| Create request | `IsWritableProject` |
| Update request | `CanUpdate(request)` |
| Approve request | `IsMaintainingProject` |
| Close request | `CanUpdate(request)` |

---

## Public API Permissions

The public REST API (unauthenticated or with API key) accesses resources as follows:
- Only items with status `PUBLIC` are returned
- Only assets marked as `public: true` are accessible
- Private resources return `404` (not `401`) to avoid leaking resource existence
- Write operations always require a valid auth token

---

## Integration Permissions

When an integration is connected to a workspace or project with a specific role:
- The integration's operator resolves to the assigned role
- The same permission checks apply as for human users with that role
- Ownership checks use the integration's ID rather than a user ID

---

## Frontend Permission Source

The frontend derives permissions from `web/src/components/organisms/CMSWrapper/utils.ts`, which maps each role to a `UserRights` object. This is used to conditionally render UI elements.

The `null` values for WRITER's update/delete permissions mean "ownership-dependent" — the UI shows the button if the user is the creator, and hides it if they are not.
