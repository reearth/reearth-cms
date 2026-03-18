import styled from "@emotion/styled";
import { useEffect, useState } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import { Constant } from "@reearth-cms/utils/constant";

import Avatar, { AvatarProps } from "../Avatar";

type Props = {
  username?: string;
  shadow?: boolean;
  profilePictureUrl?: string;
} & AvatarProps;

const UserAvatar: React.FC<Props> = ({ username, shadow, profilePictureUrl, ...props }) => {
  const anonymous = username === "Anonymous";
  const [isValidImage, setIsValidImage] = useState(false);

  useEffect(() => {
    if (!profilePictureUrl) {
      setIsValidImage(false);
      return;
    }

    const img = new Image();
    img.onload = () => setIsValidImage(true);
    img.onerror = () => setIsValidImage(false);
    img.src = profilePictureUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [profilePictureUrl]);

  return isValidImage && profilePictureUrl ? (
    <Avatar src={profilePictureUrl} alt="User avatar" {...props} />
  ) : (
    <UserAvatarWrapper $shadow={shadow} $anonymous={anonymous || undefined} {...props}>
      {anonymous ? <Icon icon="user" /> : username?.charAt(0)}
    </UserAvatarWrapper>
  );
};

const UserAvatarWrapper = styled(Avatar, Constant.TRANSIENT_OPTIONS)<{
  $shadow?: boolean;
  $anonymous?: boolean;
}>`
  color: #000000;
  background-color: ${({ $anonymous }) => ($anonymous ? "#BFBFBF" : "#ECECEC")};
  box-shadow: ${({ $shadow }) => ($shadow ? "0px 4px 4px rgba(0, 0, 0, 0.25)" : "none")};
`;

export default UserAvatar;
