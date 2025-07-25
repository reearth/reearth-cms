import styled from "@emotion/styled";
import React from "react";

import { useT } from "@reearth-cms/i18n";

import cmsIcon from "./cms.svg";

type Props = {
  username?: string;
  coverImageUrl?: string;
};

const Greeting: React.FC<Props> = ({ username, coverImageUrl }) => {
  const t = useT();

  return coverImageUrl ? (
    <CoverImage src={coverImageUrl} />
  ) : (
    <DashboardCard>
      <img src={cmsIcon} alt="CMS Icon" />
      <div>
        <Title>{t("Welcome to Re:Earth CMS, {{username}}!", { username })}</Title>
        <SubTitle>
          {t(
            "Re:Earth CMS is a robust tool for collecting, creating, storing, and managing data, specifically designed for GIS applications.",
          )}
        </SubTitle>
      </div>
    </DashboardCard>
  );
};

const DashboardCard = styled.div`
  padding: 24px;
  height: 121px;

  background: #ffffff;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.p`
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
`;

const SubTitle = styled.p`
  color: rgba(0, 0, 0, 0.45);
  margin-bottom: 0px;
  font-size: 12.8px;
  font-style: normal;
  font-weight: 400;
`;

const CoverImage = styled.img`
  width: 100%;
  height: 121px;
  object-fit: cover;
`;

export default Greeting;
