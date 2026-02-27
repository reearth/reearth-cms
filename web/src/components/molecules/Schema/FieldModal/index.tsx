import styled from "@emotion/styled";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Radio from "@reearth-cms/components/atoms/Radio";
import Select from "@reearth-cms/components/atoms/Select";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import { Asset, SortType } from "@reearth-cms/components/molecules/Asset/types";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import MultiValueColoredTag from "@reearth-cms/components/molecules/Common/MultiValueField/MultValueColoredTag";
import FieldDefaultInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldDefaultInputs";
import FieldValidationInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldValidationInputs";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import {
  Field,
  FormValues,
  Group,
  SchemaFieldType,
  SelectedSchemaType,
  Tag,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";

import useHooks from "./hooks";

type Props = {
  assetList: Asset[];
  fieldLoading: boolean;
  fileList: UploadFile[];
  groups?: Group[];
  handleFieldKeyUnique: (key: string) => boolean;
  isMeta: boolean;
  loadingAssets: boolean;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetSearchTerm: (term?: string) => void;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onClose: () => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
  onSubmit: (values: FormValues) => Promise<void>;
  onUploadModalCancel: () => void;
  open: boolean;
  page: number;
  pageSize: number;
  selectedField: Field | null;
  selectedSchemaType: SelectedSchemaType;
  selectedType: SchemaFieldType;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  setUploadType: (type: UploadType) => void;
  setUploadUrl: (uploadUrl: { autoUnzip: boolean; url: string; }) => void;
  totalCount: number;
  uploading: boolean;
  uploadModalVisibility: boolean;
  uploadType: UploadType;
  uploadUrl: { autoUnzip: boolean; url: string; };
};

const initialValues: FormValues = {
  description: "",
  fieldId: "",
  isTitle: false,
  key: "",
  metadata: false,
  multiple: false,
  required: false,
  title: "",
  type: "Text",
  typeProperty: { text: { defaultValue: "", maxLength: 0 } },
  unique: false,
};

const { TabPane } = Tabs;

