import { ApolloClient } from "@apollo/client";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { createContext, ReactNode, useCallback, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { RcFile } from "@reearth-cms/components/atoms/Upload";
import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { ImportItemsAsyncDocument } from "@reearth-cms/gql/__generated__/item.generated";
import {
  CancelJobDocument,
  CancelJobMutation,
  JobDocument,
} from "@reearth-cms/gql/__generated__/job.generated";
import { useUploader } from "@reearth-cms/state";
import { Constant } from "@reearth-cms/utils/constant";

import { UploaderQueueItem, UploaderState } from "./types";

import MutateResult = ApolloClient.MutateResult;

export type UploaderHookState = {
  handleCancelAll: () => Promise<void>;
  handleEnqueueJob: (payload: {
    extension: "csv" | "geojson" | "json";
    file: RcFile;
    fileName: string;
    modelId: string;
    projectId: string;
    url: string;
    workspaceId: string;
  }) => Promise<void>;
  handleJobUpdate: (payload: Pick<UploaderQueueItem, "jobId" | "jobState">) => void;
  handleUploadCancel: (id: UploaderQueueItem["jobId"]) => Promise<void>;
  handleUploaderOpen: (isOpen: boolean) => void;
  handleUploadRetry: (id: UploaderQueueItem["jobId"]) => Promise<void>;
  isShowUploader: boolean;
  shouldPreventReload: boolean;
  uploaderState: UploaderState;
  uploadingFileCount: number;
};

export const UploaderHookStateContext = createContext<undefined | UploaderHookState>(undefined);

export const UploaderProvider = ({ children }: { children: ReactNode }) => {
  const [uploaderState, setUploaderState] = useUploader();

  const [importItemsAsyncMutation] = useMutation(ImportItemsAsyncDocument);
  const [cancelJobMutation] = useMutation(CancelJobDocument);
  const [getJob] = useLazyQuery(JobDocument);

  const getJobStateFallback = useCallback(
    (jobId: UploaderQueueItem["jobId"]) => {
      setTimeout(async () => {
        const jobRes = await getJob({ variables: { jobId } });

        setUploaderState(prev => ({
          ...prev,
          queue: prev.queue.map(item =>
            item.jobId === jobId
              ? {
                  ...item,
                  jobState: {
                    ...item.jobState,
                    error: jobRes.data?.job ? jobRes.data.job.error : item.jobState.error,
                    progress: jobRes.data?.job ? jobRes.data.job.progress : item.jobState.progress,
                    status: jobRes.data?.job ? jobRes.data.job.status : item.jobState.status,
                  },
                }
              : item,
          ),
        }));
      }, Constant.IMPORT.GET_JOB_DELAY_TIME_IN_MS);
    },
    [getJob, setUploaderState],
  );

  const handleEnqueueJob = useCallback<UploaderHookState["handleEnqueueJob"]>(
    async ({ extension, file, fileName, modelId, projectId, url, workspaceId }) => {
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

      const { id: jobId, progress, status } = importItemsRes.data.importItemsAsync.job;

      setUploaderState(prev => {
        const newQueueItem: UploaderQueueItem = {
          extension,
          file,
          fileName,
          jobId,
          jobState: { progress, status },
          modelId,
          projectId,
          url,
          workspaceId,
        };

        return {
          ...prev,
          isOpen: true,
          queue: [newQueueItem, ...prev.queue],
          showBadge: true,
        };
      });

      getJobStateFallback(jobId);
    },
    [getJobStateFallback, importItemsAsyncMutation, setUploaderState],
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
            input: { file: findRetryItem.file, modelId: findRetryItem.modelId },
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

        const { id: newJobId, progress, status } = importItemsRes.data.importItemsAsync.job;

        setUploaderState(prev => ({
          ...prev,
          queue: prev.queue.map(_prev =>
            _prev.jobId === retryJobId
              ? {
                  ..._prev,
                  jobId: newJobId,
                  jobState: { progress, status },
                }
              : _prev,
          ),
        }));

        getJobStateFallback(newJobId);
      }
    },
    [getJobStateFallback, importItemsAsyncMutation, setUploaderState, uploaderState.queue],
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
