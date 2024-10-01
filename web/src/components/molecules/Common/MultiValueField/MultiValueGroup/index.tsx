import styled from "@emotion/styled";
import dayjs from "dayjs";
import { useCallback, useEffect } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import { FormInstance } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import { FormItem, ItemAsset } from "@reearth-cms/components/molecules/Content/types";
import { Field, Group } from "@reearth-cms/components/molecules/Schema/types";
import { WorkspaceSettings } from "@reearth-cms/components/molecules/Workspace/types";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";

import GroupItem from "../../Form/GroupItem";
import { moveItemInArray } from "../moveItemArray";

interface Props {
  value?: string[];
  onChange?: (value: string[]) => void;
  parentField: Field;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: FormInstance<any>;
  fields?: Field[];
  loadingReference?: boolean;
  linkedItemsModalList?: FormItem[];
  linkItemModalTitle?: string;
  formItemsData?: FormItem[];
  itemAssets?: ItemAsset[];
  assetList?: Asset[];
  fileList?: UploadFile[];
  loadingAssets?: boolean;
  uploading?: boolean;
  uploadModalVisibility?: boolean;
  uploadUrl?: { url: string; autoUnzip: boolean };
  uploadType?: UploadType;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  linkItemModalTotalCount?: number;
  linkItemModalPage?: number;
  linkItemModalPageSize?: number;
  disabled?: boolean;
  workspaceSettings: WorkspaceSettings;
  onSearchTerm?: (term?: string) => void;
  onReferenceModelUpdate?: (modelId: string, referenceFieldId: string) => void;
  onLinkItemTableReload?: () => void;
  onLinkItemTableChange?: (page: number, pageSize: number) => void;
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
  onGroupGet: (id: string) => Promise<Group | undefined>;
  onCheckItemReference?: (value: string, correspondingFieldId: string) => Promise<boolean>;
}

const MultiValueGroup: React.FC<Props> = ({
  parentField,
  form,
  fields,
  value = [],
  onChange,
  loadingReference,
  linkedItemsModalList,
  linkItemModalTitle,
  formItemsData,
  itemAssets,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  uploadUrl,
  uploadType,
  totalCount,
  page,
  pageSize,
  linkItemModalTotalCount,
  linkItemModalPage,
  linkItemModalPageSize,
  disabled,
  workspaceSettings,
  onSearchTerm,
  onReferenceModelUpdate,
  onLinkItemTableReload,
  onLinkItemTableChange,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsGet,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
  onGroupGet,
  onCheckItemReference,
}) => {
  const t = useT();

  useEffect(() => {
    if (!value) onChange?.([]);
  }, [fields, onChange, value]);

  const handleInputDelete = useCallback(
    (key: number) => {
      onChange?.(
        value.filter((_, index: number) => {
          return index !== key;
        }),
      );
    },
    [onChange, value],
  );

  const handleAdd = useCallback(async () => {
    const currentValues = value || [];
    const itemGroupId = newID();

    if (Array.isArray(currentValues)) {
      onChange?.([...currentValues, itemGroupId]);
    } else {
      onChange?.([currentValues, itemGroupId]);
    }

    // set default value
    const newValues = { ...form?.getFieldsValue() };
    if (!parentField.typeProperty?.groupId) return;
    const group = await onGroupGet(parentField.typeProperty.groupId);
    group?.schema.fields.forEach((field: Field) => {
      const defaultValue = field.typeProperty?.defaultValue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setValue = (value: any) => {
        if (typeof newValues[field.id] === "object" && !Array.isArray(newValues[field.id])) {
          form?.setFieldValue([field.id, itemGroupId], value);
        } else {
          form?.setFieldValue(field.id, { [itemGroupId]: value });
        }
      };

      switch (field.type) {
        case "Select":
          setValue(field.typeProperty?.selectDefaultValue);
          break;
        case "Integer":
          setValue(field.typeProperty?.integerDefaultValue);
          break;
        case "Asset":
          setValue(field.typeProperty?.assetDefaultValue);
          break;
        case "Date":
          if (Array.isArray(defaultValue)) {
            setValue(defaultValue.map(valueItem => (valueItem ? dayjs(valueItem as string) : "")));
          } else if (defaultValue) {
            setValue(dayjs(defaultValue as string));
          } else {
            form?.setFieldValue([field.id, itemGroupId], "");
          }
          break;
        default:
          setValue(defaultValue);
          break;
      }
    });
  }, [form, onChange, onGroupGet, parentField.typeProperty?.groupId, value]);

  return (
    <div>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => {
          return (
            <FieldWrapper key={key}>
              <GroupItem
                order={key}
                value={valueItem}
                parentField={parentField}
                loadingReference={loadingReference}
                linkedItemsModalList={linkedItemsModalList}
                linkItemModalTitle={linkItemModalTitle}
                onSearchTerm={onSearchTerm}
                formItemsData={formItemsData}
                itemAssets={itemAssets}
                assetList={assetList}
                fileList={fileList}
                loadingAssets={loadingAssets}
                uploading={uploading}
                uploadModalVisibility={uploadModalVisibility}
                uploadUrl={uploadUrl}
                uploadType={uploadType}
                totalCount={totalCount}
                page={page}
                pageSize={pageSize}
                linkItemModalTotalCount={linkItemModalTotalCount}
                linkItemModalPage={linkItemModalPage}
                linkItemModalPageSize={linkItemModalPageSize}
                disabled={disabled}
                workspaceSettings={workspaceSettings}
                onReferenceModelUpdate={onReferenceModelUpdate}
                onLinkItemTableReload={onLinkItemTableReload}
                onLinkItemTableChange={onLinkItemTableChange}
                onAssetTableChange={onAssetTableChange}
                onUploadModalCancel={onUploadModalCancel}
                setUploadUrl={setUploadUrl}
                setUploadType={setUploadType}
                onAssetsCreate={onAssetsCreate}
                onAssetCreateFromUrl={onAssetCreateFromUrl}
                onAssetsGet={onAssetsGet}
                onAssetsReload={onAssetsReload}
                onAssetSearchTerm={onAssetSearchTerm}
                setFileList={setFileList}
                setUploadModalVisibility={setUploadModalVisibility}
                onMoveUp={() => onChange?.(moveItemInArray(value, key, key - 1))}
                onMoveDown={() => onChange?.(moveItemInArray(value, key, key + 1))}
                onDelete={() => handleInputDelete(key)}
                disableMoveUp={key === 0}
                disableMoveDown={key === value.length - 1}
                onGetAsset={onGetAsset}
                onGroupGet={onGroupGet}
                onCheckItemReference={onCheckItemReference}
              />
            </FieldWrapper>
          );
        })}
      {!disabled && (
        <Button icon={<Icon icon="plus" />} type="primary" onClick={handleAdd}>
          {t("New")}
        </Button>
      )}
    </div>
  );
};

export default MultiValueGroup;

const FieldWrapper = styled.div`
  display: flex;
  margin: 8px 0;
`;
