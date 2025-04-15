import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";

type Props = {
  title: string;
  collapsed: boolean;
  titleIcon: string;
};

const ModelListHeader: React.FC<Props> = ({ title, collapsed, titleIcon }) => {
  return (
    <>
      {collapsed ? (
        <StyledIcon icon={titleIcon} />
      ) : (
        <Header>
          <SchemaStyledTitle>{title}</SchemaStyledTitle>
        </Header>
      )}
    </>
  );
};

const Header = styled.div`
  padding: 22px 20px 4px 20px;
`;

const SchemaStyledTitle = styled.h2``;

const StyledIcon = styled(Icon)`
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 20px;
`;

export default ModelListHeader;
