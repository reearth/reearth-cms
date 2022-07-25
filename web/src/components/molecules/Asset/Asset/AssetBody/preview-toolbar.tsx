import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PreviewModal from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/preview-modal";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/preview-type-select";

type PreviewToolbar = {
  url: string;
  selectedPreviewType: string;
  isModalVisible: boolean;
  handleCodeSourceClick: () => void;
  handleRenderClick: () => void;
  handleFullScreen: () => void;
  handleModalCancel: () => void;
};

const PreviewToolbar: React.FC<PreviewToolbar> = ({
  url,
  selectedPreviewType,
  handleCodeSourceClick,
  handleRenderClick,
  handleFullScreen,
  isModalVisible,
  handleModalCancel,
}) => {
  return (
    <>
      {selectedPreviewType === PreviewType.SVG && (
        <>
          <Button onClick={handleCodeSourceClick}>Code Source</Button>
          <Button onClick={handleRenderClick}>Render</Button>
        </>
      )}
      <Button
        type="link"
        icon={<Icon.fullscreen />}
        size="large"
        onClick={handleFullScreen}
      ></Button>
      <PreviewModal
        url={url}
        visible={isModalVisible}
        handleCancel={handleModalCancel}
      />
    </>
  );
};

export default PreviewToolbar;
