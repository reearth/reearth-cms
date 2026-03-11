import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

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
  padding: 22px ${AntdToken.SPACING.MD}px ${AntdToken.SPACING.XXS}px ${AntdToken.SPACING.MD}px;
`;

const SchemaStyledTitle = styled.h2``;

const StyledIcon = styled(Icon)`
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  padding: ${AntdToken.SPACING.SM}px ${AntdToken.SPACING.MD}px;
`;

export default ModelListHeader;
