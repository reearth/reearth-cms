import styled from "@emotion/styled";
import { Steps } from "antd";

import Icon from "@reearth-cms/components/atoms/Icon";
import { RequestState } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  requestState: RequestState;
};

const RequestStatus: React.FC<Props> = ({ requestState }) => {
  const t = useT();
  const { Step } = Steps;

  return (
    <StyledSteps direction="vertical" current={1}>
      {requestState === "APPROVED" && (
        <Step
          icon={<StyledIcon icon="checkCircle" color="#52C41A" size={28} />}
          title={<StatusTitle>{t("Approved")}</StatusTitle>}
        />
      )}
      {requestState === "CLOSED" && (
        <Step
          icon={<StyledIcon icon="closeCircle" color="#BFBFBF" size={28} />}
          title={<StatusTitle>{t("Closed")}</StatusTitle>}
        />
      )}
    </StyledSteps>
  );
};

const StyledSteps = styled(Steps)`
  position: relative;
  max-width: 100%;
  padding: 36px 0 0 44px;
  display: inline-block;
  .ant-steps-item-icon::before {
    content: "";
    display: block;
    position: absolute;
    width: 4px;
    height: 24px;
    background-color: #d9d9d9;
    left: 16px;
    top: -30px;
  }
`;

const StyledIcon = styled(Icon)`
  padding-top: 3px;
  padding-left: 3px;
`;

const StatusTitle = styled.p`
  display: inline;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  color: #00000073;
`;

export default RequestStatus;
