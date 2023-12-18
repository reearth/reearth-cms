import ModelsList from "@reearth-cms/components/molecules/Model/ModelsList/ModelsList";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";
import ModelFormModal from "@reearth-cms/components/molecules/Schema/ModelFormModal";
import { Model } from "@reearth-cms/components/molecules/Schema/types";

export interface Props {
  className?: string;
  title: string;
  collapsed?: boolean;
  selectedKey?: string;
  models?: Model[];
  selectedSchemaType?: SelectedSchemaType;
  isKeyAvailable: boolean;
  open?: boolean;
  onModalOpen: () => void;
  onModelKeyCheck: (key: string, ignoredKey?: string | undefined) => Promise<boolean>;
  onClose: () => void;
  onCreate?: (data: { name: string; description: string; key: string }) => Promise<void>;
  onModelSelect: (modelId: string) => void;
  onUpdateModelsOrder: (modelIds: string[]) => void;
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
  onUpdateModelsOrder,
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
        onUpdateModelsOrder={onUpdateModelsOrder}
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
