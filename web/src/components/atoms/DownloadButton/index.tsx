import React, { MouseEventHandler } from "react";

import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";

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
    fetch(url, {
      method: "GET",
    })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);

        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      });
  };

  return (
    <Button
      icon={displayDefaultIcon && <Icon icon="download" />}
      onClick={handleDownload}
      disabled={!url}
      {...props}>
      {title ?? "Download"}
    </Button>
  );
};

export default DownloadButton;
