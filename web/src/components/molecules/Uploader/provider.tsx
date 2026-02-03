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
  handleJobUpdate: (payload: Pick<UploaderQueueItem, "jobId" | "jobState">) => void;
};

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

      if (
        importItemsRes.error ||
        !importItemsRes.data ||
        !importItemsRes?.data?.importItemsAsync?.job
      ) {
        if (importItemsRes.error) Notification.error({ message: importItemsRes.error.message });
        return;
      }

      const { id: jobId, status, progress } = importItemsRes.data.importItemsAsync.job;

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
          jobState: { status, progress },
        };

        return {
          ...prev,
          isOpen: true,
          showBadge: true,
          queue: [newQueueItem, ...prev.queue],
        };
      });

      // getJobStateFallback(jobId);
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

        const { id: newJobId, status, progress } = importItemsRes.data.importItemsAsync.job;

        setUploaderState(prev => ({
          ...prev,
          queue: prev.queue.map(_prev =>
            _prev.jobId === retryJobId
              ? {
                  ..._prev,
                  jobId: newJobId,
                  jobState: { status, progress },
                }
              : _prev,
          ),
        }));

        // getJobStateFallback(newJobId);
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
            ? { ...queueItem, jobState: { ...queueItem.jobState, status: newStatus } }
            : queueItem,
        ),
      }));
    },
    [cancelJobMutation, setUploaderState, uploaderState.queue],
  );

  const handleCancelAll = useCallback<UploaderHookState["handleCancelAll"]>(async () => {
    const cancelPromises = uploaderState.queue.reduce<Promise<MutateResult<CancelJobMutation>>[]>(
      (acc, curr) =>
        [JobStatus.InProgress, JobStatus.Pending].includes(curr.jobState.status)
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
        [JobStatus.InProgress, JobStatus.Failed, JobStatus.Cancelled].includes(
          _queue.jobState.status,
        ),
      ).length > 0,
    [uploaderState.queue],
  );

  const uploadingFileCount = useMemo<UploaderHookState["uploadingFileCount"]>(
    () => uploaderState.queue.filter(item => item.jobState.status === JobStatus.InProgress).length,
    [uploaderState.queue],
  );

  const handleJobUpdate = useCallback<UploaderHookState["handleJobUpdate"]>(
    payload => {
      setUploaderState(prev => ({
        ...prev,
        queue: prev.queue.map(item =>
          item.jobId === payload.jobId ? { ...item, jobState: payload.jobState } : item,
        ),
      }));
    },
    [setUploaderState],
  );

  const contextValue = useMemo<UploaderHookState>(
    () => ({
      handleCancelAll,
      handleEnqueueJob,
      handleJobUpdate,
      handleUploadCancel,
      handleUploaderOpen,
      handleUploadRetry,
      isShowUploader,
      shouldPreventReload,
      uploaderState,
      uploadingFileCount,
    }),
    [
      handleCancelAll,
      handleEnqueueJob,
      handleJobUpdate,
      handleUploadCancel,
      handleUploaderOpen,
      handleUploadRetry,
      isShowUploader,
      shouldPreventReload,
      uploaderState,
      uploadingFileCount,
    ],
  );

  return (
    <UploaderHookStateContext.Provider value={contextValue}>
      {children}
    </UploaderHookStateContext.Provider>
  );
};
