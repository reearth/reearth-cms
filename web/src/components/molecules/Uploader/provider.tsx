import { ApolloClient } from "@apollo/client";
import { useSubscription, useMutation, useLazyQuery } from "@apollo/client/react";
import { createContext, ReactNode, useCallback, useEffect, useMemo } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { RcFile } from "@reearth-cms/components/atoms/Upload";
import { JobStatus } from "@reearth-cms/gql/__generated__/graphql.generated";
import { ImportItemsAsyncDocument } from "@reearth-cms/gql/__generated__/item.generated";
import {
  JobProgressDocument,
  CancelJobDocument,
  JobsDocument,
  CancelJobMutation,
} from "@reearth-cms/gql/__generated__/job.generated";
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
};

export const UploaderHookStateContext = createContext<UploaderHookState | undefined>(undefined);

const FULL_PERCENTAGE = 100;
const EMPTY_PERCENTAGE = 0;

export const UploaderProvider = ({ children }: { children: ReactNode }) => {
  const [uploaderState, setUploaderState] = useUploader();

  const [getJobsData] = useLazyQuery(JobsDocument, { fetchPolicy: "network-only" });

  const { data: _currentJobProgressData } = useSubscription(JobProgressDocument, {
    variables: { jobId: uploaderState.currentJobId || "" },
    skip: !uploaderState.currentJobId,
    onData: async ({ data }) => {
      const _currentJobData = data.data;

      console.log("=".repeat(10), "sub", "=".repeat(10));
      console.log("currentJobId", uploaderState.currentJobId);
      console.log("_currentJobData", _currentJobData?.jobProgress);
      console.log("=".repeat(30));

      // if (!_currentJobData) return;
      // const {
      //   jobProgress: { percentage, processed, total },
      // } = _currentJobData;

      // const isDone = percentage === FULL_PERCENTAGE;
      // const isInProgress = percentage > EMPTY_PERCENTAGE && percentage < FULL_PERCENTAGE;

      // // const newJobStatus = await getJobData({ variables: { jobId: uploaderState.currentJobId || '' } });

      // setUploaderState(prev => {
      //   // update progress
      //   let newQueue: UploaderState["queue"] = prev.queue.map(prevQueueItem =>
      //     prevQueueItem.jobId === prev.currentJobId
      //       ? {
      //           ...prevQueueItem,
      //           jobStatus: isDone
      //             ? JobStatus.Completed
      //             : isInProgress
      //               ? JobStatus.InProgress
      //               : prevQueueItem.jobStatus,
      //           jobProgress: { percentage, processed, total },
      //         }
      //       : prevQueueItem,
      //   );
      //   let newCurrentJobId: UploaderState["currentJobId"] = prev.currentJobId;

      //   // check done, if done, trace next item progress
      //   if (isDone) {
      //     const findPendingItem = newQueue.findLast(
      //       _queue => _queue.jobStatus === JobStatus.Pending,
      //     );

      //     if (findPendingItem) newCurrentJobId = findPendingItem.jobId;
      //     else newCurrentJobId = null;

      //     newQueue = newQueue.map(_queue =>
      //       _queue.jobId === newCurrentJobId
      //         ? {
      //             ..._queue,
      //             jobStatus: JobStatus.InProgress,
      //           }
      //         : _queue,
      //     );
      //   }

      //   return {
      //     ...prev,
      //     queue: newQueue,
      //     currentJobId: newCurrentJobId,
      //   };

      // });
    },
  });

  // useEffect(() => {
  //   setUploaderState(prev => {
  //     // const isAllDone = prev.queue.every(_queue => _queue.jobStatus === JobStatus.Completed);
  //     const findPendingItem = prev.queue.findLast(_queue => _queue.jobStatus === JobStatus.Pending);

  //     // let newCurrentJobId: UploaderHookState["uploaderState"]["currentJobId"] = null;
  //     // if (findPendingItem) {
  //     //   newCurrentJobId = findPendingItem.jobId;
  //     // }

  //     return {
  //       ...prev,
  //       currentJobId: findPendingItem ? findPendingItem.jobId : null,
  //     };
  //   });
  // }, [setUploaderState]);

  // TODO: remove this interval effect
  useEffect(() => {
    if (
      uploaderState.queue.length === 0 ||
      uploaderState.queue.every(item => item.jobProgress?.percentage === FULL_PERCENTAGE) ||
      uploaderState.queue.every(item =>
        [JobStatus.Completed, JobStatus.Failed, JobStatus.Cancelled].includes(item.jobStatus),
      )
    )
      return;

    const id = setInterval(async () => {
      console.log("hello");

      const jobs = await getJobsData({ variables: { projectId: "01k8s9ehfzp5v2273s4zthtwev" } });
      const data = jobs.data;
      const jobList = data?.jobs || [];

      console.log("jobList", jobList);

      setUploaderState(prev => ({
        ...prev,
        queue: prev.queue.map(item => {
          const findJob = jobList.find(_item => _item.id === item.jobId);

          return {
            ...item,
            jobStatus: findJob ? findJob.status : item.jobStatus,
            jobProgress: findJob
              ? {
                  percentage: findJob.progress.percentage,
                  processed: findJob.progress.processed,
                  total: findJob.progress.total,
                }
              : item.jobProgress,
          };
        }),
      }));
    }, 300);

    return () => clearInterval(id);
  }, [getJobsData, setUploaderState, uploaderState]);

  const [importItemsAsyncMutation] = useMutation(ImportItemsAsyncDocument);

  const [cancelJobMutation] = useMutation(CancelJobDocument);

  const handleEnqueueJob = useCallback<UploaderHookState["handleEnqueueJob"]>(
    async ({ workspaceId, projectId, modelId, fileName, extension, url, file }) => {
      const importItemsRes = await importItemsAsyncMutation({
        variables: {
          input: { file, modelId },
        },
      });

      // TODO: remove test code
      // const response2 = await importItemsAsyncMutation({
      //   variables: {
      //     input: {
      //       file,
      //       modelId,
      //     },
      //   },
      // });

      // TODO: check error
      if (
        importItemsRes.error ||
        !importItemsRes.data ||
        !importItemsRes?.data?.importItemsAsync?.job
      ) {
        Notification.error({ message: "enqueue failed" });
        return;
      }

      // TODO: remove test code
      // if (response2.error || !response2.data || !response2?.data?.importItemsAsync?.job) {
      //   Notification.error({ message: "enqueue failed" });
      //   return;
      // }

      const {
        id: jobId,
        type: jobType,
        status: jobStatus,
        progress,
      } = importItemsRes.data.importItemsAsync.job;
      const { percentage, processed, total } = progress;

      console.log("response", importItemsRes);

      // TODO: remove test code
      // const {
      //   id: jobId2,
      //   type: jobType2,
      //   status: jobStatus2,
      //   progress: progress2,
      // } = response2.data.importItemsAsync.job;
      // const { percentage: percentage2, processed: processed2, total: total2 } = progress2;

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

        // TODO: remove test code
        // const newQueueItem2: UploaderQueueItem = {
        //   jobId: jobId2,
        //   fileName,
        //   extension,
        //   url,
        //   file,
        //   jobProgress: { percentage: percentage2, total: total2, processed: processed2 },
        //   jobType: jobType2,
        //   jobStatus: jobStatus2,
        // };

        // const isAllDone = prev.queue.every(_queue => _queue.jobStatus === JobStatus.Completed);

        return {
          ...prev,
          isOpen: true,
          showBadge: true,
          queue: [newQueueItem, ...prev.queue],
          // currentJobId: isAllDone ? jobId : prev.currentJobId,
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
    ],
  );

  return (
    <UploaderHookStateContext.Provider value={contextValue}>
      {children}
    </UploaderHookStateContext.Provider>
  );
};
