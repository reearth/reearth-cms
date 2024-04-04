import { PageHeader, PageHeaderProps } from "@ant-design/pro-layout";
import styled from "@emotion/styled";

export type Props = PageHeaderProps;

const Header: React.FC<Props> = props => {
  return <StyledPageHeader {...props} />;
};

const StyledPageHeader = styled(PageHeader)`
  background-color: #fff;
  padding: 16px 24px;
`;

export default Header;
