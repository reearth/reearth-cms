import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";

import Avatar, { AvatarProps } from "../Avatar";

type Props = {
  profilePictureUrl?: string;
  shadow?: boolean;
  username?: string;
} & AvatarProps;

const UserAvatar: React.FC<Props> = ({ profilePictureUrl, shadow, username, ...props }) => {
  const anonymous = username === "Anonymous";
  return profilePictureUrl ? (
    <Avatar alt="User avatar" src={profilePictureUrl} {...props} />
  ) : (
    <UserAvatarWrapper anonymous={anonymous} shadow={shadow} {...props}>
      {anonymous ? <Icon icon="user" /> : username?.charAt(0)}
    </UserAvatarWrapper>
  );
};

const UserAvatarWrapper = styled(Avatar)<{ anonymous?: boolean; shadow?: boolean; }>`
  color: #000000;
  background-color: ${({ anonymous }) => (anonymous ? "#BFBFBF" : "#ECECEC")};
  box-shadow: ${({ shadow }) => (shadow ? "0px 4px 4px rgba(0, 0, 0, 0.25)" : "none")};
`;

export default UserAvatar;
