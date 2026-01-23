import { gql } from "@apollo/client";

export const JOB = gql`
  query Job($jobId: ID!) {
    job(jobId: $jobId) {
      id
      type
      status
      projectId
      progress {
        processed
        total
        percentage
      }
      error
      createdAt
      updatedAt
      startedAt
      completedAt
    }
  }
`;

export const JOBS = gql`
  query Jobs($projectId: ID!, $type: JobType, $status: JobStatus) {
    jobs(projectId: $projectId, type: $type, status: $status) {
      id
      type
      status
      projectId
      progress {
        processed
        total
        percentage
      }
    }
  }
`;

export const JOB_PROCESS = gql`
  subscription JobProgress($jobId: ID!) {
    jobProgress(jobId: $jobId) {
      processed
      total
      percentage
    }
  }
`;

export const CANCEL_JOB = gql`
  mutation CancelJob($jobId: ID!) {
    cancelJob(jobId: $jobId) {
      id
      status
    }
  }
`;
