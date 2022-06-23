import { FullscreenOutlined } from "@ant-design/icons";
import Button from "@reearth-cms/components/atoms/Button";
import { AssetType } from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/asset-type-select";
import PreviewModal from "@reearth-cms/components/molecules/AssetList/Asset/AssetBody/PreviewModal";

type PreviewToolbar = {
  url?: string;
  selectedContentType: string;
  isModalVisible: boolean;
  handleCodeSourceClick: () => void;
  handleRenderClick: () => void;
  handleFullScreen: () => void;
  handleModalCancel: () => void;
};

const PreviewToolbar: React.FC<PreviewToolbar> = ({
  selectedContentType,
  handleCodeSourceClick,
  handleRenderClick,
  handleFullScreen,
  isModalVisible,
  handleModalCancel,
}) => {
  return (
    <>
      {selectedContentType === AssetType.SVG && (
        <>
          <Button onClick={handleCodeSourceClick}>Code Source</Button>
          <Button onClick={handleRenderClick}>Render</Button>
        </>
      )}
      <Button
        type="link"
        icon={<FullscreenOutlined />}
        size="large"
        onClick={handleFullScreen}
      ></Button>
      <PreviewModal
        // TODO: this is a hardcoded url and should be replaced with asset.url
        url="https://via.placeholder.com/640x480.png?text=No+Image"
        visible={isModalVisible}
        handleCancel={handleModalCancel}
      />
    </>
  );
};

export default PreviewToolbar;
