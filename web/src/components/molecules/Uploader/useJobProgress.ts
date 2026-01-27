import { useSubscription } from "@apollo/client/react";

import { Exact, Scalars } from "@reearth-cms/gql/__generated__/graphql.generated";
import {
  JobProgressDocument,
  JobProgressSubscription,
} from "@reearth-cms/gql/__generated__/job.generated";

import { UploaderQueueItem } from "./types";

type Params = {
  jobId: UploaderQueueItem["jobId"];
  updateJobProgressCallback: useSubscription.Base.Options<
    JobProgressSubscription,
    Exact<{ jobId: Scalars["ID"]["input"] }>
  >["onData"];
  shouldSubscribe?: boolean;
};

export default function useJobProgress(params: Params): void {
  const { jobId, updateJobProgressCallback, shouldSubscribe = true } = params;

  useSubscription(JobProgressDocument, {
    variables: { jobId },
    skip: !shouldSubscribe,
    onData: updateJobProgressCallback,
    fetchPolicy: "network-only",
  });
}
