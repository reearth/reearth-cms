import { useEffect } from "react";

type Props = {
  shouldPreventReload?: boolean;
};

const ReloadModal: React.FC<Props> = ({ shouldPreventReload = false }) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldPreventReload) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [shouldPreventReload]);

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <></>;
};

export default ReloadModal;
