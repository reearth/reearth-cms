import styled from "@emotion/styled";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";

import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Select from "@reearth-cms/components/atoms/Select";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import { UploadType } from "@reearth-cms/components/molecules/Asset/AssetList";
import MultiValueField from "@reearth-cms/components/molecules/Common/MultiValueField";
import MultiValueColoredTag from "@reearth-cms/components/molecules/Common/MultiValueField/MultValueColoredTag";
import FieldDefaultInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldDefaultInputs";
import FieldValidationInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldValidationInputs";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import {
  Field,
  FieldModalTabs,
  FieldType,
  Group,
} from "@reearth-cms/components/molecules/Schema/types";
import {
  AssetSortType,
  SortDirection,
} from "@reearth-cms/components/organisms/Asset/AssetList/hooks";
import { SchemaFieldTypePropertyInput } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { transformMomentToString } from "@reearth-cms/utils/format";
import { validateKey } from "@reearth-cms/utils/regex";

export interface FormValues {
  fieldId?: string;
  groupId?: string;
  title: string;
  description: string;
  key: string;
  meta: boolean;
  multiple: boolean;
  unique: boolean;
  isTitle: boolean;
  required: boolean;
  type?: FieldType;
  typeProperty: SchemaFieldTypePropertyInput;
}

export interface Props {
  groups?: Group[];
  open?: boolean;
  fieldUpdateLoading: boolean;
  selectedType: FieldType;
  isMeta?: boolean;
  selectedField?: Field | null;
  handleFieldKeyUnique: (key: string, fieldId?: string) => boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
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
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  setFileList: (fileList: UploadFile<File>[]) => void;
  setUploadModalVisibility: (visible: boolean) => void;
}

const initialValues: FormValues = {
  fieldId: "",
  title: "",
  description: "",
  key: "",
  multiple: false,
  meta: false,
  unique: false,
  isTitle: false,
  required: false,
  typeProperty: { text: { defaultValue: "", maxLength: 0 } },
};

