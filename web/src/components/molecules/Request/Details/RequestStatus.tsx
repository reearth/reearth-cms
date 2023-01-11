import styled from "@emotion/styled";
import { Steps } from "antd";

import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

type Props = {
  className?: string;
  approvedAt?: Date;
  closedAt?: Date;
};

const RequestStatus: React.FC<Props> = ({ className, approvedAt, closedAt }) => {
  const t = useT();
  const { Step } = Steps;

  return (
    <StyledSteps className={className} direction="vertical" current={1}>
      {approvedAt && (
        <Step
          icon={<Icon icon="checkCircle" color="#52C41A" size={32} />}
          title={<StatusTitle>{t("Approved")}</StatusTitle>}
        />
      )}
      {closedAt && (
        <Step
          icon={<Icon icon="closeCircle" color="#BFBFBF" size={32} />}
          title={<StatusTitle>{t("Closed")}</StatusTitle>}
        />
      )}
    </StyledSteps>
  );
};

const StyledSteps = styled(Steps)`
  position: relative;
  max-width: 100%;
  padding: 16px 44px;
  display: inline-block;
  .ant-steps-item-icon::before {
    content: "";
    display: block;
    position: absolute;
    width: 4px;
    height: 24px;
    background-color: #d9d9d9;
    left: 16px;
    top: -28px;
  }
`;

const StatusTitle = styled.p`
  display: inline;
  font-weight: 500;
  font-size: 14px;
  line-height: 22px;
  color: #000000d9;
`;

// const StatusText = styled.p`
//   display: inline;
//   font-weight: 400;
//   font-size: 14px;
//   line-height: 22px;
//   margin-left: 12px;
// `;

export default RequestStatus;
