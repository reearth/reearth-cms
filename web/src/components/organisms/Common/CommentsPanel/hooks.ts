import { useCallback } from "react";

import Notification from "@reearth-cms/components/atoms/Notification";
import { useAddCommentMutation } from "@reearth-cms/gql/graphql-client-api";
import { useT } from "@reearth-cms/i18n";

type Params = {
  threadId?: string;
};

export default ({ threadId }: Params) => {
  const t = useT();

  const [createComment] = useAddCommentMutation({
    refetchQueries: ["GetAsset", "GetAssets"],
  });

  const handleCommentCreate = useCallback(
    async (content: string) => {
      if (!threadId) return;
      const comment = await createComment({
        variables: {
          threadId,
          content,
        },
      });
      if (comment.errors || !comment.data?.addComment) {
        Notification.error({ message: t("Failed to create comment.") });
        return;
      }
      Notification.success({ message: t("Successfully created comment!") });
    },
    [createComment, threadId, t],
  );

  return {
    handleCommentCreate,
  };
};
