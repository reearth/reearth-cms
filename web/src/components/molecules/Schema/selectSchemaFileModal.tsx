import styled from "@emotion/styled";

import Button from "@reearth-cms/components/atoms/Button";
import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

type Props = {
  visible: boolean;
  onSelectSchemaFileModalClose: () => void;
};

const SelectSchemaFileModal: React.FC<Props> = ({ visible, onSelectSchemaFileModalClose }) => {
  const t = useT();

  return (
    <StyledModal
      title={t("Select file")}
      centered
      open={visible}
      onCancel={onSelectSchemaFileModalClose}
      width="70vw"
      footer={<Button>Next</Button>}
      styles={{
        body: {
          height: "70vh",
        },
      }}>
      <p>select file content here</p>
    </StyledModal>
  );
};

export default SelectSchemaFileModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
