import { useSubscription } from "@apollo/client/react";

import { Exact, Scalars } from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  JobStateDocument,
  JobStateSubscription,
} from "@reearth-cms/gql/__generated__/job.generated";

import { UploaderQueueItem } from "./types";

type Params = {
  jobId: UploaderQueueItem["jobId"];
  shouldSubscribe?: boolean;
  onJobUpdateCallback: useSubscription.Base.Options<
    JobStateSubscription,
    Exact<{ jobId: Scalars["ID"]["input"] }>
  >["onData"];
  onJobCompleteCallback?: useSubscription.Base.Options<
    JobStateSubscription,
    Exact<{ jobId: Scalars["ID"]["input"] }>
  >["onComplete"];
  onJobErrorCallback?: useSubscription.Base.Options<
    JobStateSubscription,
    Exact<{ jobId: Scalars["ID"]["input"] }>
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
