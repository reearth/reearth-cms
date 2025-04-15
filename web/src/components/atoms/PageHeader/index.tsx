import { PageHeader, PageHeaderProps } from "@ant-design/pro-layout";
import styled from "@emotion/styled";

export type Props = PageHeaderProps;

const Header: React.FC<Props> = props => {
  return <StyledPageHeader {...props} />;
};

const StyledPageHeader = styled(PageHeader)`
  padding: 16px 24px;
  .ant-page-header-heading {
    flex-wrap: inherit;
  }
`;

export default Header;
