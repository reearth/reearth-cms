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
  FieldType,
  Group,
  FormValues,
  Tag,
  SelectedSchemaType,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { MAX_KEY_LENGTH } from "@reearth-cms/utils/regex";

import useHooks from "./hooks";

type Props = {
  groups?: Group[];
  selectedType: FieldType;
  selectedSchemaType: SelectedSchemaType;
  isMeta: boolean;
  open: boolean;
  fieldLoading: boolean;
  selectedField: Field | null;
  handleFieldKeyUnique: (key: string) => boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
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
  onAssetTableChange: (page: number, pageSize: number, sorter?: SortType) => void;
  onUploadModalCancel: () => void;
  setUploadUrl: (uploadUrl: { url: string; autoUnzip: boolean }) => void;
  setUploadType: (type: UploadType) => void;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onAssetSearchTerm: (term?: string) => void;
  onAssetsGet: () => void;
  onAssetsReload: () => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
  onGetAsset: (assetId: string) => Promise<string | undefined>;
};

const initialValues: FormValues = {
  fieldId: "",
  title: "",
  description: "",
  key: "",
  metadata: false,
  multiple: false,
  unique: false,
  isTitle: false,
  required: false,
  type: "Text",
  typeProperty: { text: { defaultValue: "", maxLength: 0 } },
};

const { TabPane } = Tabs;

