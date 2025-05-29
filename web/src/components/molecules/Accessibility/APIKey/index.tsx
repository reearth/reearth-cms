import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import { useT } from "@reearth-cms/i18n";

import APIKeyTable from "./APIKeyTable";

type Props = {
  isPublic: boolean;
  keys: any[];
};

const APIKeyComponent: React.FC<Props> = ({ isPublic, keys }) => {
  const t = useT();

  const handleClick = () => {
    // Logic to change project visibility
    console.log("Change project visibility clicked");
  };

  return (
    <ContentSection title="API Key">
      <StyledTokenInput>
        <Button icon={<Icon icon="plus" />} disabled={isPublic}>
          {t("New Key")}
        </Button>
      </StyledTokenInput>
      {isPublic ? (
        <PublicContainer>
          <Header>{t("Please transfer your project to private to use the API key")}</Header>
          <Paragraph>
            {t("Customize your API key to control the visibility of your models")}
          </Paragraph>
          <Button type="primary" onClick={handleClick}>
            {t("Change project visibility")}
          </Button>
        </PublicContainer>
      ) : (
        <APIKeyTable keys={keys} />
      )}
    </ContentSection>
  );
};

export default APIKeyComponent;

const StyledTokenInput = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const PublicContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Header = styled.h3`
  color: #262626;
  padding-bottom: 162x;
`;

const Paragraph = styled.p`
  color: #8c8c8c;
  padding-bottom: 162x;
`;
