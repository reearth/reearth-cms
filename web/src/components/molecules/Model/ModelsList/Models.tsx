import ModelsList from "@reearth-cms/components/molecules/Model/ModelsList/ModelsList";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";

type Props = {
  title: string;
  collapsed: boolean;
  selectedKey?: string;
  models?: Model[];
  open: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  onModalOpen: () => void;
  onModelKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  onClose: () => void;
  onCreate: (data: ModelFormValues) => Promise<void>;
  onModelSelect: (modelId: string) => void;
  onUpdateModelsOrder: (modelIds: string[]) => Promise<void>;
};

const Models: React.FC<Props> = ({
  collapsed,
  selectedKey,
  models,
  open,
  hasCreateRight,
  hasUpdateRight,
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
        selectedKey={selectedKey}
        models={models}
        collapsed={collapsed}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
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
