import styled from "@emotion/styled";

import Modal from "@reearth-cms/components/atoms/Modal";
import { CustomToken } from "@reearth-cms/utils/style";

type Props = {
  url: string;
  visible: boolean;
  onCancel: () => void;
};

const PreviewModal: React.FC<Props> = ({ url, visible, onCancel }) => {
  return (
    <Modal
      centered
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={CustomToken.MODAL.WIDTH_XL}
      styles={{
        body: { height: CustomToken.MODAL.HEIGHT_XL },
      }}>
      <PreviewImage src={url} alt="asset-preview" />
    </Modal>
  );
};

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export default PreviewModal;
