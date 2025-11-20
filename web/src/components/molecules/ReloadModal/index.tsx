import { ReactNode, useEffect } from "react";

import { useUploader } from "@reearth-cms/state";

type Props = {
  title: ReactNode;
  children: ReactNode;
  okText: ReactNode;
  cancelText: ReactNode;
  shouldPreventReload?: boolean;
};

const ReloadModal: React.FC<Props> = ({
  title,
  children,
  okText,
  cancelText,
  shouldPreventReload = false,
}) => {
  // const [isOpen, setIsOpen] = useState(false);

  // const navigate = useNavigate();
  // const location = useLocation();

  // const [value, setValue] = useState("");
  //
  // // Block navigating elsewhere when data has been entered into the input
  // const blocker = useBlocker(
  //   ({ currentLocation, nextLocation }) =>
  //     value !== "" && currentLocation.pathname !== nextLocation.pathname,
  // );

  // Prevent reload via keyboard shortcuts (Ctrl+R, Cmd+R, F5)
  // document.addEventListener("keydown", e => {
  //   // F5 or Ctrl+R or Cmd+R
  //   // if (e.key === "F5" || (e.key === "r" && (e.ctrlKey || e.metaKey))) {
  //   //   e.preventDefault();
  //   //   console.log("Reload prevented");
  //   // }
  // });

  // Warn before page unload (affects browser refresh button, close tab, navigation)
  // window.addEventListener("beforeunload", async e => {
  //   console.log("beforeunload", e);
  //   setIsOpen(true);
  //   e.preventDefault();
  //   // e.returnValue = ""; // Chrome requires returnValue to be set
  //   // return true; // Some browsers need a return value
  // });

  // const [hasUnsavedChanges, _setHasUnsavedChanges] = useState(false);
  //
  // // Block navigation in React Router
  // const blocker = useBlocker(hasUnsavedChanges);
  //
  // useEffect(() => {
  //   if (blocker.state === "blocked") {
  //     Modal.confirm({
  //       title: "Unsaved Changes",
  //       content: "Are you sure you want to leave?",
  //       onOk: () => blocker.proceed(),
  //       onCancel: () => blocker.reset(),
  //     });
  //   }
  // }, [blocker]);

  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Handle browser reload/close with native dialog
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

  // For showing Ant Design modal on user actions (like clicking a link)
  // const showLeaveConfirmation = () => {
  //   return new Promise(resolve => {
  //     Modal.confirm({
  //       title: "Unsaved Changes",
  //       content: "You have unsaved changes. Are you sure you want to leave?",
  //       okText: "Leave",
  //       cancelText: "Stay",
  //       onOk: () => resolve(true),
  //       onCancel: () => resolve(false),
  //     });
  //   });
  // };

  // Example: Handle navigation within your app
  // const handleNavigation = async () => {
  //   if (hasUnsavedChanges) {
  //     const confirmed = await showLeaveConfirmation();
  //     if (confirmed) {
  //       // Proceed with navigation
  //       setHasUnsavedChanges(false);
  //       // Your navigation logic here
  //       navigate("/");
  //     }
  //   } else {
  //     // Navigate directly
  //   }
  // };

  return (
    <>
      {/*<Modal*/}
      {/*  centered*/}
      {/*  title={props.title}*/}
      {/*  open={isOpen}*/}
      {/*  okText={props.okText}*/}
      {/*  cancelText={props.cancelText}*/}
      {/*  onClose={_event => {*/}
      {/*    setIsOpen(false);*/}
      {/*  }}*/}
      {/*  onCancel={_event => {*/}
      {/*    setIsOpen(false);*/}
      {/*  }}*/}
      {/*  onOk={_event => {*/}
      {/*    setIsOpen(false);*/}
      {/*  }}>*/}
      {/*  {props.children}*/}
      {/*</Modal>*/}
      {/*<Modal open>*/}
      {/*  <input onChange={() => setHasUnsavedChanges(true)} />*/}
      {/*  <button onClick={handleNavigation}>Navigate Away</button>*/}
      {/*</Modal>*/}
    </>
  );
};

export default ReloadModal;
