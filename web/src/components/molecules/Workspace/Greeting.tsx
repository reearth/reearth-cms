import styled from "@emotion/styled";
import React from "react";

import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

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
      <Title>{t("Welcome to Re:Earth CMS, {{username}}!", { username })}</Title>
      <SubTitle>
        {t(
          "Re:Earth CMS is a robust tool for collecting, creating, storing, and managing data, specifically designed for GIS applications.",
        )}
      </SubTitle>
    </DashboardCard>
  );
};

const DashboardCard = styled.div`
  padding: ${AntdToken.SPACING.LG}px;
  height: 121px;
  background: ${AntdColor.NEUTRAL.BG_WHITE};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: ${AntdToken.SPACING.BASE}px;
`;

const Title = styled.p`
  color: ${AntdColor.NEUTRAL.TEXT};
  margin-bottom: 0;
  font-size: ${AntdToken.FONT.SIZE_HEADING_3}px;
  font-style: normal;
  font-weight: 600;
`;

const SubTitle = styled.p`
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
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
