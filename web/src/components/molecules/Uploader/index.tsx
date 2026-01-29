import styled from "@emotion/styled";
import { motion, useAnimationControls, useDragControls, Variants } from "motion/react";
import { ComponentProps, RefObject, useCallback, useMemo, useRef, useState } from "react";

import Badge from "@reearth-cms/components/atoms/Badge";
import Icon from "@reearth-cms/components/atoms/Icon";
import Modal, { ModalFuncProps } from "@reearth-cms/components/atoms/Modal";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";

import useHooks from "./hooks";
import QueueItem from "./QueueItem";

const DRAG_THRESHOLD = 5;
const UPLOADER_PADDING = 20;
const SNAP_DELAY_TIME = 300;

enum Corner {
  TopLeft = "TOP_LEFT",
  TopRight = "TOP_RIGHT",
  BottomLeft = "BOTTOM_LEFT",
  BottomRight = "BOTTOM_RIGHT",
}

type Props = {
  constraintsRef: RefObject<HTMLDivElement>;
};

function checkCorner(x: number, y: number): Corner {
  const { innerWidth, innerHeight } = window;
  const shouldGoTop = y <= innerHeight / 2;
  const shouldGoLeft = x <= innerWidth / 2;

  if (shouldGoTop && shouldGoLeft) {
    return Corner.TopLeft;
  } else if (shouldGoTop && !shouldGoLeft) {
    return Corner.TopRight;
  } else if (!shouldGoTop && shouldGoLeft) {
    return Corner.BottomLeft;
  } else {
    return Corner.BottomRight;
  }
}

const Uploader: React.FC<Props> = props => {
  const t = useT();

  // states for UI
  const [corner, setCorner] = useState<Corner>(Corner.BottomRight);
  const uploaderWrapperRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const dragControls = useDragControls();
  const animationControls = useAnimationControls();

  // states for data
  const {
    uploaderState,
    shouldPreventReload,
    uploadingFileCount,
    handleUploaderOpen,
    handleUploadCancel,
    handleUploadRetry,
    handleCancelAll,
    handleJobProgressUpdate,
  } = useHooks();

  const titleMessage = useMemo(
    () => (uploadingFileCount === 0 ? "" : t("Uploading file...", { count: uploadingFileCount })),
    [t, uploadingFileCount],
  );

  const moveToCorner = useCallback(
    (corner: Corner) => {
      if (!uploaderWrapperRef.current) return;

      const { innerWidth, innerHeight } = window;
      const { offsetWidth, offsetHeight } = uploaderWrapperRef.current;

      const positions: Record<Corner, { x: number; y: number }> = {
        [Corner.TopLeft]: {
          x: -(innerWidth - offsetWidth - UPLOADER_PADDING - offsetWidth / 2),
          y: -(innerHeight - offsetHeight - UPLOADER_PADDING - offsetHeight / 2),
        },
        [Corner.TopRight]: {
          x: 0,
          y: -(innerHeight - offsetHeight - UPLOADER_PADDING - offsetHeight / 2),
        },
        [Corner.BottomLeft]: {
          x: -(innerWidth - offsetWidth - UPLOADER_PADDING - offsetWidth / 2),
          y: 0,
        },
        [Corner.BottomRight]: {
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
    },
    [animationControls],
  );

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

  const _handleCancelAll = useCallback(() => {
    if (shouldPreventReload) {
      Modal.confirm({
        ...cancelModalCommonProps,
        onOk() {
          handleUploaderOpen(false);
          handleCancelAll();
        },
      });
    } else {
      handleUploaderOpen(false);
      handleCancelAll();
    }
  }, [shouldPreventReload, cancelModalCommonProps, handleUploaderOpen, handleCancelAll]);

  return (
    <UploaderWrapper
      data-testid={DATA_TEST_ID.Uploader__Wrapper}
      ref={uploaderWrapperRef}
      drag={!uploaderState.isOpen}
      dragConstraints={props.constraintsRef}
      dragMomentum={false}
      dragControls={dragControls}
      animate={animationControls}
      whileDrag={{ scale: 1.1 }}
      onDragEnd={handleDragEnd}>
      <UploadIcon
        data-testid={DATA_TEST_ID.Uploader__UploadIcon}
        initial="closed"
        variants={uploadIconVariants}
        animate={uploaderState.isOpen ? "open" : "closed"}
        onPointerDown={e => {
          dragStart.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={event => {
          const dx = event.clientX - dragStart.current.x;
          const dy = event.clientY - dragStart.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < DRAG_THRESHOLD) {
            handleUploaderOpen(true);
          }
        }}>
        <Badge
          color="#ffffff"
          size="small"
          style={{ boxShadow: "none" }}
          dot={uploaderState.showBadge}>
          <Icon icon="upload" size={26} color="#ffffff" />
        </Badge>
      </UploadIcon>

      <Card
        data-testid={DATA_TEST_ID.Uploader__Card}
        data-corner={corner}
        layout="size"
        initial="closed"
        variants={cardVariants}
        animate={uploaderState.isOpen ? "open" : "closed"}
        transition={{ duration: 0 }}>
        <CardHead data-testid={DATA_TEST_ID.Uploader__CardHead}>
          <Title data-testid={DATA_TEST_ID.Uploader__CardTitle}>{titleMessage}</Title>
          <TitleSuffix data-testid={DATA_TEST_ID.Uploader__CardTitleSuffix}>
            <Tooltip title={t("Minimize")}>
              <span>
                <CloseIcon icon="down" onClick={() => void handleUploaderOpen(false)} />
              </span>
            </Tooltip>
            <Tooltip title={t("Close")}>
              <span
                data-testid={DATA_TEST_ID.Uploader__CancelAllIcon}
                onClick={() => void _handleCancelAll()}>
                <CancelAllIcon icon="close" />
              </span>
            </Tooltip>
          </TitleSuffix>
        </CardHead>
        <CardBody data-testid={DATA_TEST_ID.Uploader__CardBody}>
          {uploaderState.queue.map((queue, _index) => (
            <QueueItem
              key={queue.jobId}
              queue={queue}
              onRetry={handleUploadRetry}
              onCancel={handleUploadCancel}
              onJobProgressUpdate={handleJobProgressUpdate}
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
  position: absolute;
  z-index: 30;
  background: #ffffff;
  border-radius: 6px;
  box-shadow:
    0 1px 2px -2px rgba(0, 0, 0, 0.16),
    0 3px 6px 0 rgba(0, 0, 0, 0.12),
    0 5px 12px 4px rgba(0, 0, 0, 0.09);
  overflow-y: scroll;

  &[data-corner="${Corner.BottomRight}"] {
    bottom: 0;
    right: 0;
  }

  &[data-corner="${Corner.BottomLeft}"] {
    bottom: 0;
    left: 0;
  }

  &[data-corner="${Corner.TopRight}"] {
    top: 0;
    right: 0;
  }

  &[data-corner="${Corner.TopLeft}"] {
    top: 0;
    left: 0;
  }
`;

const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 10;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  padding: 0 14px 14px 14px;
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
    height: "auto",
    opacity: 1,
  },
  closed: {
    width: 0,
    height: 0,
    opacity: 0,
  },
};

export default Uploader;
