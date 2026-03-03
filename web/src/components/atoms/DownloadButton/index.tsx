import styled from "@emotion/styled";
import React, { MouseEventHandler } from "react";

import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

type DownloadButtonProps = {
  disabled?: boolean;
  displayDefaultIcon?: boolean;
  onDownload?: MouseEventHandler<HTMLElement>;
  onlyIcon?: boolean;
  title?: string;
} & ButtonProps;

const DownloadButton: React.FC<DownloadButtonProps> = ({
  disabled,
  displayDefaultIcon,
  onDownload,
  onlyIcon,
  title,
  ...props
}) => {
  const t = useT();
  return onlyIcon ? (
    <IconWrapper onClick={onDownload} role="button">
      <Icon icon="download" />
    </IconWrapper>
  ) : (
    <Button
      disabled={disabled}
      icon={displayDefaultIcon && <Icon icon="download" />}
      onClick={onDownload}
      {...props}>
      {title ?? t("Download")}
    </Button>
  );
};

const IconWrapper = styled.div`
  display: inline-flex;
  cursor: pointer;
  transition: all 0.3s;
  color: #00000073;
  :hover {
    color: #000000e0;
  }
`;

export default DownloadButton;
