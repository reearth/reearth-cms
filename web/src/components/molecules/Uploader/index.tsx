import styled from "@emotion/styled";
import { motion, useAnimationControls, useDragControls, Variants } from "motion/react";
import { ComponentProps, RefObject, useCallback, useMemo, useRef, useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal, { ModalFuncProps } from "@reearth-cms/components/atoms/Modal";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import {
  UploaderQueueItem,
  UploaderState,
  UploadStatus,
} from "@reearth-cms/components/molecules/Uploader/types";
import { useT } from "@reearth-cms/i18n";

import QueueItem from "./QueueItem";

const DRAG_THRESHOLD = 5;
const UPLOADER_PADDING = 20;
const SNAP_DELAY_TIME = 300;

type Corner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

type Props = {
  uploaderState: UploaderState;
  constraintsRef: RefObject<HTMLDivElement>;
  onUploaderOpen: (isOpen: boolean) => void;
  onRetry: (id: UploaderQueueItem["id"]) => void;
  onCancel: (id: UploaderQueueItem["id"]) => void;
  onCancelAll: () => void;
};

const Uploader: React.FC<Props> = props => {
  const t = useT();
  const [corner, setCorner] = useState<Corner>("bottomRight");
  const uploaderWrapperRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragControls = useDragControls();
  const animationControls = useAnimationControls();

  const uploadingFileCount = useMemo<number>(
    () => props.uploaderState.queue.filter(item => item.status === UploadStatus.InProgress).length,
    [props.uploaderState.queue],
  );

  const titleMessage = useMemo(
    () => t("Uploading file...", { count: uploadingFileCount }),
    [t, uploadingFileCount],
  );

  const moveToCorner = (corner: Corner) => {
    if (!uploaderWrapperRef.current) return;

    const { innerWidth, innerHeight } = window;
    const { offsetWidth, offsetHeight } = uploaderWrapperRef.current;

    const positions: Record<Corner, { x: number; y: number }> = {
      topLeft: {
        x: -(innerWidth - offsetWidth - UPLOADER_PADDING - offsetWidth / 2),
        y: -(innerHeight - offsetHeight - UPLOADER_PADDING - offsetHeight / 2),
      },
      topRight: {
        x: 0,
        y: -(innerHeight - offsetHeight - UPLOADER_PADDING - offsetHeight / 2),
      },
      bottomLeft: {
        x: -(innerWidth - offsetWidth - UPLOADER_PADDING - offsetWidth / 2),
        y: 0,
      },
      bottomRight: {
        x: 0,
        y: 0,
      },
    };

    animationControls.start({
      x: positions[corner].x,
      y: positions[corner].y,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 20,
        duration: 0.5,
      },
    });
  };

  const checkCorner = (x: number, y: number): Corner => {
    const { innerWidth, innerHeight } = window;
    const shouldGoTop = y <= innerHeight / 2;
    const shouldGoLeft = x <= innerWidth / 2;

    if (shouldGoTop && shouldGoLeft) {
      return "topLeft";
    } else if (shouldGoTop && !shouldGoLeft) {
      return "topRight";
    } else if (!shouldGoTop && shouldGoLeft) {
      return "bottomLeft";
    } else {
      return "bottomRight";
    }
  };

  const handleDragEnd: ComponentProps<typeof UploaderWrapper>["onDragEnd"] = event => {
    if (event instanceof PointerEvent || event instanceof MouseEvent) {
      const _corner = checkCorner(event.x, event.y);
      setCorner(_corner);

      setTimeout(() => {
        moveToCorner(_corner);
      }, SNAP_DELAY_TIME);
    }
  };

  const cancelModalCommonProps = useMemo<ModalFuncProps>(
    () => ({
      title: t("Cancel upload?"),
      content: t(
        "Your file hasn't finished uploading yet. Are you sure you want to cancel upload?",
      ),
      cancelText: t("Keep uploading"),
      okText: t("Cancel upload"),
      okButtonProps: { variant: "solid", color: "danger" },
      maskClosable: false,
    }),
    [t],
  );

  const handleCancelAll = useCallback(() => {
    Modal.confirm({
      ...cancelModalCommonProps,
      onOk() {
        props.onUploaderOpen(false);
        props.onCancelAll();
      },
    });
  }, [props, cancelModalCommonProps]);

  return (
    <UploaderWrapper
      data-testId="UploaderWrapper"
      ref={uploaderWrapperRef}
      drag={!props.uploaderState.isOpen}
      dragConstraints={props.constraintsRef}
      dragMomentum={false}
      dragControls={dragControls}
      animate={animationControls}
      whileDrag={{ scale: 1.1 }}
      onDragEnd={handleDragEnd}>
      <UploadIcon
        data-testId="UploadIcon"
        initial="closed"
        variants={uploadIconVariants}
        animate={props.uploaderState.isOpen ? "open" : "closed"}
        onPointerDown={e => {
          dragStart.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={event => {
          const dx = event.clientX - dragStart.current.x;
          const dy = event.clientY - dragStart.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < DRAG_THRESHOLD) {
            props.onUploaderOpen(true);
          }
        }}>
        <Badge
          color="#ffffff"
          size="small"
          style={{ boxShadow: "none" }}
          dot={props.uploaderState.showBadge}>
          <Icon icon="upload" size={26} color="#ffffff" />
        </Badge>
      </UploadIcon>
      <Card
        data-testId="Card"
        data-corner={corner}
        initial="closed"
        variants={cardVariants}
        animate={props.uploaderState.isOpen ? "open" : "closed"}>
        <CardHead data-testId="CardHead">
          <Title data-testId="Title">{titleMessage}</Title>
          <TitleSuffix data-testId="TitleSuffix">
            <Tooltip title={t("Minimize")}>
              <span>
                <CloseIcon icon="down" onClick={() => void props.onUploaderOpen(false)} />
              </span>
            </Tooltip>
            <Tooltip title={t("Close")}>
              <span>
                <CancelAllIcon icon="close" onClick={() => void handleCancelAll()} />
              </span>
            </Tooltip>
          </TitleSuffix>
        </CardHead>
        <CardBody
          data-testId="CardBody"
          initial="closed"
          variants={cardBodyVariants}
          animate={props.uploaderState.isOpen ? "open" : "closed"}>
          {props.uploaderState.queue.map((queue, _index) => (
            <QueueItem
              key={queue.id}
              queue={queue}
              onRetry={props.onRetry}
              onCancel={props.onCancel}
            />
          ))}
        </CardBody>
      </Card>
    </UploaderWrapper>
  );
};

const UploaderWrapper = styled(motion.div)`
  position: fixed;
  bottom: ${UPLOADER_PADDING}px;
  right: ${UPLOADER_PADDING}px;
  z-index: 20;
`;

const Card = styled(motion.div)`
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  /* height: 100px; */
  /* width: 100px; */
  position: absolute;
  z-index: 30;
  background: #ffffff;
  border-radius: 6px;
  box-shadow:
    0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12),
    0 5px 12px 4px rgba(0, 0, 0, 0.09);
  overflow: hidden;

  &[data-corner="bottomRight"] {
    bottom: 0;
    right: 0;
  }

  &[data-corner="bottomLeft"] {
    bottom: 0;
    left: 0;
  }

  &[data-corner="topRight"] {
    top: 0;
    right: 0;
  }

  &[data-corner="topLeft"] {
    top: 0;
    left: 0;
  }
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
`;

const CardBody = styled(motion.div)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: scroll;
`;

const Title = styled.div`
  overflow: hidden;
`;

const TitleSuffix = styled.div`
  display: flex;
  color: #8c8c8c;
  gap: 8px;
`;

const CloseIcon = styled(Icon)`
  transition-property: color;
  transition-duration: 0.5s;
  cursor: pointer;

  :hover {
    color: #1677ff;
  }
`;

const CancelAllIcon = styled(Icon)`
  transition-property: color;
  transition-duration: 0.5s;
  cursor: pointer;

  :hover {
    color: #f5222d;
  }
`;

const UploadIcon = styled(motion.div)`
  width: 45px;
  height: 45px;
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  background-color: #1677ff;
  cursor: pointer;
  transition-property: background-color;
  transition-duration: 0.5s;
  border-radius: 6px;
  box-shadow:
    0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12),
    0 5px 12px 4px rgba(0, 0, 0, 0.09);

  &:hover {
    background-color: #4096ff;
  }
`;

const uploadIconVariants: Variants = {
  open: {
    opacity: 0,
  },
  closed: {
    opacity: 100,
  },
};

const cardVariants: Variants = {
  open: {
    width: "300px",
    height: "300px",
  },
  closed: {
    width: 0,
    height: 0,
  },
};

const cardBodyVariants: Variants = {
  open: {
    width: 300,
    height: "auto",
    opacity: 100,
    padding: "0 14px 14px 14px",
  },
  closed: {
    width: 0,
    height: 0,
    opacity: 0,
    padding: 0,
  },
};

export default Uploader;
