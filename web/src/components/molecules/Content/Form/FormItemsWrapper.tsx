import styled from "@emotion/styled";

import { FormInstance } from "@reearth-cms/components/atoms/Form";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { FormItem, ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { Field, Group } from "@reearth-cms/components/molecules/Schema/types";

import { AssetField, GroupField, ReferenceField } from "./fields/ComplexFieldComponents";
import { FIELD_TYPE_COMPONENT_MAP } from "./fields/FieldTypesMap";

type Props = {
  fields?: Field[];
  disabled: boolean;
  assetProps: {
    assetList?: Asset[];
    itemAssets?: ItemAsset[];
    fileList?: UploadFile[];
    loadingAssets?: boolean;
    uploading?: boolean;
    uploadModalVisibility?: boolean;
    uploadUrl?: { url: string; autoUnzip: boolean };
    uploadType?: UploadType;
    totalCount?: number;
    page?: number;
    pageSize?: number;
    onAssetTableChange?: (page: number, pageSize: number, sorter?: SortType) => void;
    onUploadModalCancel?: () => void;
    setUploadUrl?: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
    setUploadType?: (type: UploadType) => void;
    onAssetsCreate?: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
    onAssetCreateFromUrl?: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
    onAssetsGet?: () => void;
    onAssetsReload?: () => void;
    onAssetSearchTerm?: (term?: string | undefined) => void;
    setFileList?: (fileList: UploadFile<File>[]) => void;
    setUploadModalVisibility?: (visible: boolean) => void;
    onGetAsset: (assetId: string) => Promise<string | undefined>;
  };
  referenceProps: {
    referencedItems: FormItem[];
    loadingReference?: boolean;
    linkedItemsModalList?: FormItem[];
    linkItemModalTitle?: string;
    linkItemModalTotalCount?: number;
    linkItemModalPage?: number;
    linkItemModalPageSize?: number;
    onReferenceModelUpdate?: (modelId: string, referenceFieldId: string) => void;
    onSearchTerm?: (term?: string) => void;
    onLinkItemTableReload?: () => void;
    onLinkItemTableChange?: (page: number, pageSize: number) => void;
    onCheckItemReference?: (
      itemId: string,
      correspondingFieldId: string,
      groupId?: string,
    ) => Promise<boolean>;
  };
  groupProps: {
    form: FormInstance<unknown>;
    onGroupGet: (id: string) => Promise<Group | undefined>;
  };
};

const FormItemsWrapper: React.FC<Props> = ({
  fields,
  disabled,
  assetProps,
  referenceProps,
  groupProps,
}) => {
  return (
    <Wrapper>
      {fields?.map(field => {
        if (field.type === "Asset") {
          return (
            <StyledFormItemWrapper key={field.id}>
              <AssetField field={field} disabled={disabled} {...assetProps} />
            </StyledFormItemWrapper>
          );
        } else if (field.type === "Reference") {
          return (
            <StyledFormItemWrapper key={field.id}>
              <ReferenceField field={field} disabled={disabled} {...referenceProps} />
            </StyledFormItemWrapper>
          );
        } else if (field.type === "Group") {
          return (
            <StyledFormItemWrapper key={field.id} isFullWidth>
              <GroupField
                field={field}
                disabled={disabled}
                {...assetProps}
                {...referenceProps}
                {...groupProps}
              />
            </StyledFormItemWrapper>
          );
        } else {
          const FieldComponent = FIELD_TYPE_COMPONENT_MAP[field.type];
          return (
            <StyledFormItemWrapper
              key={field.id}
              isFullWidth={field.type === "GeometryObject" || field.type === "GeometryEditor"}>
              <FieldComponent field={field} disabled={disabled} />
            </StyledFormItemWrapper>
          );
        }
      })}
    </Wrapper>
  );
};

const StyledFormItemWrapper = styled.div<{ isFullWidth?: boolean }>`
  max-width: ${({ isFullWidth }) => (isFullWidth ? undefined : "500px")};
  word-wrap: break-word;
`;

const Wrapper = styled.div`
  max-height: calc(100% - 72px);
  overflow-y: auto;
  padding: 36px;
  border-top: 1px solid #00000008;
`;

export default FormItemsWrapper;
