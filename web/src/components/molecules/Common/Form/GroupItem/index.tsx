import styled from "@emotion/styled";
import { useMemo } from "react";

import Collapse from "@reearth-cms/components/atoms/Collapse";
import DatePicker from "@reearth-cms/components/atoms/DatePicker";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import InputNumber from "@reearth-cms/components/atoms/InputNumber";
import MarkdownInput from "@reearth-cms/components/atoms/Markdown";
import Select from "@reearth-cms/components/atoms/Select";
import Switch from "@reearth-cms/components/atoms/Switch";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import AssetItem from "@reearth-cms/components/molecules/Common/Form/AssetItem";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import MultiValueAsset from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueAsset";
import MultiValueBooleanField from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueBooleanField";
import MultiValueSelect from "@reearth-cms/components/molecules/Common/MultiValueField/MultiValueSelect";
import FieldTitle from "@reearth-cms/components/molecules/Content/Form/FieldTitle";
import ReferenceFormItem from "@reearth-cms/components/molecules/Content/Form/ReferenceFormItem";
import { FormItem } from "@reearth-cms/components/molecules/Content/types";
import { Field } from "@reearth-cms/components/molecules/Schema/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { useT } from "@reearth-cms/i18n";
import { validateURL } from "@reearth-cms/utils/regex";

import useHooks from "./hooks";

type Props = {
  value?: string;
  onChange?: (value: string) => void;
  order?: number;
  parentField: Field;
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
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  disableMoveUp?: boolean;
  disableMoveDown?: boolean;
};

