import styled from "@emotion/styled";

import Avatar, { AvatarProps } from "../Avatar";

type Props = {
  username?: string;
  shadow?: boolean;
} & AvatarProps;

const UserAvatar: React.FC<Props> = ({ username, shadow, ...props }) => {
  return (
    <UserAvatarWrapper shadow={shadow} {...props}>
      {username?.charAt(0)}
    </UserAvatarWrapper>
  );
};

const UserAvatarWrapper = styled(Avatar) <{ shadow?: boolean }>`
  color: #fff;
  background-color: #3f3d45;
  box-shadow: ${({ shadow }) => (shadow ? "0px 4px 4px rgba(0, 0, 0, 0.25)" : "none")};
`;

export default UserAvatar;
