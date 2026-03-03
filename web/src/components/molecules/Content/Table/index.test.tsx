import { render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";

import ContentTable, { Props } from ".";
import { ExtendedColumns } from "./types";

const DEFAULT_PROPS: Props = {
  addItemToRequestModalShown: false,
  contentTableColumns: undefined,
  contentTableFields: undefined,
  currentView: {},
  deleteLoading: false,
  hasCreateRight: true,
  hasDeleteRight: true,
  hasModelFields: false,
  hasPublishRight: true,
  hasRequestUpdateRight: false,
  loading: false,
  modelKey: undefined,
  onAddItemToRequest: vi.fn(),
  onAddItemToRequestModalClose: vi.fn(),
  onAddItemToRequestModalOpen: vi.fn(),
  onContentTableChange: vi.fn(),
  onFilterChange: vi.fn(),
  onImportModalOpen: vi.fn(),
  onItemDelete: vi.fn(),
  onItemEdit: vi.fn(),
  onItemSelect: vi.fn(),
  onItemsReload: vi.fn(),
  onPublish: vi.fn(),
  onRequestSearchTerm: vi.fn(),
  onRequestTableChange: vi.fn(),
  onRequestTableReload: vi.fn(),
  onSearchTerm: vi.fn(),
  onSelect: vi.fn(),
  onUnpublish: vi.fn(),
  page: 1,
  pageSize: 10,
  publishLoading: false,
  requestModalLoading: false,
  requestModalPage: 0,
  requestModalPageSize: 0,
  requestModalTotalCount: 0,
  requests: [],
  searchTerm: "",
  selectedItem: undefined,
  selectedItems: { selectedRows: [] },
  setCurrentView: vi.fn(),
  showPublishAction: false,
  totalCount: 20,
  unpublishLoading: false,
};

test("ContentTable renders with default column and order", () => {
  const fieldList = ["field-1", "field-2"];
  const metadataList = ["meta-1", "meta-2"];

  const fieldsColumns: ExtendedColumns[] = fieldList.map(field => ({
    dataIndex: ["fields", field],
    ellipsis: true,
    fieldType: "FIELD" as const,
    key: field,
    minWidth: 128,
    multiple: false,
    render: vi.fn(),
    required: true,
    sorter: true,
    sortOrder: null,
    title: field,
    type: "Text",
    typeProperty: undefined,
    width: 128,
  }));

  const metadataColumns: ExtendedColumns[] = metadataList.map(meta => ({
    dataIndex: ["metadata", meta],
    ellipsis: true,
    fieldType: "META_FIELD" as const,
    key: meta,
    minWidth: 128,
    multiple: false,
    render: vi.fn(),
    required: true,
    sorter: true,
    sortOrder: null,
    title: <>{meta}</>,
    type: "Text",
    typeProperty: undefined,
    width: 128,
  }));

  const overwrittenProps: Props = {
    ...DEFAULT_PROPS,
    contentTableColumns: [...fieldsColumns, ...metadataColumns],
  };

  render(<ContentTable {...overwrittenProps} />);

  const theadEl = screen.getByRole("rowgroup", {
    name: (_accessibleName, element) => element.classList.contains("ant-table-thead"),
  });
  const thEls = theadEl.querySelectorAll(".ant-table-cell");
  const thColumns = [...thEls].map(el => el.textContent);

  expect(thColumns).toEqual([
    "",
    "",
    "",
    "Status",
    ...fieldList,
    ...metadataList,
    "Created At",
    "Created By",
    "Updated At",
    "Updated By",
  ]);
});
