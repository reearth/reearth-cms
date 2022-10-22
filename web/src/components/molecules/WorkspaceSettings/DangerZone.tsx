import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import { useT } from "@reearth-cms/i18n";

export type Props = {};

const DangerZone: React.FC<Props> = () => {
  const t = useT();

  return (
    <>
      <Title>Remove Workspace</Title>
      <Text>
        Permanently remove your Workspace and all of its contents from the Re:Earth CMS. This action
        is not reversible – please continue with caution.
      </Text>

      <Button onClick={() => {}} type="primary" danger>
        {t("Remove Workspace")}
      </Button>
    </>
  );
};

export default DangerZone;

const Title = styled.h1`
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.85);
`;

const Text = styled.p`
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
  margin: 24px 0;
`;
