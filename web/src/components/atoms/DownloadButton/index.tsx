import styled from "@emotion/styled";
import fileDownload from "js-file-download";
import React, { MouseEventHandler, useCallback } from "react";

import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { useT } from "@reearth-cms/i18n";

type Asset = {
  id: string;
  fileName: string;
  url: string;
};

type DownloadButtonProps = {
  title?: string;
  selected?: Asset[];
  displayDefaultIcon?: boolean;
  onlyIcon?: boolean;
} & ButtonProps;

const DownloadButton: React.FC<DownloadButtonProps> = ({
  title,
  selected,
  displayDefaultIcon,
  onlyIcon,
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

  return onlyIcon ? (
    <IconWrapper role="button" onClick={handleDownload}>
      <Icon icon="download" />
    </IconWrapper>
  ) : (
    <Button
      icon={displayDefaultIcon && <Icon icon="download" />}
      onClick={handleDownload}
      disabled={!selected || selected.length <= 0}
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
