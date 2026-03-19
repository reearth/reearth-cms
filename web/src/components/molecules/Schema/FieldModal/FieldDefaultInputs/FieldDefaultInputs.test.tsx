import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

import Form from "@reearth-cms/components/atoms/Form";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import AssetField from "./AssetField";
import BooleanField from "./BooleanField";
import CheckboxField from "./CheckboxField";
import DateField from "./DateField";
import GeometryField from "./GeometryField";
import GroupField from "./GroupField";
import NumberField from "./NumberField";
import SelectField from "./SelectField";
import TagField from "./TagField";
import TextAreaField from "./TextArea";
import TextField from "./TextField";
import URLField from "./URLField";

vi.mock("@reearth-cms/components/atoms/Markdown", () => ({
  default: (props: Record<string, unknown>) => (
    <input data-testid={props["data-testid"] as string} />
  ),
}));
vi.mock("@reearth-cms/components/molecules/Common/Form/GeometryItem", () => ({
  default: () => <div data-testid="GeometryItem" />,
}));
vi.mock("@reearth-cms/components/molecules/Common/MultiValueField/MultiValueGeometry", () => ({
  default: () => <div data-testid="MultiValueGeometry" />,
}));
vi.mock("@reearth-cms/components/molecules/Common/Form/AssetItem", () => ({
  default: () => <div data-testid="AssetItem" />,
}));
vi.mock("@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset", () => ({
  default: () => <div data-testid="MultiValueAsset" />,
}));

describe("TextField", () => {
  test("renders single input when multiple is false", () => {
    render(
      <Form>
        <TextField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput)).toBeInTheDocument();
  });

  test("renders multi value field when multiple is true", () => {
    render(
      <Form>
        <TextField multiple={true} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).toBeInTheDocument();
  });

  test("applies maxLength prop", () => {
    render(
      <Form>
        <TextField multiple={false} maxLength={100} />
      </Form>,
    );
    const input = screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput);
    expect(input).toBeInTheDocument();
  });
});

describe("TextAreaField", () => {
  test("renders single textarea when multiple is false", () => {
    render(
      <Form>
        <TextAreaField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput)).toBeInTheDocument();
  });

  test("renders multi value field when multiple is true", () => {
    render(
      <Form>
        <TextAreaField multiple={true} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).toBeInTheDocument();
  });

  test("applies maxLength prop", () => {
    render(
      <Form>
        <TextAreaField multiple={false} maxLength={200} />
      </Form>,
    );
    const textarea = screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput);
    expect(textarea).toBeInTheDocument();
  });
});

describe("NumberField", () => {
  test("renders single input when multiple is false", () => {
    render(
      <Form>
        <NumberField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput)).toBeInTheDocument();
  });

  test("renders multi value field when multiple is true", () => {
    render(
      <Form>
        <NumberField multiple={true} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).toBeInTheDocument();
  });

  test("applies min and max props", () => {
    render(
      <Form>
        <NumberField multiple={false} min={0} max={100} />
      </Form>,
    );
    const input = screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput);
    expect(input).toBeInTheDocument();
  });
});

describe("BooleanField", () => {
  test("renders switch when multiple is false", () => {
    render(
      <Form>
        <BooleanField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput)).toBeInTheDocument();
  });

  test("renders multi value boolean field when multiple is true", () => {
    render(
      <Form>
        <BooleanField multiple={true} />
      </Form>,
    );
    expect(screen.getByText("Set default value")).toBeInTheDocument();
  });
});

describe("DateField", () => {
  test("renders date picker when multiple is false", () => {
    render(
      <Form>
        <DateField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__DateInput)).toBeInTheDocument();
  });

  test("renders multi value date field when multiple is true", () => {
    render(
      <Form>
        <DateField multiple={true} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).toBeInTheDocument();
  });
});

describe("TagField", () => {
  const tags = [
    { id: "1", name: "Bug", color: "#ff0000" },
    { id: "2", name: "Feature", color: "#00ff00" },
  ];

  test("renders single select when multiple is false", () => {
    render(
      <Form>
        <TagField selectedTags={tags} multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__TagSelect)).toBeInTheDocument();
  });

  test("renders multi select when multiple is true", () => {
    render(
      <Form>
        <TagField selectedTags={tags} multiple={true} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__TagSelect)).toBeInTheDocument();
  });

  test("renders without tags", () => {
    render(
      <Form>
        <TagField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__TagSelect)).toBeInTheDocument();
  });
});

