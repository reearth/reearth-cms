import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";
import { z } from "zod";

import Button from "@reearth-cms/components/atoms/Button";
import Flex from "@reearth-cms/components/atoms/Flex";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Notification from "@reearth-cms/components/atoms/Notification";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";
import { RegularExpression } from "@reearth-cms/utils/regex";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import CountTag from "./CountTag";

const ORIGIN_SCHEMA = z.string().regex(RegularExpression.DOMAIN_REGEX);

type Props = {
  origins: string[];
  onChange: (origins: string[]) => void;
  // TODO(public-api): saved baseline from the backend; drives the "unchanged" / rollback logic.
  savedOrigins?: string[];
  // TODO(public-api): wire to the backend mutation once allowed-origins support lands.
  onSubmit?: (origins: string[]) => Promise<void>;
};

const AllowedOrigins: React.FC<Props> = ({ origins, onChange, savedOrigins, onSubmit }) => {
  const t = useT();
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback(
    (next: string[]) => {
      // Removal (or no addition): accept as-is.
      if (next.length <= origins.length) {
        onChange(next);
        return;
      }

      const added = next.find(origin => !origins.includes(origin));
      if (!added) return;

      if (!ORIGIN_SCHEMA.safeParse(added).success) {
        Notification.warning({ message: t("Please enter a valid domain (e.g. example.com).") });
        return;
      }

      onChange([...origins, added]);
    },
    [onChange, origins, t],
  );

  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  const isUnchanged = useMemo(() => {
    const prev = savedOrigins ?? [];
    return prev.length === origins.length && prev.every((origin, i) => origin === origins[i]);
  }, [savedOrigins, origins]);

  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return;
    const prev = savedOrigins ?? [];
    setSubmitting(true);
    try {
      await onSubmit(origins);
      Notification.success({ message: t("Successfully updated allowed origins!") });
    } catch {
      onChange(prev); // rollback optimistic change
      Notification.error({ message: t("Failed to update allowed origins.") });
    } finally {
      setSubmitting(false);
    }
  }, [savedOrigins, onChange, onSubmit, origins, t]);

  return (
    <ContentSection title={t("Allowed Origins")}>
      <Flex justify="space-between">
        <Paragraph>
          {t(
            "Only requests from listed origins will be accepted. If no origins are configured, all submissions will be denied.",
          )}
        </Paragraph>
        <CountTag count={origins.length} />
      </Flex>
      <StyledSelect
        mode="tags"
        open={false}
        value={origins}
        onChange={value => handleChange(value as string[])}
        tokenSeparators={[",", " "]}
        placeholder="api.example.com"
      />
      <Flex justify="space-between">
        <Button
          type="primary"
          disabled={isUnchanged || !onSubmit}
          loading={submitting}
          onClick={handleSubmit}>
          {t("Save changes")}
        </Button>
        <Button type="link" disabled={!origins.length || submitting} onClick={handleClearAll}>
          {t("Clear all")}
        </Button>
      </Flex>
    </ContentSection>
  );
};

const Paragraph = styled.p`
  color: ${AntdColor.GREY.GREY_2};
  padding-bottom: ${AntdToken.SPACING.BASE}px;
`;

const StyledSelect = styled(Select)`
  width: 100%;
  margin-bottom: ${AntdToken.SPACING.BASE}px;
`;

export default AllowedOrigins;
