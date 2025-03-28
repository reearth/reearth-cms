import { useState, useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import { UploadFile } from "@reearth-cms/components/atoms/Upload";
import { Asset } from "@reearth-cms/components/molecules/Asset/types";
import { useT } from "@reearth-cms/i18n";

import UploadModal from "../UploadModal";

type Props = {
  hasCreateRight: boolean;
  onAssetsCreate: (files: UploadFile[]) => Promise<(Asset | undefined)[]>;
  onAssetCreateFromUrl: (url: string, autoUnzip: boolean) => Promise<Asset | undefined>;
  onLink?: (assetId: string) => void;
};

const UploadAsset: React.FC<Props> = ({
  hasCreateRight,
  onAssetsCreate,
  onAssetCreateFromUrl,
  onLink,
}) => {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const modalOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const modalClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <Button
        type="primary"
        icon={<Icon icon="upload" />}
        onClick={modalOpen}
        disabled={!hasCreateRight}>
        {t("Upload Asset")}
      </Button>
      <UploadModal
        isOpen={isOpen}
        onAssetsCreate={onAssetsCreate}
        onAssetCreateFromUrl={onAssetCreateFromUrl}
        modalClose={modalClose}
        onLink={onLink}
      />
    </>
  );
};

export default UploadAsset;
