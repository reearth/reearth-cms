import { useSubscription } from "@apollo/client/react";

import type {
  JobStateSubscription,
  JobStateSubscriptionVariables,
} from "@reearth-cms/gql/__generated__/job.generated";
import { JobStateDocument } from "@reearth-cms/gql/__generated__/job.generated";

import type { UploaderQueueItem } from "./types";

type Params = {
  jobId: UploaderQueueItem["jobId"];
  shouldSubscribe?: boolean;
  onJobUpdateCallback: useSubscription.Base.Options<
    JobStateSubscription,
    JobStateSubscriptionVariables
  >["onData"];
  onJobCompleteCallback?: useSubscription.Base.Options<
    JobStateSubscription,
    JobStateSubscriptionVariables
  >["onComplete"];
  onJobErrorCallback?: useSubscription.Base.Options<
    JobStateSubscription,
    JobStateSubscriptionVariables
  >["onError"];
};

export default function useJobState(params: Params): void {
  const {
    jobId,
    shouldSubscribe = true,
    onJobUpdateCallback,
    onJobCompleteCallback,
    onJobErrorCallback,
  } = params;

  useSubscription(JobStateDocument, {
    variables: { jobId },
    skip: !shouldSubscribe,
    onData: onJobUpdateCallback,
    onError: onJobErrorCallback,
    onComplete: onJobCompleteCallback,
    fetchPolicy: "network-only",
  });
}
