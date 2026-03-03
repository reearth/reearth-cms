import ModelsList from "@reearth-cms/components/molecules/Model/ModelsList/ModelsList";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import FormModal from "@reearth-cms/components/molecules/Schema/FormModal";
import { ModelFormValues } from "@reearth-cms/components/molecules/Schema/types";

type Props = {
  collapsed: boolean;
  hasCreateRight: boolean;
  hasUpdateRight: boolean;
  models?: Model[];
  onClose: () => void;
  onCreate: (data: ModelFormValues) => Promise<void>;
  onModalOpen: () => void;
  onModelKeyCheck: (key: string, ignoredKey?: string) => Promise<boolean>;
  onModelSelect: (modelId: string) => void;
  onUpdateModelsOrder: (modelIds: string[]) => Promise<void>;
  open: boolean;
  selectedKey?: string;
  title: string;
};

const Models: React.FC<Props> = ({
  collapsed,
  hasCreateRight,
  hasUpdateRight,
  models,
  onClose,
  onCreate,
  onModalOpen,
  onModelKeyCheck,
  onModelSelect,
  onUpdateModelsOrder,
  open,
  selectedKey,
}) => {
  return (
    <>
      <ModelsList
        collapsed={collapsed}
        hasCreateRight={hasCreateRight}
        hasUpdateRight={hasUpdateRight}
        models={models}
        onModalOpen={onModalOpen}
        onModelSelect={onModelSelect}
        onUpdateModelsOrder={onUpdateModelsOrder}
        selectedKey={selectedKey}
      />
      <FormModal
        isModel
        onClose={onClose}
        onCreate={onCreate}
        onKeyCheck={onModelKeyCheck}
        open={open}
      />
    </>
  );
};

export default Models;
