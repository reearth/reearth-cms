# Workspace Roles

This page describes in detail what each role can and cannot do in Re:Earth CMS.

## OWNER

The highest privilege level. Workspace Owners have unrestricted access to all operations.

**Unique to OWNER:**
- Delete the workspace
- Transfer workspace ownership (by managing roles)

**Can do everything MAINTAINER can do, plus:**
- Delete workspace

---

## MAINTAINER

Administrative role for team leads and project managers. MAINTAINERs can manage all content, models, and workspace settings but cannot delete the workspace itself.

**Can do:**
- All content operations (create, read, update, delete, publish)
- Manage models and schemas (create, update, delete)
- Manage workspace settings
- Invite, remove, and change roles of members
- Connect, update, and delete integrations
- Create, update, and delete saved views
- Approve and close requests
- Create and manage API keys

**Cannot do:**
- Delete the workspace
- Change an Owner's role (safety restriction)

---

## WRITER

Content contributor role. WRITERs can create and manage content but with ownership-based restrictions on editing and deleting resources created by others.

**Can do:**
- Create, read, and publish items and assets
- Edit and delete **their own** items and assets (ownership-based)
- Manage models (create, update, delete)
- Manage schema fields (create, update, delete)
- Create requests and update their own requests
- Post and edit their own comments
- Create and read API keys (cannot update/delete)
- Leave the workspace

**Cannot do:**
- Edit or delete items/assets created by other users
- Manage workspace settings
- Invite, remove, or change roles of other members
- Connect, update, or delete integrations
- Create, update, or delete saved views
- Approve requests

**Special behavior:**
- Content update/delete: `null` (only if owner of the item/asset)
- Request update/close: `null` (only if creator of the request)
- Comment update/delete: `null` (only if author of the comment)

---

## READER

Read-only role for stakeholders, external reviewers, or consumers who only need to view content.

**Can do:**
- Read all items, assets, models, schemas, views, requests, and comments
- View API keys (not create or manage)
- Leave the workspace

**Cannot do:**
- Create, update, or delete anything
- Publish or unpublish items
- Approve or close requests
- Manage workspace settings or members

---

## Role Comparison Table

| Permission | OWNER | MAINTAINER | WRITER | READER |
|---|---|---|---|---|
| **Workspace** | | | | |
| Update workspace | Yes | No | No | No |
| Delete workspace | Yes | No | No | No |
| **Workspace Settings** | | | | |
| Update settings | Yes | Yes | No | No |
| **Members** | | | | |
| Invite members | Yes | Yes | No | No |
| Remove members | Yes | Yes | No | No |
| Change member roles | Yes | Yes | No | No |
| Leave workspace | Yes | Yes | Yes | Yes |
| **Integrations** | | | | |
| Connect integrations | Yes | Yes | No | No |
| Update integrations | Yes | Yes | No | No |
| Delete integrations | Yes | Yes | No | No |
| **Projects** | | | | |
| Create project | Yes | Yes | Yes | No |
| Read project | Yes | Yes | Yes | Yes |
| Update project | Yes | Yes | No | No |
| Delete project | Yes | Yes | Yes* | No |
| Publish project | Yes | Yes | Yes | No |
| **Models** | | | | |
| Create model | Yes | Yes | Yes | No |
| Read model | Yes | Yes | Yes | Yes |
| Update model | Yes | Yes | Yes | No |
| Delete model | Yes | Yes | Yes | No |
| **Schema** | | | | |
| Create field | Yes | Yes | Yes | No |
| Read schema | Yes | Yes | Yes | Yes |
| Update field | Yes | Yes | Yes | No |
| Delete field | Yes | Yes | Yes | No |
| **Views** | | | | |
| Create view | Yes | Yes | No | No |
| Read view | Yes | Yes | Yes | Yes |
| Update view | Yes | Yes | No | No |
| Delete view | Yes | Yes | No | No |
| **Content (Items)** | | | | |
| Create item | Yes | Yes | Yes | No |
| Read item | Yes | Yes | Yes | Yes |
| Update item | Yes | Yes | Own only | No |
| Delete item | Yes | Yes | Own only | No |
| Publish item | Yes | Yes | Yes | No |
| **Assets** | | | | |
| Upload asset | Yes | Yes | Yes | No |
| Read asset | Yes | Yes | Yes | Yes |
| Update asset | Yes | Yes | Own only | No |
| Delete asset | Yes | Yes | Own only | No |
| **Requests** | | | | |
| Create request | Yes | Yes | Yes | No |
| Read request | Yes | Yes | Yes | Yes |
| Update request | Yes | Yes | Own only | No |
| Close request | Yes | Yes | Own only | No |
| Approve request | Yes | Yes | No | No |
| **Comments** | | | | |
| Post comment | Yes | Yes | Yes | No |
| Read comment | Yes | Yes | Yes | Yes |
| Edit comment | Yes | Yes | Own only | No |
| Delete comment | Yes | Yes | Own only | No |
| **API Keys** | | | | |
| Create API key | Yes | Yes | Yes | No |
| Read API key | Yes | Yes | Yes | Yes |
| Update API key | Yes | Yes | No | No |
| Delete API key | Yes | Yes | No | No |

*WRITER can delete a project they created (frontend permission allows it), but backend enforces project-level restrictions.

> **"Own only"** means the operation is allowed only on resources the WRITER themselves created.
