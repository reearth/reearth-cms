import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";

import Avatar, { AvatarProps } from "../Avatar";

type Props = {
  username?: string;
  shadow?: boolean;
  profilePictureUrl?: string;
} & AvatarProps;

const UserAvatar: React.FC<Props> = ({ username, shadow, profilePictureUrl, ...props }) => {
  const anonymous = username === "Anonymous";
  return (
    <UserAvatarWrapper shadow={shadow} anonymous={anonymous} src={profilePictureUrl} {...props}>
      {anonymous ? <Icon icon="user" /> : username?.charAt(0)}
    </UserAvatarWrapper>
  );
};

const UserAvatarWrapper = styled(Avatar)<{ shadow?: boolean; anonymous?: boolean }>`
  color: #000000;
  background-color: ${({ anonymous }) => (anonymous ? "#BFBFBF" : "#ECECEC")};
  box-shadow: ${({ shadow }) => (shadow ? "0px 4px 4px rgba(0, 0, 0, 0.25)" : "none")};
`;

export default UserAvatar;
