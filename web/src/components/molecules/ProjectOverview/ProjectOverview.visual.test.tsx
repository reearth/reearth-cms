import { describe, expect, test } from "vitest";
import { page } from "@vitest/browser/context";
import { render } from "vitest-browser-react";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { expectScreenshot, VRTWrapper } from "@reearth-cms/test/vrt-utils";

import ProjectOverview from ".";

const noop = () => {};
const noopAsync = async () => {};

const mockModel: Model = {
  id: "model-1",
  name: "Test Model",
  description: "A test model for visual regression testing",
  key: "test-model",
  schemaId: "schema-1",
  schema: { id: "schema-1", fields: [] },
  metadataSchema: { id: "meta-1", fields: [] },
};

const mockModel2: Model = {
  id: "model-2",
  name: "Another Model",
  description: "Another model with a longer description for testing layout",
  key: "another-model",
  schemaId: "schema-2",
  schema: { id: "schema-2", fields: [] },
  metadataSchema: { id: "meta-2", fields: [] },
};

const mockModel3: Model = {
  id: "model-3",
  name: "Third Model",
  description: "",
  key: "third-model",
  schemaId: "schema-3",
  schema: { id: "schema-3", fields: [] },
  metadataSchema: { id: "meta-3", fields: [] },
};

describe("[Visual] ProjectOverview", () => {
  test("empty state", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <ProjectOverview
            models={[]}
            hasCreateRight={true}
            hasUpdateRight={true}
            hasDeleteRight={true}
            hasSchemaCreateRight={true}
            hasContentCreateRight={true}
            onProjectUpdate={noopAsync}
            onModelSearch={noop}
            onModelSort={noop}
            onModelModalOpen={noop}
            onHomeNavigation={noop}
            onSchemaNavigate={noop}
            onImportSchemaNavigate={noop}
            onContentNavigate={noop}
            onImportContentNavigate={noop}
            onModelDeletionModalOpen={noopAsync}
            onModelUpdateModalOpen={noopAsync}
            onModelExport={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("with model cards", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <ProjectOverview
            models={[mockModel, mockModel2, mockModel3]}
            hasCreateRight={true}
            hasUpdateRight={true}
            hasDeleteRight={true}
            hasSchemaCreateRight={true}
            hasContentCreateRight={true}
            onProjectUpdate={noopAsync}
            onModelSearch={noop}
            onModelSort={noop}
            onModelModalOpen={noop}
            onHomeNavigation={noop}
            onSchemaNavigate={noop}
            onImportSchemaNavigate={noop}
            onContentNavigate={noop}
            onImportContentNavigate={noop}
            onModelDeletionModalOpen={noopAsync}
            onModelUpdateModalOpen={noopAsync}
            onModelExport={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });

  test("no create permission", async () => {
    await render(
      <VRTWrapper>
        <div data-testid={DATA_TEST_ID.VRT__Root}>
          <ProjectOverview
            models={[]}
            hasCreateRight={false}
            hasUpdateRight={false}
            hasDeleteRight={false}
            hasSchemaCreateRight={false}
            hasContentCreateRight={false}
            onProjectUpdate={noopAsync}
            onModelSearch={noop}
            onModelSort={noop}
            onModelModalOpen={noop}
            onHomeNavigation={noop}
            onSchemaNavigate={noop}
            onImportSchemaNavigate={noop}
            onContentNavigate={noop}
            onImportContentNavigate={noop}
            onModelDeletionModalOpen={noopAsync}
            onModelUpdateModalOpen={noopAsync}
            onModelExport={noopAsync}
          />
        </div>
      </VRTWrapper>,
    );
    await expectScreenshot();
  });
});
