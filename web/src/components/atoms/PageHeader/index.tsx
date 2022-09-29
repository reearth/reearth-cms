import styled from "@emotion/styled";
import { PageHeader, PageHeaderProps } from "antd";

export type Props = PageHeaderProps & {
  backgroundColor?: string;
};

const Header: React.FC<Props> = ({ ...props }) => {
  return <StyledPageHeader {...props} backgroundColor={props.backgroundColor} />;
};

const StyledPageHeader = styled(PageHeader)<{ backgroundColor?: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor ?? "#FFF"};
`;

export default Header;
