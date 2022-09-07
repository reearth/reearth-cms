import styled from "@emotion/styled";
import React from "react";

import { useT } from "@reearth-cms/i18n";

const Greeting: React.FC = () => {
  const t = useT();

  return <DashboardCard>{t("Welcome to Re:Earth CMS !")}</DashboardCard>;
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
