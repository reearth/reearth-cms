/* eslint-disable playwright/expect-expect */

/**
 * End-to-end tests for Workspace functionality in the CMS.
 * Tests the creation, updating, and management of workspaces that serve
 * as top-level organizational units for projects and teams.
 */

import { test } from "@reearth-cms/e2e/utils";

import {
  createWorkspace,
  createWorkspaceFromTab,
  deleteWorkspaceAfterUpdated,
  updateWorkspace,
} from "../project/utils/workspace";

/**
 * Tests the complete workspace lifecycle including:
 * - Workspace creation
 * - Workspace updates and modifications
 * - Workspace deletion
 * Verifies that all basic workspace operations work correctly
 */
test("Workspace CRUD has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  // Create new workspace and verify setup
  await createWorkspace(page);

  // Test update operations
  await updateWorkspace(page);

  // Test deletion process
  await deleteWorkspaceAfterUpdated(page);
});

/**
 * Tests the alternative workspace creation flow
 * Verifies that workspaces can be created successfully
 * through the tab interface
 */
test("Workspace Creating from tab has succeeded", async ({ reearth, page }) => {
  await reearth.goto("/", { waitUntil: "domcontentloaded" });

  // Create workspace using tab interface
  await createWorkspaceFromTab(page);
});
