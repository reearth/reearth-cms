import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PreviewModal from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewModal";
import { ViewerType } from "@reearth-cms/components/molecules/Asset/types";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

type Props = {
  url: string;
  isModalVisible: boolean;
  viewerType?: ViewerType;
  onCodeSourceClick: () => void;
  onRenderClick: () => void;
  onFullScreen: () => void;
  onModalCancel: () => void;
};

const PreviewToolbar: React.FC<Props> = ({
  url,
  isModalVisible,
  viewerType,
  onCodeSourceClick,
  onRenderClick,
  onFullScreen,
  onModalCancel,
}) => {
  const t = useT();
  const isSVGButtonVisible = viewerType === "image_svg";
  const isFullScreenButtonVisible = viewerType !== "unknown";

  return (
    <>
      {isSVGButtonVisible && (
        <>
          <Button onClick={onCodeSourceClick}>{t("Source Code")}</Button>
          <Button onClick={onRenderClick}>{t("Render")}</Button>
        </>
      )}
      {isFullScreenButtonVisible && (
        <Button data-testid={DATA_TEST_ID.AssetDetail__FullscreenButton} type="link" icon={<Icon icon="fullscreen" />} onClick={onFullScreen} />
      )}
      <PreviewModal url={url} visible={isModalVisible} onCancel={onModalCancel} />
    </>
  );
};

export default PreviewToolbar;