const FieldUpdateModal: React.FC<Props> = ({
  groups,
  open,
  fieldUpdateLoading,
  onClose,
  onSubmit,
  handleFieldKeyUnique,
  selectedType,
  isMeta,
  selectedField,
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
  onAssetsReload,
  setFileList,
  setUploadModalVisibility,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [activeTab, setActiveTab] = useState<FieldModalTabs>("settings");
  const { TabPane } = Tabs;
  const selectedValues: string[] = Form.useWatch("values", form);
  const selectedTags: { id: string; name: string; color: string }[] = Form.useWatch("tags", form);
  const [multipleValue, setMultipleValue] = useState(selectedField?.multiple);

  useEffect(() => {
    setMultipleValue(selectedField?.multiple);
  }, [selectedField?.multiple]);

  const handleMultipleChange = useCallback(
    (e: CheckboxChangeEvent) => {
      if (selectedType === "Date") {
        if (e.target.checked) {
          form.setFieldValue("defaultValue", []);
        } else {
          form.setFieldValue("defaultValue", null);
        }
      }

      setMultipleValue(e.target.checked);
    },
    [form, selectedType],
  );

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTab(key as FieldModalTabs);
    },
    [setActiveTab],
  );

  useEffect(() => {
    if (selectedType === "Select") {
      if (
        !selectedValues?.some(selectedValue => selectedValue === form.getFieldValue("defaultValue"))
      ) {
        form.setFieldValue("defaultValue", null);
      }
    }
  }, [form, selectedValues, selectedType]);

  useEffect(() => {
    if (selectedType === "Tag" && form.getFieldValue("defaultValue") && selectedTags) {
      const defaultValues = form.getFieldValue("defaultValue");
      const isDefaultValueArray = Array.isArray(defaultValues);

      const result = selectedTags
        .filter(selectedTag =>
          isDefaultValueArray
            ? defaultValues.includes(selectedTag.name) || defaultValues.includes(selectedTag.id)
            : selectedTag.name === defaultValues || selectedTag.id === defaultValues,
        )
        .map(item => item.name);

      form.setFieldValue("defaultValue", result);
    }
  }, [form, selectedTags, selectedType]);

  useEffect(() => {
    let value =
      selectedField?.typeProperty.defaultValue ||
      selectedField?.typeProperty.selectDefaultValue ||
      selectedField?.typeProperty.integerDefaultValue ||
      selectedField?.typeProperty.assetDefaultValue;

    if (selectedType === "Date") {
      if (Array.isArray(value)) {
        value = value.map(valueItem => moment(valueItem));
      } else {
        value = moment(value);
      }
    }
    if (selectedType === "Tag") {
      if (Array.isArray(value)) {
        value = value.map(
          valueItem =>
            selectedField?.typeProperty.tags?.find(
              (tag: { id: string; name: string }) => tag.id === valueItem,
            )?.name,
        );
      } else {
        value = selectedField?.typeProperty.tags?.find(
          (tag: { id: string; name: string }) => tag.id === value,
        )?.name;
      }
    }

    form.setFieldsValue({
      fieldId: selectedField?.id,
      title: selectedField?.title,
      description: selectedField?.description,
      key: selectedField?.key,
      multiple: selectedField?.multiple,
      unique: selectedField?.unique,
      isTitle: selectedField?.isTitle,
      required: selectedField?.required,
      defaultValue: value,
      min: selectedField?.typeProperty.min,
      max: selectedField?.typeProperty.max,
      maxLength: selectedField?.typeProperty.maxLength,
      values: selectedField?.typeProperty.values,
      tags: selectedField?.typeProperty.tags,
      group: selectedField?.typeProperty.groupId,
    });
  }, [form, selectedField, selectedType]);

  const handleSubmit = useCallback(() => {
    form
      .validateFields()
      .then(async values => {
        if (selectedType === "Text") {
          values.typeProperty = {
            text: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        } else if (selectedType === "TextArea") {
          values.typeProperty = {
            textArea: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        } else if (selectedType === "MarkdownText") {
          values.typeProperty = {
            markdownText: { defaultValue: values.defaultValue, maxLength: values.maxLength },
          };
        } else if (selectedType === "Asset") {
          values.typeProperty = {
            asset: { defaultValue: values.defaultValue },
          };
        } else if (selectedType === "Select") {
          values.typeProperty = {
            select: { defaultValue: values.defaultValue, values: values.values },
          };
        } else if (selectedType === "Integer") {
          values.typeProperty = {
            integer: {
              defaultValue: values.defaultValue ?? null,
              min: values.min ?? null,
              max: values.max ?? null,
            },
          };
        } else if (selectedType === "Bool") {
          values.typeProperty = {
            bool: { defaultValue: values.defaultValue },
          };
        } else if (selectedType === "Date") {
          values.typeProperty = {
            date: { defaultValue: transformMomentToString(values.defaultValue) },
          };
        } else if (selectedType === "Tag") {
          values.typeProperty = {
            tag: {
              defaultValue: values.defaultValue,
              tags: values.tags.map((tag: any) => ({
                id: tag.id,
                name: tag.name,
                color: tag.color.toUpperCase(),
              })),
            },
          };
        } else if (selectedType === "Checkbox") {
          values.typeProperty = {
            checkbox: { defaultValue: values.defaultValue },
          };
        } else if (selectedType === "URL") {
          values.typeProperty = {
            url: { defaultValue: values.defaultValue },
          };
        } else if (selectedType === "Group") {
          values.typeProperty = {
            group: { groupId: values.group },
          };
        }
        values.metadata = isMeta;
        await onSubmit?.({
          ...values,
          fieldId: selectedField?.id,
        });
        onClose?.(true);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, selectedType, isMeta, onSubmit, selectedField?.id, onClose]);

  const handleModalReset = useCallback(() => {
    form.resetFields();
    setActiveTab("settings");
  }, [form]);

  const handleModalCancel = useCallback(() => {
    setMultipleValue(selectedField?.multiple);
    onClose?.(true);
  }, [onClose, selectedField?.multiple]);

  const isRequiredDisabled = useMemo(
    () => selectedType === "Group" || selectedType === "Bool" || selectedType === "Checkbox",
    [selectedType],
  );

  const isUniqueDisabled = useMemo(
    () => selectedType === "Group" || selectedType === "Bool" || selectedType === "Checkbox",
    [selectedType],
  );

  return (
    <Modal
      title={
        selectedType ? (
          <FieldThumbnail>
            <StyledIcon
              icon={fieldTypes[selectedType].icon}
              color={fieldTypes[selectedType].color}
            />{" "}
            <h3>
              {t("Update")} {t(fieldTypes[selectedType].title)}
            </h3>
          </FieldThumbnail>
        ) : null
      }
      open={open}
      onCancel={handleModalCancel}
      onOk={handleSubmit}
      confirmLoading={fieldUpdateLoading}
      okButtonProps={{ disabled: buttonDisabled }}
      afterClose={handleModalReset}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={() => {
          setTimeout(() => {
            form
              .validateFields()
              .then(() => {
                setButtonDisabled(false);
              })
              .catch(fieldsError => {
                setButtonDisabled(
                  fieldsError.errorFields.some((item: FieldError) => item.errors.length > 0),
                );
              });
          });
        }}>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab={t("Settings")} key="settings" forceRender>
            <Form.Item
              name="title"
              label={t("Display name")}
              rules={[{ required: true, message: t("Please input the display name of field!") }]}>
              <Input />
            </Form.Item>
            <Form.Item
              name="key"
              label="Field Key"
              extra={t(
                "Field key must be unique and at least 1 characters long. It can only contain letters, numbers, underscores and dashes.",
              )}
              rules={[
                {
                  message: t("Key is not valid"),
                  required: true,
                  validator: async (_, value) => {
                    if (!validateKey(value)) return Promise.reject();
                    const isKeyAvailable = handleFieldKeyUnique(value, selectedField?.id);
                    if (isKeyAvailable) {
                      return Promise.resolve();
                    } else {
                      return Promise.reject();
                    }
                  },
                },
              ]}>
              <Input />
            </Form.Item>
            <Form.Item requiredMark="optional" name="description" label={t("Description")}>
              <TextArea rows={3} showCount maxLength={1000} />
            </Form.Item>
            {selectedType === "Select" && (
              <Form.Item
                name="values"
                label={t("Set Options")}
                rules={[
                  {
                    validator: async (_, values) => {
                      if (!values || values.length < 1) {
                        return Promise.reject(new Error("At least 1 option"));
                      }
                      if (values.some((value: string) => value.length === 0)) {
                        return Promise.reject(new Error("Empty values are not allowed"));
                      }
                    },
                  },
                ]}>
                <MultiValueField FieldInput={Input} />
              </Form.Item>
            )}
            {selectedType === "Tag" && (
              <Form.Item
                name="tags"
                label={t("Set Tags")}
                rules={[
                  {
                    validator: async (_, values) => {
                      if (!values || values.length < 1) {
                        return Promise.reject(new Error("At least 1 option"));
                      }
                      if (values.some((value: string) => value.length === 0)) {
                        return Promise.reject(new Error("Empty values are not allowed"));
                      }
                      const uniqueNames = new Set(values.map((valueObj: any) => valueObj.name));
                      if (uniqueNames.size !== values.length) {
                        return Promise.reject(new Error("Labels must be unique"));
                      }
                    },
                  },
                ]}>
                <MultiValueColoredTag />
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
                      <span style={{ fontSize: 12, marginLeft: 4 }} className="ant-form-item-extra">
                        #{group.key}
                      </span>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            )}
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
              hidden={isMeta || selectedType === "Group"}
              valuePropName="checked"
              extra={t("Only one field can be used as the title")}>
              <Checkbox>{t("Use as title")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab={t("Validation")} key="validation" forceRender>
            <FieldValidationInputs selectedType={selectedType} />
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
              selectedValues={selectedValues}
              selectedTags={selectedTags}
              multiple={multipleValue}
              selectedType={selectedType}
              assetList={assetList}
              fileList={fileList}
              loadingAssets={loadingAssets}
              uploading={uploading}
              uploadModalVisibility={uploadModalVisibility}
              uploadUrl={uploadUrl}
              uploadType={uploadType}
              onAssetTableChange={onAssetTableChange}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onUploadModalCancel={onUploadModalCancel}
              setUploadUrl={setUploadUrl}
              setUploadType={setUploadType}
              onAssetsCreate={onAssetsCreate}
              onAssetCreateFromUrl={onAssetCreateFromUrl}
              onAssetSearchTerm={onAssetSearchTerm}
              onAssetsReload={onAssetsReload}
              setFileList={setFileList}
              setUploadModalVisibility={setUploadModalVisibility}
            />
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

const FieldThumbnail = styled.div`
  display: flex;
  align-items: center;
  h3 {
    margin: 0;
    margin-left: 12px;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #000000d9;
  }
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

export default FieldUpdateModal;