const FieldModal: React.FC<Props> = ({
  groups,
  open,
  isMeta,
  selectedSchemaType,
  fieldLoading,
  selectedType,
  selectedField,
  onClose,
  onSubmit,
  handleFieldKeyUnique,
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
  onAssetTableChange,
  onUploadModalCancel,
  setUploadUrl,
  setUploadType,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onAssetSearchTerm,
  onAssetsGet,
  onAssetsReload,
  setFileList,
  setUploadModalVisibility,
  onGetAsset,
}) => {
  const t = useT();

  const {
    form,
    buttonDisabled,
    activeTab,
    selectedValues,
    selectedTags,
    selectedSupportedTypes,
    maxLength,
    min,
    max,
    multipleValue,
    handleMultipleChange,
    handleTabChange,
    handleValuesChange,
    handleNameChange,
    handleKeyChange,
    handleSubmit,
    handleModalReset,
    isRequiredDisabled,
    isUniqueDisabled,
    keyValidate,
    isTitleDisabled,
    ObjectSupportType,
    EditorSupportType,
    emptyValidator,
    duplicatedValidator,
    errorIndexes,
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
      title={
        <FieldThumbnail>
          <StyledIcon icon={fieldTypes[selectedType].icon} color={fieldTypes[selectedType].color} />
          <StyledTitle>
            {selectedField
              ? t("Update Field", { field: selectedField.title })
              : t("Create Field", { field: t(fieldTypes[selectedType].title) })}
          </StyledTitle>
        </FieldThumbnail>
      }
      width={572}
      open={open}
      onCancel={handleModalReset}
      footer={[
        <Button key="cancel" onClick={handleModalReset} disabled={fieldLoading}>
          {t("Cancel")}
        </Button>,
        <Button
          key="ok"
          type="primary"
          loading={fieldLoading}
          onClick={handleSubmit}
          disabled={buttonDisabled}>
          {t("OK")}
        </Button>,
      ]}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        requiredMark={requiredMark}
        onValuesChange={handleValuesChange}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab={t("Settings")} key="settings" forceRender>
            <Form.Item
              name="title"
              label={t("Display name")}
              rules={[{ required: true, message: t("Please input the display name of field!") }]}>
              <Input onChange={handleNameChange} />
            </Form.Item>
            <Form.Item
              name="key"
              label={t("Field Key")}
              extra={t(
                "Field key must be unique and at least 1 character long. It can only contain letters, numbers, underscores and dashes.",
              )}
              rules={[
                {
                  message: t("Key is not valid"),
                  required: true,
                  validator: async (_, value) => {
                    await keyValidate(value);
                  },
                },
              ]}>
              <Input onChange={handleKeyChange} showCount maxLength={MAX_KEY_LENGTH} />
            </Form.Item>
            <Form.Item name="description" label={t("Description")}>
              <TextArea rows={3} showCount maxLength={1000} />
            </Form.Item>
            {selectedType === "Select" && (
              <Form.Item
                name="values"
                label={t("Set Options")}
                validateStatus={"success"}
                rules={[
                  {
                    required: true,
                    message: t("At least 1 option"),
                  },
                  {
                    validator: async (_, values?: string[]) => emptyValidator(values),
                    message: t("Empty values are not allowed"),
                  },
                  {
                    validator: async (_, values?: string[]) => duplicatedValidator(values),
                    message: t("Option must be unique"),
                  },
                ]}>
                <MultiValueField FieldInput={Input} errorIndexes={errorIndexes} />
              </Form.Item>
            )}
            {selectedType === "Tag" && (
              <Form.Item
                name="tags"
                label={t("Set Tags")}
                validateStatus={"success"}
                rules={[
                  {
                    required: true,
                    message: t("At least 1 tag"),
                  },
                  {
                    validator: async (_, values?: Tag[]) => {
                      const names = values?.map(value => value.name);
                      return emptyValidator(names);
                    },
                    message: t("Empty values are not allowed"),
                  },
                  {
                    validator: async (_, values?: Tag[]) => {
                      const names = values?.map(value => value.name);
                      return duplicatedValidator(names);
                    },
                    message: t("Labels must be unique"),
                  },
                ]}>
                <MultiValueColoredTag errorIndexes={errorIndexes} />
              </Form.Item>
            )}
            {selectedType === "Group" && (
              <Form.Item
                name="group"
                label={t("Select Group")}
                rules={[{ required: true, message: t("Please select the group!") }]}>
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
                name="supportedTypes"
                label={t("Support Type")}
                extra={t("Please select what type of Geometry this field will support")}
                rules={[{ required: true, message: t("Please select the Support Type!") }]}>
                <StyledCheckboxGroup>
                  {ObjectSupportType.map(item => (
                    <Checkbox value={item.value}>{item.label}</Checkbox>
                  ))}
                </StyledCheckboxGroup>
              </Form.Item>
            )}
            {selectedType === "GeometryEditor" && (
              <Form.Item
                name="supportedTypes"
                label={t("Support Type")}
                extra={t("Please select what type of Geometry this field will support")}
                rules={[{ required: true, message: t("Please select the Support Type!") }]}>
                <Radio.Group>
                  {EditorSupportType.map(item => (
                    <Radio value={item.value}>{item.label}</Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            )}
            <OptionTitle>{t("options")}</OptionTitle>
            <Form.Item
              name="multiple"
              valuePropName="checked"
              extra={t("Stores a list of values instead of a single value")}>
              <Checkbox onChange={(e: CheckboxChangeEvent) => handleMultipleChange(e)}>
                {t("Support multiple values")}
              </Checkbox>
            </Form.Item>
            <Form.Item
              name="isTitle"
              hidden={isTitleDisabled}
              valuePropName="checked"
              extra={t("Only one field can be used as the title")}>
              <Checkbox>{t("Use as title")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab={t("Validation")} key="validation" forceRender>
            <FieldValidationInputs selectedType={selectedType} min={min} max={max} />
            <Form.Item
              name="required"
              valuePropName="checked"
              extra={t("Prevents saving an entry if this field is empty")}>
              <Checkbox disabled={isRequiredDisabled}>{t("Make field required")}</Checkbox>
            </Form.Item>
            <Form.Item
              name="unique"
              valuePropName="checked"
              extra={t("Ensures that multiple entries can't have the same value for this field")}>
              <Checkbox disabled={isUniqueDisabled}>{t("Set field as unique")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab={t("Default value")} key="defaultValue" forceRender>
            <FieldDefaultInputs
              multiple={multipleValue}
              selectedValues={selectedValues}
              selectedTags={selectedTags}
              selectedSupportedTypes={selectedSupportedTypes}
              maxLength={maxLength}
              min={min}
              max={max}
              selectedType={selectedType}
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
              onAssetSearchTerm={onAssetSearchTerm}
              onAssetsGet={onAssetsGet}
              onAssetsReload={onAssetsReload}
              setFileList={setFileList}
              setUploadModalVisibility={setUploadModalVisibility}
              onGetAsset={onGetAsset}
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
