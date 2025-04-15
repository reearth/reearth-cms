import GroupsList from "@reearth-cms/components/molecules/Model/ModelsList/GroupsList";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { Group } from "@reearth-cms/components/molecules/Schema/types";

type Props = {
  title: string;
  collapsed?: boolean;
  selectedKey?: string;
  groups?: Group[];
  open: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  onModalOpen: () => void;
  onGroupKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; key: string }) => Promise<void>;
  onGroupSelect?: (groupId: string) => void;
  onUpdateGroupsOrder: (groupIds: string[]) => Promise<void>;
};

const Groups: React.FC<Props> = ({
  collapsed,
  selectedKey,
  groups,
  open,
  hasCreateRight,
  hasUpdateRight,
  onModalOpen,
  onGroupKeyCheck,
  onClose,
  onCreate,
  onGroupSelect,
  onUpdateGroupsOrder,
}) => {
  return (
    <>
      <GroupsList
        selectedKey={selectedKey}
        groups={groups}
        collapsed={collapsed}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        onGroupSelect={onGroupSelect}
        onModalOpen={onModalOpen}
        onUpdateGroupsOrder={onUpdateGroupsOrder}
      />
      <FormModal
        open={open}
        onClose={onClose}
        onCreate={onCreate}
        onKeyCheck={onGroupKeyCheck}
        isModel={false}
      />
    </>
  );
};

export default Groups;
