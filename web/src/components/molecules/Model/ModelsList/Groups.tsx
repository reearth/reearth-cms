import GroupsList from "@reearth-cms/components/molecules/Model/ModelsList/GroupsList";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { Group } from "@reearth-cms/components/molecules/Schema/types";

type Props = {
  collapsed?: boolean;
  groups?: Group[];
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  onClose: () => void;
  onCreate: (data: { description: string; key: string; name: string }) => Promise<void>;
  onGroupKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  onGroupSelect?: (groupId: string) => void;
  onModalOpen: () => void;
  onUpdateGroupsOrder: (groupIds: string[]) => Promise<void>;
  open: boolean;
  selectedKey?: string;
  title: string;
};

const Groups: React.FC<Props> = ({
  collapsed,
  groups,
  hasCreateRight,
  hasUpdateRight,
  onClose,
  onCreate,
  onGroupKeyCheck,
  onGroupSelect,
  onModalOpen,
  onUpdateGroupsOrder,
  open,
  selectedKey,
}) => {
  return (
    <>
      <GroupsList
        collapsed={collapsed}
        groups={groups}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        onGroupSelect={onGroupSelect}
        onModalOpen={onModalOpen}
        onUpdateGroupsOrder={onUpdateGroupsOrder}
        selectedKey={selectedKey}
      />
      <FormModal
        isModel={false}
        onClose={onClose}
        onCreate={onCreate}
        onKeyCheck={onGroupKeyCheck}
        open={open}
      />
    </>
  );
};

export default Groups;
