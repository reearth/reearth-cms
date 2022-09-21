import fileDownload from "js-file-download";
import React, { MouseEventHandler, useCallback } from "react";

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
  const handleDownload: MouseEventHandler<HTMLElement> | undefined = useCallback(async () => {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
    const blob = await res.blob();
    fileDownload(blob, filename);
  }, [filename, url]);

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
