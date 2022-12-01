import styled from "@emotion/styled";
import { CSSProperties } from "react";

type StatusProps = {
  status: string;
  color: CSSProperties["color"];
};

const Status: React.FC<StatusProps> = ({ status, color }) => {
  return (
    <StatusWrapper>
      <Circle color={color} />
      <StatusValue>{status}</StatusValue>
    </StatusWrapper>
  );
};

const StatusWrapper = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
`;

const Circle = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 0px;
  width: 6px;
  height: 6px;
  border-radius: 100px;
  background-color: ${props => props.color};
  margin-right: 8px;
`;

const StatusValue = styled.span`
  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  color: rgba(0, 0, 0, 0.85);
`;
export default Status;
