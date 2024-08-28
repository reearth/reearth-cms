import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";
import fileDownload from "js-file-download";
import React, { MouseEventHandler, useCallback } from "react";

type Asset = {
  id: string;
  fileName: string;
  url: string;
};

type DownloadButtonProps = {
  title?: string;
  selected?: Asset[];
  displayDefaultIcon?: boolean;
} & ButtonProps;

const DownloadButton: React.FC<DownloadButtonProps> = ({
  title,
  selected,
  displayDefaultIcon,
  ...props
}) => {
  const t = useT();
  const handleDownload: MouseEventHandler<HTMLElement> | undefined = useCallback(async () => {
    selected?.map(async s => {
      const res = await fetch(s.url, {
        method: "GET",
      });
      const blob = await res.blob();
      fileDownload(blob, s.fileName);
    });
  }, [selected]);

  return (
    <Button
      icon={displayDefaultIcon && <Icon icon="download" />}
      onClick={handleDownload}
      disabled={!selected || selected.length <= 0}
      {...props}>
      {title ?? t("Download")}
    </Button>
  );
};

export default DownloadButton;
