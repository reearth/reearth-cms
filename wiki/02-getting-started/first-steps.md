# First Steps

This guide walks you through the essential workflow in Re:Earth CMS: creating a workspace, a project, defining a content model, and creating your first content item.

## 1. Sign In

Open the Re:Earth CMS web UI in your browser. You will be redirected to the configured authentication provider (Auth0, Firebase, or Cognito) to sign in.

After signing in, you land on the **Workspace Dashboard**.

---

## 2. Create or Select a Workspace

A **workspace** is the top-level organizational container. Each user has a personal workspace created automatically on first sign-in.

To create a new workspace:
1. Click the workspace switcher in the top-left corner.
2. Select **New Workspace**.
3. Enter a name and confirm.

Workspaces are useful for separating teams or organizations. You can invite other users to a workspace and assign them roles.

---

## 3. Create a Project

A **project** holds your content models and assets.

1. From the workspace dashboard, click **New Project**.
2. Enter a **name** and optionally a description.
3. Choose a **visibility**:
   - **Private** — content is not publicly accessible (default)
   - **Public** — content can be accessed via the public API without authentication
4. Click **Create**.

You are now inside the project.

---

## 4. Define a Model

A **model** defines the structure of a type of content — similar to a database table or a content type in other CMS platforms.

1. In the left sidebar, click **Schema** (or the model list area).
2. Click **New Model**.
3. Enter a **name** (e.g. `Article`) and a **key** (URL-safe identifier, e.g. `article`).
4. Click **Create**.

### Add Fields to the Schema

With your model selected:
1. Click **Add Field**.
2. Choose a **field type** (see [Field Types](../04-field-types/overview.md) for the full list).
3. Configure the field:
   - **Name** — display name (e.g. `Title`)
   - **Key** — API key (e.g. `title`)
   - **Required** — whether the field must have a value
   - **Multiple** — whether multiple values are allowed
   - **Unique** — whether values must be unique across items
4. Click **OK** to save the field.

Repeat to add all the fields your model needs.

**Example schema for an `Article` model:**

| Field | Type | Required |
|---|---|---|
| Title | Text | Yes |
| Body | RichText | No |
| Published Date | Date | No |
| Cover Image | Asset | No |
| Tags | Tag | No |
| Location | GeometryObject | No |

---

## 5. Create a Content Item

1. In the left sidebar, click the model name (e.g. `Article`).
2. Click **New Item** (or the **+** button).
3. The item editor opens. Fill in the fields.
4. Click **Save** to save as a **Draft**.

The item now has a **DRAFT** status, meaning it is not yet publicly visible via the API.

---

## 6. Publish an Item

To make an item publicly accessible:

1. Open the item editor.
2. Click **Publish**.
3. The item status changes to **PUBLIC**.

It is now accessible via the public API at:
```
GET /api/projects/{projectAlias}/models/{modelKey}/items
```

---

## 7. Upload an Asset

Assets are files (images, GeoJSON, 3D Tiles, CSV, etc.) associated with a project.

1. Click **Assets** in the left sidebar.
2. Click **Upload**.
3. Select a file from your computer (or enter a URL).
4. The asset is uploaded and its preview type is detected automatically.

You can then reference the asset in an **Asset** field of any item in the project.

---

## 8. Invite Team Members (optional)

To collaborate with others:

1. Go to **Settings** → **Members**.
2. Search for users by email or name.
3. Select a **role**:
   - **Reader** — read-only access
   - **Writer** — can create and edit content
   - **Maintainer** — can manage models and settings
   - **Owner** — full control
4. Click **Add Member**.

---

## Next Steps

- Learn about all available [Field Types](../04-field-types/overview.md)
- Set up [Integrations and Webhooks](../03-concepts/integrations.md)
- Explore the [GraphQL API](../05-api/graphql-api.md)
- Import data in bulk with [Import Items](../06-import-export/import-items.md)
- Understand [Roles and Permissions](../07-roles-and-permissions/overview.md)
