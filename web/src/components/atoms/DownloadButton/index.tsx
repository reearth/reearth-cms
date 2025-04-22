import styled from "@emotion/styled";
import React, { MouseEventHandler } from "react";

import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

type DownloadButtonProps = {
  title?: string;
  displayDefaultIcon?: boolean;
  onlyIcon?: boolean;
  disabled?: boolean;
  onDownload?: MouseEventHandler<HTMLElement>;
} & ButtonProps;

const DownloadButton: React.FC<DownloadButtonProps> = ({
  title,
  displayDefaultIcon,
  onlyIcon,
  disabled,
  onDownload,
  ...props
}) => {
  const t = useT();
  return onlyIcon ? (
    <IconWrapper role="button" onClick={onDownload}>
      <Icon icon="download" />
    </IconWrapper>
  ) : (
    <Button
      icon={displayDefaultIcon && <Icon icon="download" />}
      onClick={onDownload}
      disabled={disabled}
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
