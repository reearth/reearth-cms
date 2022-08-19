import styled from "@emotion/styled";
import React from "react";

const Greeting: React.FC = () => {
  return <DashboardCard>Welcome to Re:Earth CMS !</DashboardCard>;
};

const DashboardCard = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 24px;

  height: 121px;

  background: linear-gradient(79.71deg, #1e2086 0%, #df3013 66.79%, #df3013 93.02%);
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: #fff;
`;

export default Greeting;
