import styled from "@emotion/styled";
import moment from "moment";
import { useCallback, useEffect, useMemo } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import { FormInstance } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { FormItem } from "@reearth-cms/components/molecules/Content/types";
import { Field, Group } from "@reearth-cms/components/molecules/Schema/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { newID } from "@reearth-cms/utils/id";

import GroupItem from "../../Form/GroupItem";
import { moveItemInArray } from "../moveItemArray";

type Props = {
  className?: string;
  value?: string[];
  onChange?: (value: string[]) => void;
  parentField: Field;
  form?: FormInstance<any>;
  groups?: Group[];
  fields?: Field[];
  linkedItemsModalList?: FormItem[];
  formItemsData: FormItem[];
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadUrl: { url: string; autoUnzip: boolean };
  uploadType: UploadType;
  totalCount: number;
  page: number;
  pageSize: number;
  linkItemModalTotalCount: number;
  linkItemModalPage: number;
  linkItemModalPageSize: number;
  onReferenceModelUpdate: (modelId?: string) => void;
  onLinkItemTableChange: (page: number, pageSize: number) => void;
  onAssetTableChange: (
    page: number,
    pageSize: number,
    sorter?: { type?: AssetSortType; direction?: SortDirection },
  ) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsReload: () => void;
  onAssetSearchTerm: (term?: string | undefined) => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
};

const MultiValueGroup: React.FC<Props> = ({
  className,
  parentField,
  groups,
  form,
  fields,
  value = [],
  onChange,
  linkedItemsModalList,
  formItemsData,
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
  onReferenceModelUpdate,
  onLinkItemTableChange,
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetsReload,
  onAssetSearchTerm,
  setFileList,
  setUploadModalVisibility,
}) => {
  const t = useT();

  useEffect(() => {
    if (!value) onChange?.([]);
  }, [fields, onChange, value]);

  const handleInputDelete = useCallback(
    (key: number) => {
      onChange?.(
        value.filter((_: any, index: number) => {
          return index !== key;
        }),
      );
    },
    [onChange, value],
  );

  const group = useMemo<Group | undefined>(
    () => groups?.find(g => g.id === parentField.typeProperty?.groupId),
    [groups, parentField.typeProperty?.groupId],
  );

  const handleAdd = useCallback(() => {
    const currentValues = value || [];
    const itemGroupId = newID();

    if (Array.isArray(currentValues)) {
      onChange?.([...currentValues, itemGroupId]);
    } else {
      onChange?.([currentValues, itemGroupId]);
    }

    // set default value
    const newValues = { ...form?.getFieldsValue() };
    group?.schema.fields.forEach((field: Field) => {
      switch (field.type) {
        case "Select":
          if (typeof newValues[field.id] === "object" && !Array.isArray(newValues[field.id])) {
            newValues[field.id][itemGroupId] = field.typeProperty.selectDefaultValue;
          } else {
            newValues[field.id] = {
              [itemGroupId]: field.typeProperty.selectDefaultValue,
            };
          }
          break;
        case "Tag":
          if (typeof newValues[field.id] === "object" && !Array.isArray(newValues[field.id])) {
            newValues[field.id][itemGroupId] = field.typeProperty.selectDefaultValue;
          } else {
            newValues[field.id] = {
              [itemGroupId]: field.typeProperty.selectDefaultValue,
            };
          }
          break;
        case "Integer":
          if (typeof newValues[field.id] === "object" && !Array.isArray(newValues[field.id])) {
            newValues[field.id][itemGroupId] = field.typeProperty.integerDefaultValue;
          } else {
            newValues[field.id] = {
              [itemGroupId]: field.typeProperty.integerDefaultValue,
            };
          }
          break;
        case "Asset":
          if (typeof newValues[field.id] === "object" && !Array.isArray(newValues[field.id])) {
            newValues[field.id][itemGroupId] = field.typeProperty.assetDefaultValue;
          } else {
            newValues[field.id] = {
              [itemGroupId]: field.typeProperty.assetDefaultValue,
            };
          }
          break;
        case "Date":
          if (Array.isArray(field.typeProperty.defaultValue)) {
            newValues[field.id][itemGroupId] = field.typeProperty.defaultValue.map(
              (valueItem: string) => {
                if (valueItem) {
                  if (
                    typeof newValues[field.id] === "object" &&
                    !Array.isArray(newValues[field.id])
                  ) {
                    return moment(field.typeProperty.defaultValue);
                  } else {
                    return {
                      [itemGroupId]: moment(field.typeProperty.defaultValue),
                    };
                  }
                } else {
                  return "";
                }
              },
            );
          } else {
            if (field.typeProperty.defaultValue) {
              if (typeof newValues[field.id] === "object" && !Array.isArray(newValues[field.id])) {
                newValues[field.id][itemGroupId] = moment(field.typeProperty.defaultValue);
              } else {
                newValues[field.id] = {
                  [itemGroupId]: moment(field.typeProperty.defaultValue),
                };
              }
            } else {
              newValues[field.id][itemGroupId] = "";
            }
          }
          break;
        default:
          if (typeof newValues[field.id] === "object" && !Array.isArray(newValues[field.id])) {
            form?.setFieldValue([field.id, itemGroupId], field.typeProperty.defaultValue);
          } else {
            form?.setFieldValue(field.id, {
              [itemGroupId]: field.typeProperty.defaultValue,
            });
          }
          break;
      }
    });
  }, [form, group?.schema.fields, onChange, value]);

  return (
    <div className={className}>
      {Array.isArray(value) &&
        value?.map((valueItem, key) => {
          return (
            <FieldWrapper key={key}>
              <GroupItem
                order={key}
                value={valueItem}
                parentField={parentField}
                linkedItemsModalList={linkedItemsModalList}
                formItemsData={formItemsData}
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
                onReferenceModelUpdate={onReferenceModelUpdate}
                onLinkItemTableChange={onLinkItemTableChange}
                onAssetTableChange={onAssetTableChange}
                onUploadModalCancel={onUploadModalCancel}
                setUploadUrl={setUploadUrl}
                setUploadType={setUploadType}
                onAssetsCreate={onAssetsCreate}
                onAssetCreateFromUrl={onAssetCreateFromUrl}
                onAssetsReload={onAssetsReload}
                onAssetSearchTerm={onAssetSearchTerm}
                setFileList={setFileList}
                setUploadModalVisibility={setUploadModalVisibility}
                onMoveUp={() => onChange?.(moveItemInArray(value, key, key - 1))}
                onMoveDown={() => onChange?.(moveItemInArray(value, key, key + 1))}
                onDelete={() => handleInputDelete(key)}
                disableMoveUp={key === 0}
                disableMoveDown={key === value.length - 1}
              />
            </FieldWrapper>
          );
        })}
      {
        <Button icon={<Icon icon="plus" />} type="primary" onClick={handleAdd}>
          {t("New")}
        </Button>
      }
    </div>
  );
};

export default MultiValueGroup;

const FieldWrapper = styled.div`
  display: flex;
  margin: 8px 0;
`;
