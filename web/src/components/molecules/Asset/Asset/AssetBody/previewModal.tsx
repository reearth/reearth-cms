import styled from "@emotion/styled";

import Modal from "@reearth-cms/components/atoms/Modal";

type Props = {
  onCancel: () => void;
  url: string;
  visible: boolean;
};

const PreviewModal: React.FC<Props> = ({ onCancel, url, visible }) => {
  return (
    <Modal
      centered
      footer={null}
      onCancel={onCancel}
      open={visible}
      styles={{
        body: { height: "90vh" },
      }}
      width="90vw">
      <PreviewImage alt="asset-preview" src={url} />
    </Modal>
  );
};

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

export default PreviewModal;
