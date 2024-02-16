import GroupsList from "@reearth-cms/components/molecules/Model/ModelsList/GroupsList";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { Group } from "@reearth-cms/components/molecules/Schema/types";

export type Props = {
  className?: string;
  title: string;
  collapsed?: boolean;
  selectedKey?: string;
  groups?: Group[];
  selectedSchemaType?: SelectedSchemaType;
  open: boolean;
  onModalOpen: () => void;
  onGroupKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  onClose: () => void;
  onCreate: (data: { name: string; description: string; key: string }) => Promise<void>;
  onGroupSelect?: (groupId: string) => void;
};

const Groups: React.FC<Props> = ({
  className,
  collapsed,
  selectedKey,
  groups,
  selectedSchemaType,
  open,
  onModalOpen,
  onGroupKeyCheck,
  onClose,
  onCreate,
  onGroupSelect,
}) => {
  return (
    <>
      <GroupsList
        className={className}
        selectedKey={selectedKey}
        groups={groups}
        selectedSchemaType={selectedSchemaType}
        collapsed={collapsed}
        onGroupSelect={onGroupSelect}
        onModalOpen={onModalOpen}
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
