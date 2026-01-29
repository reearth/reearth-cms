import { ApolloClient } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { createContext, ReactNode, useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { RcFile } from "@reearth-cms/components/atoms/Upload";
import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { ImportItemsAsyncDocument } from "@reearth-cms/gql/__generated__/item.generated";
import { CancelJobDocument, CancelJobMutation } from "@reearth-cms/gql/__generated__/job.generated";
import { useUploader } from "@reearth-cms/state";

import { UploaderQueueItem, UploaderState } from "./types";

import MutateResult = ApolloClient.MutateResult;

export type UploaderHookState = {
  isShowUploader: boolean;
  uploaderState: UploaderState;
  shouldPreventReload: boolean;
  uploadingFileCount: number;
  handleUploaderOpen: (isOpen: boolean) => void;
  handleUploadCancel: (id: UploaderQueueItem["jobId"]) => Promise<void>;
  handleUploadRetry: (id: UploaderQueueItem["jobId"]) => Promise<void>;
  handleCancelAll: () => Promise<void>;
  handleEnqueueJob: (payload: {
    workspaceId: string;
    projectId: string;
    modelId: string;
    fileName: string;
    extension: "csv" | "json" | "geojson";
    url: string;
    file: RcFile;
  }) => Promise<void>;
  handleJobProgressUpdate: (payload: Pick<UploaderQueueItem, "jobId" | "jobProgress">) => void;
};

const FULL_PERCENTAGE = 100;
const EMPTY_PERCENTAGE = 0;

function getJobStatus(
  jobProgress: UploaderQueueItem["jobProgress"],
): UploaderQueueItem["jobStatus"] | null {
  if (!jobProgress) return null;

  if (jobProgress.percentage > EMPTY_PERCENTAGE && jobProgress.percentage < FULL_PERCENTAGE) {
    return JobStatus.InProgress;
  } else if (jobProgress.percentage === FULL_PERCENTAGE) {
    return JobStatus.Completed;
  } else {
    return null;
  }
}

export const UploaderHookStateContext = createContext<UploaderHookState | undefined>(undefined);

export const UploaderProvider = ({ children }: { children: ReactNode }) => {
  const [uploaderState, setUploaderState] = useUploader();

  const [importItemsAsyncMutation] = useMutation(ImportItemsAsyncDocument);

  const [cancelJobMutation] = useMutation(CancelJobDocument);

  const handleEnqueueJob = useCallback<UploaderHookState["handleEnqueueJob"]>(
    async ({ workspaceId, projectId, modelId, fileName, extension, url, file }) => {
      const importItemsRes = await importItemsAsyncMutation({
        variables: {
          input: { file, modelId },
        },
      });

      // TODO: check error
      if (
        importItemsRes.error ||
        !importItemsRes.data ||
        !importItemsRes?.data?.importItemsAsync?.job
      ) {
        if (importItemsRes.error) Notification.error({ message: importItemsRes.error.message });
        return;
      }

      const {
        id: jobId,
        type: jobType,
        status: jobStatus,
        progress,
      } = importItemsRes.data.importItemsAsync.job;
      const { percentage, processed, total } = progress;

      setUploaderState(prev => {
        const newQueueItem: UploaderQueueItem = {
          workspaceId,
          projectId,
          modelId,
          jobId,
          fileName,
          extension,
          url,
          file,
          jobProgress: { percentage, total, processed },
          jobType,
          jobStatus,
        };

        return {
          ...prev,
          isOpen: true,
          showBadge: true,
          queue: [newQueueItem, ...prev.queue],
          currentJobId: jobId,
        };
      });
    },
    [importItemsAsyncMutation, setUploaderState],
  );

  const isShowUploader = useMemo<UploaderHookState["isShowUploader"]>(
    () => uploaderState.queue.length > 0,
    [uploaderState.queue.length],
  );

  const handleUploaderOpen = useCallback<UploaderHookState["handleUploaderOpen"]>(
    (isOpen: boolean) => {
      setUploaderState(prev => ({ ...prev, isOpen, showBadge: false }));
    },
    [setUploaderState],
  );

  const handleUploadRetry = useCallback<UploaderHookState["handleUploadRetry"]>(
    async (retryJobId: UploaderQueueItem["jobId"]) => {
      const findRetryItem = uploaderState.queue.find(item => item.jobId === retryJobId);

      if (findRetryItem) {
        const importItemsRes = await importItemsAsyncMutation({
          variables: {
            input: { modelId: findRetryItem.modelId, file: findRetryItem.file },
          },
        });

        if (
          importItemsRes.error ||
          !importItemsRes.data ||
          !importItemsRes?.data?.importItemsAsync?.job
        ) {
          Notification.error({ message: "retry failed" });
          return;
        }

        const {
          id: newJobId,
          type: jobType,
          status: jobStatus,
          progress,
        } = importItemsRes.data.importItemsAsync.job;
        const { percentage, processed, total } = progress;

        setUploaderState(prev => ({
          ...prev,
          queue: prev.queue.map(_prev =>
            _prev.jobId === retryJobId
              ? {
                  ..._prev,
                  jobId: newJobId,
                  jobProgress: { percentage, total, processed },
                  jobType,
                  jobStatus,
                }
              : _prev,
          ),
        }));
      }
    },
    [importItemsAsyncMutation, setUploaderState, uploaderState.queue],
  );

  const handleUploadCancel = useCallback<UploaderHookState["handleUploadCancel"]>(
    async (cancelJobId: UploaderQueueItem["jobId"]) => {
      const findCancelItem = uploaderState.queue.find(item => item.jobId === cancelJobId);

      if (!findCancelItem) {
        Notification.error({ message: "cancel failed, cannot find job id" });
        return;
      }

      const cancelJobRes = await cancelJobMutation({ variables: { jobId: findCancelItem.jobId } });

      if (!cancelJobRes?.data?.cancelJob) return;

      const { status: newStatus } = cancelJobRes.data.cancelJob;

      setUploaderState(prev => ({
        ...prev,
        queue: prev.queue.map(queueItem =>
          queueItem.jobId === findCancelItem.jobId
            ? { ...queueItem, jobStatus: newStatus }
            : queueItem,
        ),
      }));
    },
    [cancelJobMutation, setUploaderState, uploaderState.queue],
  );

  const handleCancelAll = useCallback<UploaderHookState["handleCancelAll"]>(async () => {
    for await (const queueItem of uploaderState.queue) {
      if ([JobStatus.InProgress, JobStatus.Pending].includes(queueItem.jobStatus))
        await cancelJobMutation({ variables: { jobId: queueItem.jobId } });
    }
    const cancelPromises = uploaderState.queue.reduce<Promise<MutateResult<CancelJobMutation>>[]>(
      (acc, curr) =>
        [JobStatus.InProgress, JobStatus.Pending].includes(curr.jobStatus)
          ? [...acc, cancelJobMutation({ variables: { jobId: curr.jobId } })]
          : acc,
      [],
    );

    try {
      await Promise.all(cancelPromises);
    } catch (_error) {
      Notification.error({ message: "Cancel all failed" });
      return;
    }

    setUploaderState(prev => ({ ...prev, isOpen: false, queue: [], showBadge: false }));
  }, [cancelJobMutation, setUploaderState, uploaderState.queue]);

  const shouldPreventReload = useMemo<UploaderHookState["shouldPreventReload"]>(
    () =>
      uploaderState.queue.filter(_queue =>
        [JobStatus.InProgress, JobStatus.Failed, JobStatus.Cancelled].includes(_queue.jobStatus),
      ).length > 0,
    [uploaderState.queue],
  );

  const uploadingFileCount = useMemo<UploaderHookState["uploadingFileCount"]>(
    () => uploaderState.queue.filter(item => item.jobStatus === JobStatus.InProgress).length,
    [uploaderState.queue],
  );

  const handleJobProgressUpdate = useCallback<UploaderHookState["handleJobProgressUpdate"]>(
    payload => {
      setUploaderState(prev => ({
        ...prev,
        queue: prev.queue.map(item => {
          return item.jobId === payload.jobId
            ? {
                ...item,
                jobProgress: payload.jobProgress,
                jobStatus: getJobStatus(payload.jobProgress) || item.jobStatus,
              }
            : item;
        }),
      }));
    },
    [setUploaderState],
  );

  const contextValue = useMemo<UploaderHookState>(
    () => ({
      isShowUploader,
      uploaderState,
      shouldPreventReload,
      uploadingFileCount,
      handleUploaderOpen,
      handleUploadCancel,
      handleUploadRetry,
      handleCancelAll,
      handleEnqueueJob,
      handleJobProgressUpdate,
    }),
    [
      handleCancelAll,
      handleEnqueueJob,
      handleUploadCancel,
      handleUploadRetry,
      handleUploaderOpen,
      isShowUploader,
      shouldPreventReload,
      uploaderState,
      uploadingFileCount,
      handleJobProgressUpdate,
    ],
  );

  return (
    <UploaderHookStateContext.Provider value={contextValue}>
      {children}
    </UploaderHookStateContext.Provider>
  );
};
