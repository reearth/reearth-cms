import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PreviewModal from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewModal";
import { PreviewType } from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewTypeSelect";

type Props = {
  url: string;
  selectedPreviewType: string;
  isModalVisible: boolean;
  handleCodeSourceClick: () => void;
  handleRenderClick: () => void;
  handleFullScreen: () => void;
  handleModalCancel: () => void;
};

const PreviewToolbar: React.FC<Props> = ({
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
          <Button onClick={handleCodeSourceClick}>Source Code</Button>
          <Button onClick={handleRenderClick}>Render</Button>
        </>
      )}
      <Button type="link" icon={<Icon icon="download" />} size="large" onClick={handleFullScreen} />
      <PreviewModal url={url} visible={isModalVisible} handleCancel={handleModalCancel} />
    </>
  );
};

export default PreviewToolbar;