const GroupItem: React.FC<Props> = ({
  value,
  order,
  parentField,
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
  onMoveUp,
  onMoveDown,
  onDelete,
  disableMoveUp,
  disableMoveDown,
}) => {
  const { Panel } = Collapse;
  const { group } = useHooks(parentField?.typeProperty.groupId);
  const { Option } = Select;
  const t = useT();

  const fields = useMemo(() => group?.schema.fields, [group?.schema.fields]);
  const itemGroupId = useMemo(() => value, [value]);

  return (
    <Collapse collapsible="header" defaultActiveKey={["1"]} style={{ width: 500 }}>
      <Panel
        header={parentField?.title + (order !== undefined ? ` (${order + 1})` : "")}
        key="1"
        extra={
          order !== undefined && (
            <>
              <Icon
                icon="arrowUp"
                style={{ marginRight: 10, display: disableMoveUp ? "none" : "inline-block" }}
                onClick={onMoveUp}
              />
              <Icon
                icon="arrowDown"
                style={{ marginRight: 10, display: disableMoveDown ? "none" : "inline-block" }}
                onClick={onMoveDown}
              />
              <Icon icon="delete" style={{ marginRight: 10 }} onClick={onDelete} />
            </>
          )
        }>
        <FormItemsWrapper>
          {fields?.map((field: Field) =>
            field.type === "TextArea" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={[field.id, itemGroupId ?? ""]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField
                    rows={3}
                    showCount
                    maxLength={field.typeProperty.maxLength ?? false}
                    FieldInput={TextArea}
                  />
                ) : (
                  <TextArea rows={3} showCount maxLength={field.typeProperty.maxLength ?? false} />
                )}
              </StyledFormItem>
            ) : field.type === "MarkdownText" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={[field.id, itemGroupId ?? ""]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField
                    maxLength={field.typeProperty.maxLength ?? false}
                    FieldInput={MarkdownInput}
                  />
                ) : (
                  <MarkdownInput maxLength={field.typeProperty.maxLength ?? false} />
                )}
              </StyledFormItem>
            ) : field.type === "Integer" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={[field.id, itemGroupId ?? ""]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField
                    type="number"
                    min={field.typeProperty.min}
                    max={field.typeProperty.max}
                    FieldInput={InputNumber}
                  />
                ) : (
                  <InputNumber
                    type="number"
                    min={field.typeProperty.min}
                    max={field.typeProperty.max}
                  />
                )}
              </StyledFormItem>
            ) : field.type === "Asset" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={[field.id, itemGroupId ?? ""]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueAsset
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
                  />
                ) : (
                  <AssetItem
                    key={field.id}
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
                  />
                )}
              </StyledFormItem>
            ) : field.type === "Select" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={[field.id, itemGroupId ?? ""]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }
                rules={[
                  {
                    required: field.required,
                    message: t("Please select an option!"),
                  },
                ]}>
                {field.multiple ? (
                  <MultiValueSelect selectedValues={field.typeProperty?.values} />
                ) : (
                  <Select allowClear>
                    {field.typeProperty?.values?.map((value: string) => (
                      <Option key={value} value={value}>
                        {value}
                      </Option>
                    ))}
                  </Select>
                )}
              </StyledFormItem>
            ) : field.type === "Date" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={[field.id, itemGroupId ?? ""]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}>
                {field.multiple ? (
                  <MultiValueField type="date" FieldInput={StyledDatePicker} />
                ) : (
                  <StyledDatePicker />
                )}
              </StyledFormItem>
            ) : field.type === "Bool" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={[field.id, itemGroupId ?? ""]}
                valuePropName="checked"
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? <MultiValueBooleanField FieldInput={Switch} /> : <Switch />}
              </StyledFormItem>
            ) : field.type === "Reference" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={[field.id, itemGroupId ?? ""]}
                label={<FieldTitle title={field.title} isUnique={field.unique} isTitle={false} />}>
                <ReferenceFormItem
                  key={field.id}
                  correspondingFieldId={field.id}
                  formItemsData={formItemsData}
                  modelId={field.typeProperty.modelId}
                  onReferenceModelUpdate={onReferenceModelUpdate}
                  linkedItemsModalList={linkedItemsModalList}
                  linkItemModalTotalCount={linkItemModalTotalCount}
                  linkItemModalPage={linkItemModalPage}
                  linkItemModalPageSize={linkItemModalPageSize}
                  onLinkItemTableChange={onLinkItemTableChange}
                />
              </StyledFormItem>
            ) : field.type === "URL" ? (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                name={[field.id, itemGroupId ?? ""]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                  {
                    message: "URL is not valid",
                    validator: async (_, value) => {
                      if (value) {
                        if (
                          Array.isArray(value) &&
                          value.some(
                            (valueItem: string) => !validateURL(valueItem) && valueItem.length > 0,
                          )
                        )
                          return Promise.reject();
                        else if (!Array.isArray(value) && !validateURL(value) && value?.length > 0)
                          return Promise.reject();
                      }
                      return Promise.resolve();
                    },
                  },
                ]}>
                {field.multiple ? (
                  <MultiValueField
                    showCount={true}
                    maxLength={field.typeProperty.maxLength ?? 500}
                    FieldInput={Input}
                  />
                ) : (
                  <Input showCount={true} maxLength={field.typeProperty.maxLength ?? 500} />
                )}
              </StyledFormItem>
            ) : (
              <StyledFormItem
                key={field.id}
                extra={field.description}
                rules={[
                  {
                    required: field.required,
                    message: t("Please input field!"),
                  },
                ]}
                name={[field.id, itemGroupId ?? ""]}
                label={
                  <FieldTitle title={field.title} isUnique={field.unique} isTitle={field.isTitle} />
                }>
                {field.multiple ? (
                  <MultiValueField
                    showCount={true}
                    maxLength={field.typeProperty.maxLength ?? 500}
                    FieldInput={Input}
                  />
                ) : (
                  <Input showCount={true} maxLength={field.typeProperty.maxLength ?? 500} />
                )}
              </StyledFormItem>
            ),
          )}
        </FormItemsWrapper>
      </Panel>
    </Collapse>
  );
};

const StyledFormItem = styled(Form.Item)`
  width: 468px;
  word-wrap: break-word;
`;

const FormItemsWrapper = styled.div`
  width: 50%;
  @media (max-width: 1200px) {
    width: 100%;
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
`;

export default GroupItem;
