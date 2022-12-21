import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PreviewModal from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewModal";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";
import { useT } from "@reearth-cms/i18n";

type Props = {
  url: string;
  selectedPreviewType: PreviewType;
  isModalVisible: boolean;
  isSVG?: boolean;
  handleCodeSourceClick: () => void;
  handleRenderClick: () => void;
  handleFullScreen: () => void;
  handleModalCancel: () => void;
};

const PreviewToolbar: React.FC<Props> = ({
  url,
  selectedPreviewType,
  isModalVisible,
  isSVG,
  handleCodeSourceClick,
  handleRenderClick,
  handleFullScreen,
  handleModalCancel,
}) => {
  const t = useT();
  const isSVGButtonVisible = selectedPreviewType === "IMAGE" && isSVG;
  const isFullScreenButtonVisible = selectedPreviewType !== "UNKNOWN";

  return (
    <>
      {isSVGButtonVisible && (
        <>
          <Button onClick={handleCodeSourceClick}>{t("Source Code")}</Button>
          <Button onClick={handleRenderClick}>{t("Render")}</Button>
        </>
      )}
      {isFullScreenButtonVisible && (
        <Button
          type="link"
          icon={<Icon icon="fullscreen" />}
          size="large"
          onClick={handleFullScreen}
        />
      )}
      <PreviewModal url={url} visible={isModalVisible} handleCancel={handleModalCancel} />
    </>
  );
};

export default PreviewToolbar;
