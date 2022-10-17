import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import { useT } from "@reearth-cms/i18n";

type Props = {
  title: string;
  subtitle?: string;
  handleSave: () => void;
};

const AssetHeader: React.FC<Props> = ({ title, subtitle, handleSave }) => {
  const t = useT();
  return (
    <AssetHeaderWrapper>
      <HeaderTitleWrapper>
        <HeaderTitle>{title}</HeaderTitle>
        {subtitle && <HeaderSubTitle>{subtitle}</HeaderSubTitle>}
      </HeaderTitleWrapper>
      <Button onClick={handleSave}>{t("Save")}</Button>
    </AssetHeaderWrapper>
  );
};

const AssetHeaderWrapper = styled.div`
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  margin: 0 16px 0 0;
`;

const HeaderSubTitle = styled.h3`
  margin: 0;
`;

export default AssetHeader;
