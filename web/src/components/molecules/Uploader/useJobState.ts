import { useSubscription } from "@apollo/client/react";

import { Exact, Scalars } from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  JobStateDocument,
  JobStateSubscription,
} from "@reearth-cms/gql/__generated__/job.generated";

import { UploaderQueueItem } from "./types";

type Params = {
  jobId: UploaderQueueItem["jobId"];
  onJobCompleteCallback?: useSubscription.Base.Options<
    JobStateSubscription,
    Exact<{ jobId: Scalars["ID"]["input"] }>
  >["onComplete"];
  onJobErrorCallback?: useSubscription.Base.Options<
    JobStateSubscription,
    Exact<{ jobId: Scalars["ID"]["input"] }>
  >["onError"];
  onJobUpdateCallback: useSubscription.Base.Options<
    JobStateSubscription,
    Exact<{ jobId: Scalars["ID"]["input"] }>
  >["onData"];
  shouldSubscribe?: boolean;
};

export default function useJobState(params: Params): void {
  const {
    jobId,
    onJobCompleteCallback,
    onJobErrorCallback,
    onJobUpdateCallback,
    shouldSubscribe = true,
  } = params;

  useSubscription(JobStateDocument, {
    fetchPolicy: "network-only",
    onComplete: onJobCompleteCallback,
    onData: onJobUpdateCallback,
    onError: onJobErrorCallback,
    skip: !shouldSubscribe,
    variables: { jobId },
  });
}
