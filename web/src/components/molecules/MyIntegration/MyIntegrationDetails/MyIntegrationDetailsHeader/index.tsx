import { useNavigate } from "react-router-dom";

import PageHeader from "@reearth-cms/components/atoms/PageHeader";

export interface Props {
  title?: string;
  workspaceId?: string;
}

const MyIntegrationDetailsHeader: React.FC<Props> = ({ title, workspaceId }) => {
  const navigate = useNavigate();

  return (
    <PageHeader
      onBack={() => navigate(`/workspaces/${workspaceId}/my-integration`)}
      title={title}
    />
  );
};

export default MyIntegrationDetailsHeader;
