import styled from "@emotion/styled";

import Icon from "@reearth-cms/components/atoms/Icon";
import { AntdColor, CustomColor } from "@reearth-cms/utils/style";

import Avatar, { AvatarProps } from "../Avatar";

type Props = {
  username?: string;
  shadow?: boolean;
  profilePictureUrl?: string;
} & AvatarProps;

const UserAvatar: React.FC<Props> = ({ username, shadow, profilePictureUrl, ...props }) => {
  const anonymous = username === "Anonymous";
  return profilePictureUrl ? (
    <Avatar src={profilePictureUrl} alt="User avatar" {...props} />
  ) : (
    <UserAvatarWrapper shadow={shadow} anonymous={anonymous} {...props}>
      {anonymous ? <Icon icon="user" /> : username?.charAt(0)}
    </UserAvatarWrapper>
  );
};

const UserAvatarWrapper = styled(Avatar)<{ shadow?: boolean; anonymous?: boolean }>`
  color: ${AntdColor.GREY.GREY_8};
  background-color: ${({ anonymous }) =>
    anonymous ? AntdColor.GREY.GREY_0 /* originally #BFBFBF */ : CustomColor.AVATAR_BG};
  box-shadow: ${({ shadow }) =>
    shadow ? `0px 4px 4px ${AntdColor.NEUTRAL.TEXT_QUATERNARY}` : "none"};
`;

export default UserAvatar;
