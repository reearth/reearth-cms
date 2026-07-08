import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test, vi } from "vitest";

import ContentListMolecule, { type Props as ContentListMoleculeProps } from ".";

const DEFAULT_PROPS: ContentListMoleculeProps = {
  commentsPanel: <div />,
  viewsMenu: <div />,
  collapsed: false,
  model: {
    id: "model-1",
    name: "Test Model",
    key: "test-model",
    description: "",
    schemaId: "schema-1",
    schema: { id: "schema-1", fields: [] },
    metadataSchema: {},
  },
  contentTableFields: [],
  loading: false,
  deleteLoading: false,
  publishLoading: false,
  unpublishLoading: false,
  contentTableColumns: [],
  modelsMenu: <div />,
  selectedItem: undefined,
  selectedItems: { selectedRows: [] },
  totalCount: 1,
  currentView: {},
  searchTerm: "",
  page: 1,
  pageSize: 10,
  requestModalLoading: false,
  requestModalTotalCount: 0,
  requestModalPage: 0,
  requestModalPageSize: 0,
  setCurrentView: vi.fn(),
  onRequestTableChange: vi.fn(),
  onSearchTerm: vi.fn(),
  onFilterChange: vi.fn(),
  onContentTableChange: vi.fn(),
  onPublish: vi.fn(),
  onUnpublish: vi.fn(),
  onItemSelect: vi.fn(),
  onSelect: vi.fn(),
  onCollapse: vi.fn(),
  onItemAdd: vi.fn(),
  onItemsReload: vi.fn(),
  onItemEdit: vi.fn(),
  onItemDelete: vi.fn(),
  requests: [],
  addItemToRequestModalShown: false,
  onAddItemToRequest: vi.fn(),
  onAddItemToRequestModalClose: vi.fn(),
  onAddItemToRequestModalOpen: vi.fn(),
  onRequestSearchTerm: vi.fn(),
  onRequestTableReload: vi.fn(),
  hasCreateRight: true,
  hasDeleteRight: true,
  hasPublishRight: true,
  hasRequestUpdateRight: false,
  showPublishAction: false,
  onImportModalOpen: vi.fn(),
  onContentExport: vi.fn(),
  exportContentLoading: false,
  modelFields: [],
  hasModelFields: true,
};

test("export menu item renders with icon wrapper for vertical alignment", async () => {
  const user = userEvent.setup();
  render(<ContentListMolecule {...DEFAULT_PROPS} />);

  const moreButton = screen.getByRole("button", { name: "more" });
  await user.click(moreButton);

  const exportMenuItem = await screen.findByText("Export");
  expect(exportMenuItem).toBeInTheDocument();

  const menuItem = exportMenuItem.closest(".ant-dropdown-menu-submenu");
  const iconContainer = menuItem?.querySelector(".ant-dropdown-menu-item-icon");
  expect(iconContainer).toBeInTheDocument();
  // IconWrapper span wraps the Icon component's inner span
  const iconWrapper = iconContainer?.firstElementChild;
  expect(iconWrapper?.tagName).toBe("SPAN");
  expect(iconWrapper?.children.length).toBeGreaterThan(0);
});

test("export menu item shows loading icon when exporting", async () => {
  const user = userEvent.setup();
  render(<ContentListMolecule {...DEFAULT_PROPS} exportContentLoading={true} />);

  const moreButton = screen.getByRole("button", { name: "more" });
  await user.click(moreButton);

  const exportMenuItem = await screen.findByText("Export");
  expect(exportMenuItem).toBeInTheDocument();
});