const FieldModal: React.FC<Props> = ({
  assetList,
  fieldLoading,
  fileList,
  groups,
  handleFieldKeyUnique,
  isMeta,
  loadingAssets,
  onAssetCreateFromUrl,
  onAssetsCreate,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  onAssetTableChange,
  onClose,
  onGetAsset,
  onSubmit,
  onUploadModalCancel,
  open,
  page,
  pageSize,
  selectedField,
  selectedSchemaType,
  selectedType,
  setFileList,
  setUploadModalVisibility,
  setUploadType,
  setUploadUrl,
  totalCount,
  uploading,
  uploadModalVisibility,
  uploadType,
  uploadUrl,
}) => {
  const t = useT();

  const {
    activeTab,
    buttonDisabled,
    duplicatedValidator,
    EditorSupportType,
    emptyValidator,
    errorIndexes,
    form,
    handleKeyChange,
    handleModalReset,
    handleMultipleChange,
    handleNameChange,
    handleSubmit,
    handleTabChange,
    handleValuesChange,
    isRequiredDisabled,
    isTitleDisabled,
    isUniqueDisabled,
    keyValidate,
    max,
    maxLength,
    min,
    multipleValue,
    ObjectSupportType,
    selectedSupportedTypes,
    selectedTags,
    selectedValues,
  } = useHooks(
    selectedSchemaType,
    selectedType,
    isMeta,
    selectedField,
    open,
    onClose,
    onSubmit,
    handleFieldKeyUnique,
  );

  const requiredMark = (label: React.ReactNode, { required }: { required: boolean }) => (
    <>
      {required && <Required>*</Required>}
      {label}
      {!required && <Optional>{`(${t("optional")})`}</Optional>}
    </>
  );

  return (
    <Modal
      footer={[
        <Button disabled={fieldLoading} key="cancel" onClick={handleModalReset}>
          {t("Cancel")}
        </Button>,
        <Button
          disabled={buttonDisabled}
          key="ok"
          loading={fieldLoading}
          onClick={handleSubmit}
          type="primary">
          {t("OK")}
        </Button>,
      ]}
      onCancel={handleModalReset}
      open={open}
      title={
        <FieldThumbnail>
          <StyledIcon color={fieldTypes[selectedType].color} icon={fieldTypes[selectedType].icon} />
          <StyledTitle>
            {selectedField
              ? t("Update Field", { field: selectedField.title })
              : t("Create Field", { field: t(fieldTypes[selectedType].title) })}
          </StyledTitle>
        </FieldThumbnail>
      }
      width={572}>
      <Form
        form={form}
        initialValues={initialValues}
        layout="vertical"
        onValuesChange={handleValuesChange}
        requiredMark={requiredMark}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane forceRender key="settings" tab={t("Settings")}>
            <Form.Item
              label={t("Display name")}
              name="title"
              rules={[{ message: t("Please input the display name of field!"), required: true }]}>
              <Input onChange={handleNameChange} />
            </Form.Item>
            <Form.Item
              extra={t(
                "Field key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.",
              )}
              label={t("Field Key")}
              name="key"
              rules={[
                {
                  message: t("Key is not valid"),
                  required: true,
                  validator: async (_, value) => {
                    await keyValidate(value);
                  },
                },
              ]}>
              <Input maxLength={Constant.KEY.MAX_LENGTH} onChange={handleKeyChange} showCount />
            </Form.Item>
            <Form.Item label={t("Description")} name="description">
              <TextArea maxLength={1000} rows={3} showCount />
            </Form.Item>
            {selectedType === "Select" && (
              <Form.Item
                label={t("Set Options")}
                name="values"
                rules={[
                  {
                    message: t("At least 1 option"),
                    required: true,
                  },
                  {
                    message: t("Empty values are not allowed"),
                    validator: async (_, values?: string[]) => emptyValidator(values),
                  },
                  {
                    message: t("Option must be unique"),
                    validator: async (_, values?: string[]) => duplicatedValidator(values),
                  },
                ]}
                validateStatus={"success"}>
                <MultiValueField errorIndexes={errorIndexes} FieldInput={Input} />
              </Form.Item>
            )}
            {selectedType === "Tag" && (
              <Form.Item
                label={t("Set Tags")}
                name="tags"
                rules={[
                  {
                    message: t("At least 1 tag"),
                    required: true,
                  },
                  {
                    message: t("Empty values are not allowed"),
                    validator: async (_, values?: Tag[]) => {
                      const names = values?.map(value => value.name);
                      return emptyValidator(names);
                    },
                  },
                  {
                    message: t("Labels must be unique"),
                    validator: async (_, values?: Tag[]) => {
                      const names = values?.map(value => value.name);
                      return duplicatedValidator(names);
                    },
                  },
                ]}
                validateStatus={"success"}>
                <MultiValueColoredTag errorIndexes={errorIndexes} />
              </Form.Item>
            )}
            {selectedType === "Group" && (
              <Form.Item
                label={t("Select Group")}
                name="group"
                rules={[{ message: t("Please select the group!"), required: true }]}>
                <Select>
                  {groups?.map(group => (
                    <Select.Option key={group.id} value={group.id}>
                      {group.name}{" "}
                      <StyledGroupKey className="ant-form-item-extra">#{group.key}</StyledGroupKey>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            {selectedType === "GeometryObject" && (
              <Form.Item
                extra={t("Please select what type of Geometry this field will support")}
                label={t("Support Type")}
                name="supportedTypes"
                rules={[{ message: t("Please select the Support Type!"), required: true }]}>
                <StyledCheckboxGroup>
                  {ObjectSupportType.map(item => (
                    <Checkbox value={item.value}>{item.label}</Checkbox>
                  ))}
                </StyledCheckboxGroup>
              </Form.Item>
            )}
            {selectedType === "GeometryEditor" && (
              <Form.Item
                extra={t("Please select what type of Geometry this field will support")}
                label={t("Support Type")}
                name="supportedTypes"
                rules={[{ message: t("Please select the Support Type!"), required: true }]}>
                <Radio.Group>
                  {EditorSupportType.map(item => (
                    <Radio value={item.value}>{item.label}</Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            )}
            <OptionTitle>{t("options")}</OptionTitle>
            <Form.Item
              extra={t("Stores a list of values instead of a single value")}
              name="multiple"
              valuePropName="checked">
              <Checkbox onChange={(e: CheckboxChangeEvent) => handleMultipleChange(e)}>
                {t("Support multiple values")}
              </Checkbox>
            </Form.Item>
            <Form.Item
              extra={t("Only one field can be used as the title")}
              hidden={isTitleDisabled}
              name="isTitle"
              valuePropName="checked">
              <Checkbox>{t("Use as title")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane forceRender key="validation" tab={t("Validation")}>
            <FieldValidationInputs max={max} min={min} selectedType={selectedType} />
            <Form.Item
              extra={t("Prevents saving an entry if this field is empty")}
              name="required"
              valuePropName="checked">
              <Checkbox disabled={isRequiredDisabled}>{t("Make field required")}</Checkbox>
            </Form.Item>
            <Form.Item
              extra={t("Ensures that multiple entries can't have the same value for this field")}
              name="unique"
              valuePropName="checked">
              <Checkbox disabled={isUniqueDisabled}>{t("Set field as unique")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane forceRender key="defaultValue" tab={t("Default value")}>
            <FieldDefaultInputs
              assetList={assetList}
              fileList={fileList}
              loadingAssets={loadingAssets}
              max={max}
              maxLength={maxLength}
              min={min}
              multiple={multipleValue}
              onAssetCreateFromUrl={onAssetCreateFromUrl}
              onAssetsCreate={onAssetsCreate}
              onAssetSearchTerm={onAssetSearchTerm}
              onAssetsGet={onAssetsGet}
              onAssetsReload={onAssetsReload}
              onAssetTableChange={onAssetTableChange}
              onGetAsset={onGetAsset}
              onUploadModalCancel={onUploadModalCancel}
              page={page}
              pageSize={pageSize}
              selectedSupportedTypes={selectedSupportedTypes}
              selectedTags={selectedTags}
              selectedType={selectedType}
              selectedValues={selectedValues}
              setFileList={setFileList}
              setUploadModalVisibility={setUploadModalVisibility}
              setUploadType={setUploadType}
              setUploadUrl={setUploadUrl}
              totalCount={totalCount}
              uploading={uploading}
              uploadModalVisibility={uploadModalVisibility}
              uploadType={uploadType}
              uploadUrl={uploadUrl}
            />
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

const Required = styled.span`
  color: #ff4d4f;
  margin-right: 4px;
`;

const Optional = styled.span`
  color: #8c8c8c;
  margin-left: 4px;
`;

const OptionTitle = styled.p`
  margin-bottom: 8px;
`;

const FieldThumbnail = styled.div`
  display: flex;
  align-items: center;
`;

const StyledIcon = styled(Icon)`
  border: 1px solid #f0f0f0;
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  span {
    display: inherit;
  }
`;

const StyledTitle = styled.p`
  color: #000000d9;
  font-size: 16px;
  margin: 0 20px 0 12px;
  overflow: auto;
`;

const StyledGroupKey = styled.span`
  font-size: 12px;
  margin-left: 4px;
`;

const StyledCheckboxGroup = styled(Checkbox.Group)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  overflow-x: auto;
`;

export default FieldModal;
