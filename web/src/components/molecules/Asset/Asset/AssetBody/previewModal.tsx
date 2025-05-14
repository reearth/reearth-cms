import styled from "@emotion/styled";

import Modal from "@reearth-cms/components/atoms/Modal";

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
      width="90vw"
      styles={{
        body: { height: "90vh" },
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
