import styled from "@emotion/styled";
import { useCallback } from "react";

import Button from "@reearth-cms/components/atoms/Button";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import Notification from "@reearth-cms/components/atoms/Notification";
import Select from "@reearth-cms/components/atoms/Select";
import { useT } from "@reearth-cms/i18n";
import { RegexUtils } from "@reearth-cms/utils/regex";
import { AntdToken } from "@reearth-cms/utils/style";

import CountTag from "./CountTag";

type Props = {
  origins: string[];
  onChange: (origins: string[]) => void;
};

const AllowedOrigins: React.FC<Props> = ({ origins, onChange }) => {
  const t = useT();

  const handleChange = useCallback(
    (next: string[]) => {
      // Removal (or no addition): accept as-is.
      if (next.length <= origins.length) {
        onChange(next);
        return;
      }

      const added = next.find(origin => !origins.includes(origin));
      if (!added) return;

      if (!RegexUtils.validateOrigin(added)) {
        Notification.warning({
          message: t("Please enter a valid origin (e.g. https://example.com)."),
        });
        return;
      }

      const normalized = added.replace(/\/+$/, "");
      if (origins.includes(normalized)) return;

      onChange([...origins, normalized]);
    },
    [onChange, origins, t],
  );

  const handleClearAll = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <ContentSection
      title={t("Allowed Origins")}
      description={t(
        "Only requests from listed origins will be accepted. If no origins are configured, all submissions will be denied.",
      )}
      hasHorizontalRule={false}
      hasPadding={false}
      headerActions={<CountTag count={origins.length} />}>
      <StyledSelect
        mode="tags"
        open={false}
        value={origins}
        onChange={value => handleChange(value as string[])}
        tokenSeparators={[",", " "]}
        placeholder="https://api.example.com"
      />
      <ButtonClearAll type="link" disabled={!origins.length} onClick={handleClearAll}>
        {t("Clear all")}
      </ButtonClearAll>
    </ContentSection>
  );
};

const StyledSelect = styled(Select)`
  width: 100%;
  margin-bottom: ${AntdToken.SPACING.BASE}px;
`;

const ButtonClearAll = styled(Button)`
  margin-left: auto;
  margin-right: 0;
`;

export default AllowedOrigins;
