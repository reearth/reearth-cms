import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ExtendedColumns } from "./types";

import ContentTable, { Props } from ".";

const DEFAULT_PROPS: Props = {
  totalCount: 20,
  currentView: {},
  searchTerm: "",
  page: 1,
  pageSize: 10,
  loading: false,
  deleteLoading: false,
  publishLoading: false,
  unpublishLoading: false,
  selectedItem: undefined,
  selectedItems: { selectedRows: [] },
  onPublish: vi.fn(),
  onUnpublish: vi.fn(),
  onSearchTerm: vi.fn(),
  onFilterChange: vi.fn(),
  onContentTableChange: vi.fn(),
  onSelect: vi.fn(),
  onItemSelect: vi.fn(),
  onItemsReload: vi.fn(),
  onItemEdit: vi.fn(),
  contentTableFields: undefined,
  contentTableColumns: undefined,
  onItemDelete: vi.fn(),
  requests: [],
  addItemToRequestModalShown: false,
  onAddItemToRequest: vi.fn(),
  onAddItemToRequestModalClose: vi.fn(),
  onAddItemToRequestModalOpen: vi.fn(),
  onRequestTableChange: vi.fn(),
  requestModalLoading: false,
  requestModalTotalCount: 0,
  requestModalPage: 0,
  requestModalPageSize: 0,
  setCurrentView: vi.fn(),
  modelKey: undefined,
  onRequestSearchTerm: vi.fn(),
  onRequestTableReload: vi.fn(),
  hasDeleteRight: true,
  hasPublishRight: true,
  hasCreateRight: true,
  hasRequestUpdateRight: false,
  showPublishAction: false,
  onImportModalOpen: vi.fn(),
  hasModelFields: false,
};

describe("ContentTable", () => {
  test("ContentTable renders with default column and order", () => {
    const fieldList = ["field-1", "field-2"];
    const metadataList = ["meta-1", "meta-2"];

    const fieldsColumns: ExtendedColumns[] = fieldList.map(field => ({
      title: field,
      dataIndex: ["fields", field],
      fieldType: "FIELD" as const,
      key: field,
      ellipsis: true,
      type: "Text",
      typeProperty: undefined,
      width: 128,
      minWidth: 128,
      multiple: false,
      required: true,
      sorter: true,
      sortOrder: null,
      render: vi.fn(),
    }));

    const metadataColumns: ExtendedColumns[] = metadataList.map(meta => ({
      title: <>{meta}</>,
      dataIndex: ["metadata", meta],
      fieldType: "META_FIELD" as const,
      key: meta,
      ellipsis: true,
      type: "Text",
      typeProperty: undefined,
      width: 128,
      minWidth: 128,
      multiple: false,
      required: true,
      sorter: true,
      sortOrder: null,
      render: vi.fn(),
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
});
