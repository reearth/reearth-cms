# Workspaces

A **workspace** is the top-level organizational unit in Re:Earth CMS. Everything in the CMS — projects, members, settings — lives inside a workspace.

## Overview

When a user signs up for Re:Earth CMS, a personal workspace is automatically created for them. Additional workspaces can be created to represent teams, departments, or organizations.

A workspace:
- Contains one or more **projects**
- Has a list of **members** with assigned **roles**
- Has its own **settings** (name, members, integrations)

## Member Roles

Each member of a workspace is assigned a role that controls what they can do within that workspace and its projects:

| Role | Level |
|---|---|
| **Owner** | Full control — can delete the workspace, manage all members, and perform all operations |
| **Maintainer** | Administrative control — can manage projects, models, and settings, but cannot delete the workspace |
| **Writer** | Content contributor — can create, edit, and publish content they own |
| **Reader** | Read-only — can view content but cannot make changes |

See [Workspace Roles](../07-roles-and-permissions/workspace-roles.md) for the full permission matrix.

## Personal Workspace

Every user has exactly one personal workspace, created automatically at sign-up. The personal workspace:
- Is owned by the user and cannot be deleted
- Has only the owner as a member (other users cannot be added to personal workspaces in the default configuration)
- Is used for personal projects

## Managing Members

To add members to a workspace:
1. Go to **Settings** → **Members**
2. Search for users by email or display name
3. Select the desired role
4. Click **Add Member**

Changing a member's role:
1. Find the member in the list
2. Use the role selector to change their role
3. The change takes effect immediately

Removing a member:
1. Find the member in the list
2. Click the remove (trash) icon

> **Safety check:** The system prevents removing the last Owner from a workspace. You must first assign the Owner role to another member.

## Integrations in Workspaces

Integrations (third-party applications) can also be members of a workspace. An integration member has a role just like a human member, and its permissions are enforced identically.

See [Integrations](./integrations.md) for details.

## Workspace Settings

Accessible at **Settings** → **General**:
- **Name** — the display name of the workspace
- **Workspace ID** — a unique identifier (read-only)

### 3D Viewer Resources (Tile & Terrain)

Re:Earth CMS workspaces support configuring **tile map** and **terrain** resources for the built-in 3D geospatial viewer. These settings are used by projects that render geographic content.

#### Tile Resources

Tile resources define the base map layers displayed in the viewer. Each tile resource has:

| Property | Description |
|---|---|
| **Type** | One of the built-in tile types or `URL` for a custom tile source |
| **Name** | Display label |
| **URL** | Tile endpoint (only for `URL` type) |
| **Image** | Preview thumbnail URL |

Built-in tile types:

| Type | Description |
|---|---|
| `DEFAULT` | Default base map |
| `LABELLED` | Base map with labels |
| `ROAD_MAP` | Road map style |
| `OPEN_STREET_MAP` | OpenStreetMap |
| `ESRI_TOPOGRAPHY` | ESRI topographic map |
| `EARTH_AT_NIGHT` | NASA Earth at Night imagery |
| `JAPAN_GSI_STANDARD_MAP` | Japan GSI standard map |
| `URL` | Custom tile endpoint |

#### Terrain Resources

Terrain resources control elevation data used for 3D terrain rendering. Each terrain resource has:

| Property | Description |
|---|---|
| **Type** | One of the built-in terrain providers or `CESIUM_ION` for a custom Cesium Ion asset |
| **Name** | Display label |
| **URL** | Terrain data endpoint |
| **Image** | Preview thumbnail URL |
| **Cesium Ion Asset ID** | Asset ID for Cesium Ion terrain (only for `CESIUM_ION` type) |
| **Cesium Ion Access Token** | Access token for Cesium Ion (only for `CESIUM_ION` type) |

Built-in terrain types:

| Type | Description |
|---|---|
| `CESIUM_WORLD_TERRAIN` | Cesium World Terrain (default) |
| `ARC_GIS_TERRAIN` | ArcGIS terrain service |
| `CESIUM_ION` | Custom Cesium Ion asset |

#### Configuring via API

```graphql
mutation {
  updateWorkspaceSettings(
    input: {
      id: "workspace-id"
      tiles: {
        resources: [
          {
            tile: {
              id: "tile-resource-id"
              type: DEFAULT
              props: { name: "Default Map", url: "", image: "" }
            }
          }
        ]
        selectedResource: "tile-resource-id"
        enabled: true
      }
      terrains: {
        resources: [
          {
            terrain: {
              id: "terrain-resource-id"
              type: CESIUM_WORLD_TERRAIN
              props: { name: "World Terrain", url: "", image: "", cesiumIonAssetId: "", cesiumIonAccessToken: "" }
            }
          }
        ]
        selectedResource: "terrain-resource-id"
        enabled: true
      }
    }
  ) {
    workspaceSettings { id }
  }
}
```

## API Access

The GraphQL API exposes workspace operations:
- `me { myWorkspace { ... } }` — get the current user's personal workspace
- `me { workspaces { ... } }` — list all workspaces the user belongs to
- `createWorkspace(input: ...)` — create a new workspace
- `updateWorkspace(input: ...)` — update workspace settings
- `deleteWorkspace(input: ...)` — delete a workspace (Owner only)
- `addMemberToWorkspace(input: ...)` — add a member
- `updateMemberOfWorkspace(input: ...)` — change a member's role
- `removeMemberFromWorkspace(input: ...)` — remove a member
