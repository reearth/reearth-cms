import styled from "@emotion/styled";
import React from "react";

import { useT } from "@reearth-cms/i18n";

const Greeting: React.FC = () => {
  const t = useT();

  return (
    <DashboardCard>
      <Text>{t("Welcome to Re:Earth CMS !")}</Text>
    </DashboardCard>
  );
};

const DashboardCard = styled.div`
  padding: 24px;
  height: 121px;

  background: linear-gradient(79.71deg, #1e2086 0%, #df3013 66.79%, #df3013 93.02%);
`;

const Text = styled.p`
  font-family: "Roboto";
  font-weight: 500;
  font-size: 20px;
  line-height: 28px;
  color: #fff;
  margin: 0;
`;

export default Greeting;
