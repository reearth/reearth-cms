import styled from "@emotion/styled";
import { useCallback, useEffect, useMemo, useState, useRef, MutableRefObject } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Checkbox from "@reearth-cms/components/atoms/Checkbox";
import Form, { FormInstance, ValidateErrorEntity } from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Input from "@reearth-cms/components/atoms/Input";
import Modal from "@reearth-cms/components/atoms/Modal";
import Radio from "@reearth-cms/components/atoms/Radio";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import Steps from "@reearth-cms/components/atoms/Step";
import Tabs from "@reearth-cms/components/atoms/Tabs";
import TextArea from "@reearth-cms/components/atoms/TextArea";
import { keyAutoFill, keyReplace } from "@reearth-cms/components/molecules/Common/Form/utils";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fieldTypes } from "@reearth-cms/components/molecules/Schema/fieldTypes";
import {
  Field,
  FieldModalTabs,
  FormValues,
  CorrespondingField,
} from "@reearth-cms/components/molecules/Schema/types";
import { useT } from "@reearth-cms/i18n";
import { MAX_KEY_LENGTH, validateKey } from "@reearth-cms/utils/regex";

const { Step } = Steps;
const { TabPane } = Tabs;

type Props = {
  models?: Model[];
  selectedType: "Reference";
  selectedField: Field | null;
  open: boolean;
  isLoading: boolean;
  handleReferencedModelGet: (modelId: string) => void;
  handleCorrespondingFieldKeyUnique: (key: string) => boolean;
  handleFieldKeyUnique: (key: string) => boolean;
  onClose: () => void;
  onSubmit: (values: FormValues) => Promise<void>;
  onUpdate: (values: FormValues) => Promise<void>;
};

