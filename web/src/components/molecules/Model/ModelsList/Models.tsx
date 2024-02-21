import ModelsList from "@reearth-cms/components/molecules/Model/ModelsList/ModelsList";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { SelectedSchemaType } from "@reearth-cms/components/molecules/Schema";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";

export interface Props {
  className?: string;
  title: string;
  collapsed?: boolean;
  selectedKey?: string;
  models?: Model[];
  selectedSchemaType?: SelectedSchemaType;
  open?: boolean;
  onModalOpen: () => void;
  onModelKeyCheck: (key: string, ignoredKey?: string | undefined) => Promise<boolean>;
  onClose: () => void;
  onCreate?: (data: ModelFormValues) => Promise<void>;
  onModelSelect: (modelId: string) => void;
  onUpdateModelsOrder: (modelIds: string[]) => void;
}

const Models: React.FC<Props> = ({
  className,
  collapsed,
  selectedKey,
  models,
  selectedSchemaType,
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
      <FormModal
        open={open}
        onKeyCheck={onModelKeyCheck}
        onClose={onClose}
        onCreate={onCreate}
        isModel
      />
    </>
  );
};

export default Models;
