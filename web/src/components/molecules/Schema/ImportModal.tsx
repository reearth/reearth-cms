import styled from "@emotion/styled";

import Modal from "@reearth-cms/components/atoms/Modal";
import { useT } from "@reearth-cms/i18n";

type Props = {
  visible: boolean;
};

const ImportModal: React.FC<Props> = ({
  visible,
}) => {
  const t = useT();

  return (
    <StyledModal
      title={t("Import Schema")}
      centered
      open={visible}
      width="70vw"
      styles={{
        body: {
          height: "70vh",
        },
      }} />
  );
};

export default ImportModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;