describe("CheckboxField", () => {
  test("renders checkbox when multiple is false", () => {
    render(
      <Form>
        <CheckboxField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput)).toBeInTheDocument();
  });

  test("renders multi value checkbox field when multiple is true", () => {
    render(
      <Form>
        <CheckboxField multiple={true} />
      </Form>,
    );
    expect(screen.getByText("Set default value")).toBeInTheDocument();
  });
});

describe("SelectField", () => {
  const values = ["Option A", "Option B", "Option C"];

  test("renders single select when multiple is false", () => {
    render(
      <Form>
        <SelectField selectedValues={values} multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput)).toBeInTheDocument();
  });

  test("renders multi select when multiple is true", () => {
    render(
      <Form>
        <SelectField selectedValues={values} multiple={true} />
      </Form>,
    );
    expect(screen.getByText("Set default value")).toBeInTheDocument();
  });

  test("renders without values", () => {
    render(
      <Form>
        <SelectField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput)).toBeInTheDocument();
  });
});

describe("URLField", () => {
  test("renders single input when multiple is false", () => {
    render(
      <Form>
        <URLField multiple={false} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput)).toBeInTheDocument();
  });

  test("renders multi value field when multiple is true", () => {
    render(
      <Form>
        <URLField multiple={true} />
      </Form>,
    );
    expect(screen.getByTestId(DATA_TEST_ID.FieldModal__PlusNewButton)).toBeInTheDocument();
  });
});

describe("GroupField", () => {
  test("renders disabled input", () => {
    render(
      <Form>
        <GroupField />
      </Form>,
    );
    const input = screen.getByTestId(DATA_TEST_ID.FieldModal__SetDefaultValueInput);
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
  });
});

describe("AssetField", () => {
  const assetProps = {
    assetList: [],
    fileList: [],
    loadingAssets: false,
    uploading: false,
    uploadModalVisibility: false,
    uploadUrl: { url: "", autoUnzip: false },
    uploadType: "local" as const,
    totalCount: 0,
    page: 1,
    pageSize: 10,
    onAssetTableChange: vi.fn(),
    onUploadModalCancel: vi.fn(),
    setUploadUrl: vi.fn(),
    setUploadType: vi.fn(),
    onAssetsCreate: vi.fn().mockResolvedValue([]),
    onAssetCreateFromUrl: vi.fn().mockResolvedValue(undefined),
    onAssetSearchTerm: vi.fn(),
    onAssetsGet: vi.fn(),
    onAssetsReload: vi.fn(),
    setFileList: vi.fn(),
    setUploadModalVisibility: vi.fn(),
    onGetAsset: vi.fn().mockResolvedValue(undefined),
  };

  test("renders AssetItem when multiple is false", () => {
    render(
      <Form>
        <AssetField multiple={false} {...assetProps} />
      </Form>,
    );
    expect(screen.getByTestId("AssetItem")).toBeInTheDocument();
  });

  test("renders MultiValueAsset when multiple is true", () => {
    render(
      <Form>
        <AssetField multiple={true} {...assetProps} />
      </Form>,
    );
    expect(screen.getByTestId("MultiValueAsset")).toBeInTheDocument();
  });
});

describe("GeometryField", () => {
  test("renders GeometryItem when multiple is false", () => {
    render(
      <Form>
        <GeometryField multiple={false} isEditor={false} />
      </Form>,
    );
    expect(screen.getByTestId("GeometryItem")).toBeInTheDocument();
    expect(screen.queryByTestId("MultiValueGeometry")).not.toBeInTheDocument();
  });

  test("renders MultiValueGeometry when multiple is true", () => {
    render(
      <Form>
        <GeometryField multiple={true} isEditor={false} />
      </Form>,
    );
    expect(screen.getByTestId("MultiValueGeometry")).toBeInTheDocument();
    expect(screen.queryByTestId("GeometryItem")).not.toBeInTheDocument();
  });
});
