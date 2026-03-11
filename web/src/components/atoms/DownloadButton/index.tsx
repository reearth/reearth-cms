import styled from "@emotion/styled";
import React, { MouseEventHandler } from "react";

import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";
import { AntdColor } from "@reearth-cms/utils/color";

type DownloadButtonProps = {
  title?: string;
  displayDefaultIcon?: boolean;
  disabled?: boolean;
  onlyIcon?: boolean;
  onDownload?: MouseEventHandler<HTMLElement>;
} & ButtonProps;

const DownloadButton: React.FC<DownloadButtonProps> = ({
  title,
  displayDefaultIcon,
  disabled,
  onlyIcon,
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
      disabled={disabled}
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
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  :hover {
    color: #000000e0;
  }
`;

export default DownloadButton;
