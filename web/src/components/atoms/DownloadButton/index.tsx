import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { saveAs } from "file-saver";
import React, { MouseEventHandler } from "react";

type DownloadButtonProps = {
  title?: string;
  filename: string;
  url: string;
  displayDefaultIcon?: boolean;
} & ButtonProps;

const DownloadButton: React.FC<DownloadButtonProps> = ({
  title,
  filename,
  url,
  displayDefaultIcon,
  ...props
}) => {
  const handleDownload: MouseEventHandler<HTMLElement> | undefined = () => {
    saveAs(url, filename);
  };

  return (
    <Button
      icon={displayDefaultIcon && <Icon.download />}
      onClick={handleDownload}
      disabled={!url}
      {...props}
    >
      {title ?? "Download"}
    </Button>
  );
};

export default DownloadButton;
