import { PageHeader, PageHeaderProps } from "@ant-design/pro-components";
import styled from "@emotion/styled";

import { AntdToken } from "@reearth-cms/utils/style";

export type Props = PageHeaderProps;

const Header: React.FC<Props> = props => {
  return <StyledPageHeader {...props} />;
};

const StyledPageHeader = styled(PageHeader)`
  padding: ${AntdToken.SPACING.BASE}px ${AntdToken.SPACING.LG}px;
  .ant-page-header-heading {
    flex-wrap: inherit;
  }
`;

export default Header;
