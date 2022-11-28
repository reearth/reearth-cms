import styled from "@emotion/styled";

import { useT } from "@reearth-cms/i18n";

export type Props = {
  title: string;
  isUnique: boolean;
};

const FieldTitle: React.FC<Props> = ({ title, isUnique }) => {
  const t = useT();

  return (
    <>
      <Title>{title}</Title>
      {isUnique ? <FieldUnique>({t("unique")})</FieldUnique> : ""}
    </>
  );
};

export default FieldTitle;

const FieldUnique = styled.span`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
`;

const Title = styled.span`
  color: #000000d9;
  font-weight: 400;
`;
