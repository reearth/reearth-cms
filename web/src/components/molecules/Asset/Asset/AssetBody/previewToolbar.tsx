import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PreviewModal from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewModal";
import { ViewerType } from "@reearth-cms/components/molecules/Asset/types";
import { useT } from "@reearth-cms/i18n";

type Props = {
  isModalVisible: boolean;
  onCodeSourceClick: () => void;
  onFullScreen: () => void;
  onModalCancel: () => void;
  onRenderClick: () => void;
  url: string;
  viewerType?: ViewerType;
};

const PreviewToolbar: React.FC<Props> = ({
  isModalVisible,
  onCodeSourceClick,
  onFullScreen,
  onModalCancel,
  onRenderClick,
  url,
  viewerType,
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
        <Button icon={<Icon icon="fullscreen" />} onClick={onFullScreen} type="link" />
      )}
      <PreviewModal onCancel={onModalCancel} url={url} visible={isModalVisible} />
    </>
  );
};

export default PreviewToolbar;