const FieldCreationModalWithSteps: React.FC<Props> = ({
  models,
  selectedType,
  selectedField,
  open,
  isLoading,
  handleReferencedModelGet,
  handleCorrespondingFieldKeyUnique,
  handleFieldKeyUnique,
  onClose,
  onSubmit,
  onUpdate,
}) => {
  const t = useT();
  const [selectedModelId, setSelectedModelId] = useState<string>();
  const schemaIdRef = useRef<string>();
  const [modelForm] = Form.useForm();
  const [field1Form] = Form.useForm();
  const [field2Form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [numSteps, setNumSteps] = useState(1);
  const [activeTab, setActiveTab] = useState<FieldModalTabs>("settings");
  const [isDisabled, setIsDisabled] = useState(true);
  const isDisabledCache = useRef<boolean>(true);
  const prevFieldKey = useRef<{ key: string; isSuccess: boolean }>();
  const prevCorrespondingKey = useRef<{ key: string; isSuccess: boolean }>();
  const defaultFieldValues = useRef<Field>();
  const defaultCorrespondingValues = useRef<CorrespondingField>();
  const changedKeys = useRef(new Set<string>());

  const formValidate = useCallback(
    async (form: FormInstance) => {
      if (
        form.getFieldValue("model") ||
        (form.getFieldValue("title") && form.getFieldValue("key"))
      ) {
        try {
          await form.validateFields();
        } catch (e) {
          if ((e as ValidateErrorEntity).errorFields.length > 0) {
            setIsDisabled(true);
            return;
          }
        }
        setIsDisabled(currentStep === numSteps && changedKeys.current.size === 0);
      } else {
        setIsDisabled(true);
      }
    },
    [currentStep, numSteps],
  );

  const handleValuesChange = useCallback(
    async (
      changedValues: Field | CorrespondingField,
      ref: MutableRefObject<typeof changedValues | undefined>,
    ) => {
      const [key, value] = Object.entries(changedValues)[0];
      const defaultValue = ref.current?.[key as keyof typeof changedValues];
      if (value === defaultValue) {
        changedKeys.current.delete(currentStep + key);
      } else {
        changedKeys.current.add(currentStep + key);
      }
    },
    [currentStep],
  );

  const SettingValues = Form.useWatch([], modelForm);
  useEffect(() => {
    if (currentStep === 0) {
      formValidate(modelForm);
    }
  }, [modelForm, SettingValues, formValidate, currentStep]);

  const FieldValues = Form.useWatch([], field1Form);
  useEffect(() => {
    if (currentStep === 1) {
      formValidate(field1Form);
    }
  }, [field1Form, FieldValues, formValidate, currentStep]);

  const CorrespondingValues = Form.useWatch([], field2Form);
  useEffect(() => {
    if (currentStep === 2) {
      formValidate(field2Form);
    }
  }, [field2Form, CorrespondingValues, formValidate, currentStep]);

  useEffect(() => {
    modelForm.setFieldsValue({
      model: selectedField?.typeProperty?.modelId,
      direction: selectedField?.typeProperty?.correspondingField ? 2 : 1,
    });

    setSelectedModelId(selectedField?.typeProperty?.modelId);
    schemaIdRef.current = selectedField?.typeProperty?.schema?.id;
    setNumSteps(selectedField?.typeProperty?.correspondingField ? 2 : 1);
    setIsDisabled(!selectedField);
    field1Form.setFieldsValue(selectedField);
    defaultFieldValues.current = selectedField ?? undefined;
    field2Form.setFieldsValue(selectedField?.typeProperty?.correspondingField);
    defaultCorrespondingValues.current = selectedField?.typeProperty?.correspondingField;
    changedKeys.current.clear();
  }, [modelForm, selectedField, field1Form, field2Form, setNumSteps, setSelectedModelId]);

  const initialValues: FormValues = useMemo(
    () => ({
      title: "",
      description: "",
      key: "",
      multiple: false,
      unique: false,
      required: false,
      isTitle: false,
      metadata: false,
      type: "Text",
      typeProperty: {
        reference: {
          modelId: "",
          schemaId: "",
          correspondingField: null,
        },
      },
    }),
    [],
  );

  const requiredMark = (
    label: React.ReactNode,
    { required }: { required: boolean },
    isShow = true,
  ) => (
    <>
      {required && <Required>*</Required>}
      {label}
      {isShow && !required && <Optional>{`(${t("optional")})`}</Optional>}
    </>
  );

  const isTwoWayReference = useMemo(() => numSteps === 2, [numSteps]);
  const isUpdate = useMemo(() => !!selectedField, [selectedField]);

  const [field1FormValues, setField1FormValues] = useState(initialValues);

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveTab(key as FieldModalTabs);
    },
    [setActiveTab],
  );

  const handleSelectModel = useCallback(
    (modelId: string, option: { schemaId: string }) => {
      setSelectedModelId(modelId);
      schemaIdRef.current = option.schemaId;
    },
    [setSelectedModelId],
  );

  const formReset = useCallback(() => {
    prevFieldKey.current = undefined;
    prevCorrespondingKey.current = undefined;
    modelForm.resetFields();
    field1Form.resetFields();
    field2Form.resetFields();
  }, [field1Form, field2Form, modelForm]);

  const modalReset = useCallback(() => {
    setCurrentStep(0);
    setNumSteps(1);
    setIsDisabled(true);
    setField1FormValues(initialValues);
  }, [initialValues, setCurrentStep]);

  const handleAfterClose = useCallback(() => {
    formReset();
    modalReset();
  }, [formReset, modalReset]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    setActiveTab("settings");
    isDisabledCache.current = isDisabled;
    setIsDisabled(false);
  }, [currentStep, isDisabled]);

  const nextStep = useCallback(() => {
    setCurrentStep(currentStep + 1);
    setActiveTab("settings");
    setIsDisabled(isDisabledCache.current);
  }, [currentStep]);

  const handleSettingField = useCallback(() => {
    if (numSteps === 2 && selectedModelId) {
      handleReferencedModelGet(selectedModelId);
    }
    nextStep();
  }, [handleReferencedModelGet, nextStep, numSteps, selectedModelId]);

  const handleFirstField = useCallback(async () => {
    try {
      const values = await field1Form.validateFields();
      values.type = "Reference";
      values.typeProperty = {
        reference: {
          modelId: selectedModelId,
          schemaId: schemaIdRef.current,
          correspondingField: null,
        },
      };
      setField1FormValues(values);
      if (currentStep < numSteps) {
        nextStep();
      } else {
        if (selectedField) {
          await onUpdate({ ...values, fieldId: selectedField.id });
        } else {
          await onSubmit(values);
        }
        onClose();
      }
    } catch (e) {
      console.error(e);
    }
  }, [
    field1Form,
    selectedModelId,
    currentStep,
    numSteps,
    nextStep,
    selectedField,
    onClose,
    onUpdate,
    onSubmit,
  ]);

  const handleSecondField = useCallback(async () => {
    try {
      const fields2Values = await field2Form.validateFields();
      field1FormValues.typeProperty = {
        reference: {
          modelId: selectedModelId ?? "",
          schemaId: schemaIdRef.current ?? "",
          correspondingField: {
            ...fields2Values,
            fieldId: selectedField?.typeProperty?.correspondingField?.id,
          },
        },
      };
      if (selectedField) {
        await onUpdate({ ...field1FormValues, fieldId: selectedField.id });
      } else {
        await onSubmit(field1FormValues);
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  }, [onClose, onSubmit, onUpdate, selectedField, field1FormValues, field2Form, selectedModelId]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, fieldForm: FormInstance) => {
      if (selectedField) return;
      keyAutoFill(e, { form: fieldForm, key: "key" });
    },
    [selectedField],
  );

  const handleKeyChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, fieldForm: FormInstance) => {
      keyReplace(e, { form: fieldForm, key: "key" });
    },
    [],
  );

  const keyValidate = useCallback(
    (value: string, prevKey: typeof prevFieldKey, handleKeyUnique: typeof handleFieldKeyUnique) => {
      if (prevKey.current?.key === value) {
        return prevKey.current?.isSuccess ? Promise.resolve() : Promise.reject();
      } else if (validateKey(value) && handleKeyUnique(value)) {
        prevKey.current = { key: value, isSuccess: true };
        return Promise.resolve();
      } else {
        prevKey.current = { key: value, isSuccess: false };
        return Promise.reject();
      }
    },
    [],
  );

  return (
    <StyledModal
      title={
        selectedType ? (
          <FieldThumbnail>
            <StyledIcon
              icon={fieldTypes[selectedType].icon}
              color={fieldTypes[selectedType].color}
            />
            <h3>
              {selectedField
                ? t("Update Field", { field: selectedField.title })
                : t("Create Field", { field: t(fieldTypes[selectedType].title) })}
            </h3>
          </FieldThumbnail>
        ) : null
      }
      onCancel={onClose}
      afterClose={handleAfterClose}
      width={572}
      open={open}
      footer={
        <>
          {currentStep === 2 ? (
            <Button key="previous" type="default" onClick={prevStep} disabled={isLoading}>
              {t("Previous")}
            </Button>
          ) : (
            <div key="placeholder" />
          )}
          {currentStep === 0 && (
            <Button key="next" type="primary" onClick={handleSettingField} disabled={isDisabled}>
              {t("Next")}
            </Button>
          )}
          {currentStep === 1 && (
            <Button
              key="next"
              type="primary"
              onClick={handleFirstField}
              disabled={isDisabled}
              loading={isLoading}>
              {currentStep !== numSteps ? t("Next") : t("Confirm")}
            </Button>
          )}
          {currentStep === 2 && (
            <Button
              key="submit"
              type="primary"
              onClick={handleSecondField}
              disabled={isDisabled}
              loading={isLoading}>
              {t("Confirm")}
            </Button>
          )}
        </>
      }>
      <StyledSteps progressDot current={currentStep} numSteps={numSteps}>
        <Step title={t("Reference setting")} />
        <Step title={t("Field")} />
        {numSteps === 2 && <Step title={t("Corresponding field")} />}
      </StyledSteps>
      {currentStep === 0 && (
        <Form
          form={modelForm}
          layout="vertical"
          requiredMark={(label, info) => requiredMark(label, info, false)}>
          <StyledFormItem
            name="model"
            label={t("Select the model to reference")}
            rules={[{ required: true, message: t("Please select the model!") }]}>
            <Select value={selectedModelId} onSelect={handleSelectModel} disabled={isUpdate}>
              {models?.map(model => (
                <Select.Option key={model.id} value={model.id} schemaId={model.schema.id}>
                  {model.name}{" "}
                  <StyledModelKey className="ant-form-item-extra">#{model.key}</StyledModelKey>
                </Select.Option>
              ))}
            </Select>
          </StyledFormItem>
          <StyledFormItem name="direction" label={t("Reference direction")}>
            <Radio.Group
              onChange={e => setNumSteps(e.target.value)}
              value={numSteps}
              defaultValue={1}>
              <Space direction="vertical" size={0}>
                <Radio value={1} disabled={isUpdate}>
                  {t("One-way reference")}
                </Radio>
                <div className="ant-form-item-extra">
                  {t("A unidirectional relationship where an item refers to another item")}
                </div>
                <Radio value={2} disabled={isUpdate}>
                  {t("Two-way reference")}
                </Radio>
                <div className="ant-form-item-extra">
                  {t("A bidirectional relationship where two items refer to each other")}
                </div>
              </Space>
            </Radio.Group>
          </StyledFormItem>
        </Form>
      )}
      {currentStep === 1 && (
        <Form
          form={field1Form}
          layout="vertical"
          initialValues={initialValues}
          requiredMark={requiredMark}
          onValuesChange={changedValues => {
            handleValuesChange(changedValues, defaultFieldValues);
          }}>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab={t("Settings")} key="settings" forceRender>
              <Form.Item
                name="title"
                label={t("Display name")}
                rules={[{ required: true, message: t("Please input the display name of field!") }]}>
                <Input
                  onChange={e => {
                    handleNameChange(e, field1Form);
                  }}
                />
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
                      await keyValidate(value, prevFieldKey, handleFieldKeyUnique);
                    },
                  },
                ]}>
                <Input
                  onChange={e => {
                    handleKeyChange(e, field1Form);
                  }}
                  showCount
                  maxLength={MAX_KEY_LENGTH}
                />
              </Form.Item>
              <Form.Item name="description" label={t("Description")}>
                <TextArea rows={3} showCount maxLength={1000} />
              </Form.Item>
              <Form.Item
                name="multiple"
                valuePropName="checked"
                extra={t("Stores a list of values instead of a single value")}>
                <Checkbox disabled>{t("Support multiple values")}</Checkbox>
              </Form.Item>
              <Form.Item
                hidden
                name="isTitle"
                valuePropName="checked"
                extra={t("Only one field can be used as the title")}>
                <Checkbox>{t("Use as title")}</Checkbox>
              </Form.Item>
            </TabPane>
            <TabPane tab={t("Validation")} key="validation" forceRender>
              <Form.Item
                name="required"
                valuePropName="checked"
                extra={t("Prevents saving an entry if this field is empty")}>
                <Checkbox>{t("Make field required")}</Checkbox>
              </Form.Item>
              <Form.Item
                name="unique"
                valuePropName="checked"
                extra={t(
                  "Ensures that a multiple entries can't have the same value for this field",
                )}>
                <Checkbox disabled={isTwoWayReference}>{t("Set field as unique")}</Checkbox>
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      )}
      {currentStep === 2 && (
        <Form
          form={field2Form}
          layout="vertical"
          initialValues={initialValues}
          requiredMark={requiredMark}
          onValuesChange={changedValues => {
            handleValuesChange(changedValues, defaultCorrespondingValues);
          }}>
          <Tabs activeKey={activeTab} onChange={handleTabChange}>
            <TabPane tab={t("Settings")} key="settings" forceRender>
              <Form.Item
                name="title"
                label={t("Display name")}
                rules={[{ required: true, message: t("Please input the display name of field!") }]}>
                <Input
                  onChange={e => {
                    handleNameChange(e, field2Form);
                  }}
                />
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
                      await keyValidate(
                        value,
                        prevCorrespondingKey,
                        handleCorrespondingFieldKeyUnique,
                      );
                    },
                  },
                ]}>
                <Input
                  onChange={e => {
                    handleKeyChange(e, field2Form);
                  }}
                  showCount
                  maxLength={MAX_KEY_LENGTH}
                />
              </Form.Item>
              <Form.Item name="description" label={t("Description")}>
                <TextArea rows={3} showCount maxLength={1000} />
              </Form.Item>
            </TabPane>
            <TabPane tab={t("Validation")} key="validation" forceRender>
              <Form.Item
                name="required"
                valuePropName="checked"
                extra={t("Prevents saving an entry if this field is empty")}>
                <Checkbox>{t("Make field required")}</Checkbox>
              </Form.Item>
            </TabPane>
          </Tabs>
        </Form>
      )}
    </StyledModal>
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

const StyledFormItem = styled(Form.Item)`
  .ant-row.ant-form-item-row {
    display: block;
  }
`;

const StyledSteps = styled(Steps)<{ numSteps: number }>`
  padding: ${({ numSteps }) => (numSteps === 1 ? "30px 24px 38px" : "30px 0 38px")};
  .ant-steps-item-title {
    white-space: nowrap;
  }
  .ant-steps-item-active {
    font-weight: 600;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-footer {
    display: flex;
    justify-content: space-between;
  }
`;

const StyledModelKey = styled.span`
  font-size: 12px;
  margin-left: 4px;
`;

export default FieldCreationModalWithSteps;
