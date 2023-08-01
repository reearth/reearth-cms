import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Form from "@reearth-cms/components/atoms/Form";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal from "@reearth-cms/components/atoms/Modal";
import Radio from "@reearth-cms/components/atoms/Radio";
import Space from "@reearth-cms/components/atoms/Space";
import Steps from "@reearth-cms/components/atoms/Step";
import { useT } from "@reearth-cms/i18n";

import { fieldTypes } from "../../fieldTypes";
import { FieldType } from "../../types";

const { Step } = Steps;

export type Props = {
  open?: boolean;
  selectedType: FieldType;
  onClose?: (refetch?: boolean) => void;
};

const FieldCreationModalWithSteps: React.FC<Props> = ({ open, selectedType, onClose }) => {
  const t = useT();
  const [currentStep, setCurrentStep] = useState(0);
  const [numSteps, setNumSteps] = useState(2);

  const nextStep = useCallback(() => {
    if (currentStep < numSteps) setCurrentStep(currentStep + 1);
  }, [currentStep, numSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }, [currentStep]);

  const handleModalReset = useCallback(() => {
    setCurrentStep(0);
  }, []);

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
              {t("Create")} {t(fieldTypes[selectedType].title)} {t("Field")}
            </h3>
          </FieldThumbnail>
        ) : null
      }
      onCancel={() => onClose?.(true)}
      width={700}
      open={open}
      afterClose={handleModalReset}
      footer={
        <>
          {currentStep === 2 ? (
            <Button key="previous" type="default" onClick={prevStep}>
              {t("Previous")}
            </Button>
          ) : (
            <div key="placeholder" />
          )}
          {currentStep !== numSteps ? (
            <Button key="next" type="primary" onClick={nextStep}>
              {t("Next")}
            </Button>
          ) : (
            <Button key="next" type="primary" onClick={nextStep}>
              {t("Confirm")}
            </Button>
          )}
        </>
      }>
      <Steps progressDot current={currentStep}>
        <StyledStep title={t("Reference setting")} />
        <StyledStep title={t("Field")} />
        <StyledStep title={t("Corresponding field")} />
      </Steps>
      {currentStep === 0 && (
        <Form>
          <StyledFormItem label={t("Reference direction")}>
            <Radio.Group onChange={e => setNumSteps(e.target.value)} value={numSteps}>
              <Space direction="vertical" size={0}>
                <Radio value={1}>{t("One-way reference")}</Radio>
                <div className="ant-form-item-extra">
                  {t("A unidirectional relationship where an item refers to another item")}
                </div>
                <Radio value={2}>{t("Two-way reference")}</Radio>
                <div className="ant-form-item-extra">
                  {t("A bidirectional relationship where two items refer to each other")}
                </div>
              </Space>
            </Radio.Group>
          </StyledFormItem>
        </Form>
      )}
      {currentStep === 1 && (
        <Form>
          <h1>Second step</h1>
        </Form>
      )}
      {currentStep === 2 && (
        <Form>
          <h1>Third step</h1>
        </Form>
      )}
    </StyledModal>
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

const StyledFormItem = styled(Form.Item)`
  .ant-row.ant-form-item-row {
    display: block;
  }
`;

const StyledStep = styled(Step)`
  .ant-steps-item-title {
    white-space: nowrap;
  }
`;

const StyledModal = styled(Modal)`
  .ant-modal-footer {
    display: flex;
    justify-content: space-between;
  }
`;

export default FieldCreationModalWithSteps;
