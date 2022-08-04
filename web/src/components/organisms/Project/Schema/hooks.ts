import { useCallback, useState } from "react";

type Params = {
  projectId?: string;
};

export default ({ projectId }: Params) => {
  const [modelModalShown, setModelModalShown] = useState(false);

  const handleModelModalClose = useCallback(() => {
    setModelModalShown(false);
  }, []);

  const handleModelModalOpen = useCallback(() => setModelModalShown(true), []);

  return {
    modelModalShown,
    handleModelModalOpen,
    handleModelModalClose,
  };
};
