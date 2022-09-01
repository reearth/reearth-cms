import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import PreviewModal from "@reearth-cms/components/molecules/Asset/Asset/AssetBody/previewModal";
import { PreviewType } from "@reearth-cms/gql/graphql-client-api";

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
  return (
    <>
      {selectedPreviewType === PreviewType.Image && isSVG && (
        <>
          <Button onClick={handleCodeSourceClick}>Source Code</Button>
          <Button onClick={handleRenderClick}>Render</Button>
        </>
      )}
      <Button
        type="link"
        icon={<Icon icon="fullscreen" />}
        size="large"
        onClick={handleFullScreen}
      />
      <PreviewModal url={url} visible={isModalVisible} handleCancel={handleModalCancel} />
    </>
  );
};

export default PreviewToolbar;
