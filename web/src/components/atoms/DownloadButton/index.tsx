import { DownloadOutlined } from "@ant-design/icons";
import Button from "@reearth-cms/components/atoms/Button";
import { ButtonProps } from "antd/lib/button/button";
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
      icon={displayDefaultIcon && <DownloadOutlined />}
      onClick={handleDownload}
      disabled={!url}
      {...props}
    >
      {title ?? "Download"}
    </Button>
  );
};

export default DownloadButton;
