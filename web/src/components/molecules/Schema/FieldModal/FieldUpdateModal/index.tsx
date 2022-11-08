import styled from "@emotion/styled";
import { useCallback, useEffect, useState, Dispatch, SetStateAction } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form, { FieldError } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/asset.type";
import FieldDefaultInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldDefaultInputs";
import FieldValidationInputs from "@reearth-cms/components/molecules/Schema/FieldModal/FieldValidationInputs";
import { SchemaFieldTypePropertyInput } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";
import { validateKey } from "@reearth-cms/utils/regex";

import { Field, FieldType, fieldTypes } from "../../types";

export interface FormValues {
  fieldId: string;
  title: string;
  description: string;
  key: string;
  multiValue: boolean;
  unique: boolean;
  required: boolean;
  typeProperty: SchemaFieldTypePropertyInput;
}

export interface Props {
  open?: boolean;
  selectedType: FieldType;
  selectedField?: Field | null;
  handleFieldKeyUnique: (key: string, fieldId?: string) => boolean;
  onClose?: (refetch?: boolean) => void;
  onSubmit?: (values: FormValues) => Promise<void> | void;
  assetList: Asset[];
  fileList: UploadFile[];
  loadingAssets: boolean;
  uploading: boolean;
  uploadModalVisibility: boolean;
  createAssets: (files: UploadFile[]) => Promise<void>;
  onAssetSearchTerm: (term?: string | undefined) => void;
  onAssetsReload: () => void;
  setFileList: Dispatch<SetStateAction<UploadFile<File>[]>>;
  setUploading: Dispatch<SetStateAction<boolean>>;
  setUploadModalVisibility: Dispatch<SetStateAction<boolean>>;
}

const initialValues: FormValues = {
  fieldId: "",
  title: "",
  description: "",
  key: "",
  multiValue: false,
  unique: false,
  required: false,
  typeProperty: { text: { defaultValue: "", maxLength: 0 } },
};

const FieldUpdateModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
  handleFieldKeyUnique,
  selectedType,
  selectedField,
  assetList,
  fileList,
  loadingAssets,
  uploading,
  uploadModalVisibility,
  createAssets,
  onAssetSearchTerm,
  onAssetsReload,
  setFileList,
  setUploading,
  setUploadModalVisibility,
}) => {
  const t = useT();
  const [form] = Form.useForm();
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const { TabPane } = Tabs;
  const selectedValues: string[] = Form.useWatch("values", form);

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
    form.setFieldsValue({
      fieldId: selectedField?.id,
      title: selectedField?.title,
      description: selectedField?.description,
      key: selectedField?.key,
      multiValue: selectedField?.multiValue,
      unique: selectedField?.unique,
      required: selectedField?.required,
      defaultValue:
        selectedField?.typeProperty.defaultValue ||
        selectedField?.typeProperty.selectDefaultValue ||
        selectedField?.typeProperty.integerDefaultValue,
      min: selectedField?.typeProperty.min,
      max: selectedField?.typeProperty.max,
      maxLength: selectedField?.typeProperty.maxLength,
      values: selectedField?.typeProperty.values,
    });
  }, [form, selectedField]);

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
            asset: { defaultValue: values.defaultValue.uid },
          };
        } else if (selectedType === "Select") {
          values.typeProperty = {
            select: { defaultValue: values.defaultValue, values: values.values },
          };
        } else if (selectedType === "Integer") {
          values.typeProperty = {
            integer: { defaultValue: +values.defaultValue, min: +values.min, max: +values.max },
          };
        } else if (selectedType === "URL") {
          values.typeProperty = {
            url: { defaultValue: values.defaultValue },
          };
        }

        await onSubmit?.({
          ...values,
          fieldId: selectedField?.id,
        });
        form.resetFields();
        onClose?.(true);
      })
      .catch(info => {
        console.log("Validate Failed:", info);
      });
  }, [form, onClose, onSubmit, selectedType, selectedField?.id]);

  const handleClose = useCallback(() => {
    form.resetFields();
    onClose?.(true);
  }, [onClose, form]);

  const handleLinkAsset = useCallback((_asset: Asset) => {
    // TODO: implement link asset with FieldUpdateModal
  }, []);

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
              {t("Update")} {fieldTypes[selectedType].title}
            </h3>
          </FieldThumbnail>
        ) : null
      }
      visible={open}
      onCancel={handleClose}
      onOk={handleSubmit}
      okButtonProps={{ disabled: buttonDisabled }}>
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={() => {
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
        }}>
        <Tabs defaultActiveKey="settings">
          <TabPane tab={t("Setting")} key="setting" forceRender>
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
                "Field key must be unique and at least 5 characters long. It can only contain letters, numbers, underscores and dashes.",
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
              <TextArea rows={3} showCount maxLength={100} />
            </Form.Item>
            {selectedType === "Select" && (
              <>
                <div style={{ marginBottom: "8px" }}>{t("Set Options")}</div>
                <Form.List
                  name="values"
                  rules={[
                    {
                      validator: async (_, values) => {
                        if (!values || values.length < 1) {
                          return Promise.reject(new Error("At least 1 option"));
                        }
                      },
                    },
                  ]}>
                  {(fields, { add, remove }, { errors }) => (
                    <>
                      {fields.map((field, _) => (
                        <Form.Item required={false} key={field.key}>
                          <Form.Item
                            {...field}
                            validateTrigger={["onChange", "onBlur"]}
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: t("Please input value or delete this field."),
                              },
                            ]}
                            noStyle>
                            <Input
                              placeholder={t("Option value")}
                              style={{ width: "80%", marginRight: "8px" }}
                            />
                          </Form.Item>
                          {fields.length > 1 ? (
                            <Icon icon="minusCircle" onClick={() => remove(field.name)} />
                          ) : null}
                        </Form.Item>
                      ))}
                      <Form.Item>
                        <Button type="primary" onClick={() => add()} icon={<Icon icon="plus" />}>
                          {t("New")}
                        </Button>
                        <Form.ErrorList errors={errors} />
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              </>
            )}
            <Form.Item
              name="multiValue"
              valuePropName="checked"
              extra={t("Stores a list of values instead of a single value")}>
              <Checkbox>{t("Support multiple values")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab={t("Validation")} key="validation" forceRender>
            <FieldValidationInputs selectedType={selectedType} />
            <Form.Item
              name="required"
              valuePropName="checked"
              extra={t("Prevents saving an entry if this field is empty")}>
              <Checkbox>{t("Make field required")}</Checkbox>
            </Form.Item>
            <Form.Item
              name="unique"
              valuePropName="checked"
              extra={t("Ensures that multiple entries can't have the same value for this field")}>
              <Checkbox>{t("Set field as unique")}</Checkbox>
            </Form.Item>
          </TabPane>
          <TabPane tab={t("Default value")} key="defaultValue" forceRender>
            <FieldDefaultInputs
              selectedValues={selectedValues}
              selectedType={selectedType}
              assetList={assetList}
              fileList={fileList}
              loadingAssets={loadingAssets}
              uploading={uploading}
              uploadModalVisibility={uploadModalVisibility}
              createAssets={createAssets}
              onLink={handleLinkAsset}
              onAssetSearchTerm={onAssetSearchTerm}
              onAssetsReload={onAssetsReload}
              setFileList={setFileList}
              setUploading={setUploading}
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
