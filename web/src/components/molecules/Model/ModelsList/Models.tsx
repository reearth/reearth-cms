import ModelsList from "@reearth-cms/components/molecules/Model/ModelsList/ModelsList";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";
import ModelFormModal from "@reearth-cms/components/molecules/Schema/ModelFormModal";

export interface Props {
  className?: string;
  title: string;
  collapsed?: boolean;
  selectedKey?: string;
  models?: any;
  selectedSchemaType?: SelectedSchemaType;
  isKeyAvailable: boolean;
  open?: boolean;
  onModalOpen: () => void;
  onModelKeyCheck: (key: string, ignoredKey?: string | undefined) => Promise<boolean>;
  onClose: () => void;
  onCreate?: (data: { name: string; description: string; key: string }) => Promise<void>;
  onModelSelect: (modelId: string) => void;
}

const Models: React.FC<Props> = ({
  className,
  collapsed,
  selectedKey,
  models,
  selectedSchemaType,
  isKeyAvailable,
  open,
  onModalOpen,
  onModelKeyCheck,
  onClose,
  onCreate,
  onModelSelect,
}) => {
  return (
    <>
      <ModelsList
        className={className}
        selectedKey={selectedKey}
        models={models}
        selectedSchemaType={selectedSchemaType}
        collapsed={collapsed}
        onModelSelect={onModelSelect}
        onModalOpen={onModalOpen}
      />
      <ModelFormModal
        isKeyAvailable={isKeyAvailable}
        open={open}
        onModelKeyCheck={onModelKeyCheck}
        onClose={onClose}
        onCreate={onCreate}
      />
    </>
  );
};

export default Models;
