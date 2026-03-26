import styled from "@emotion/styled";
import { useMemo } from "react";

import Icon from "@reearth-cms/components/atoms/Icon";
import Steps, { type StepsProps } from "@reearth-cms/components/atoms/Step";
import { RequestState } from "@reearth-cms/components/molecules/Request/types";
import { useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

type Props = {
  requestState: RequestState;
};

const RequestStatus: React.FC<Props> = ({ requestState }) => {
  const t = useT();
  const items = useMemo<StepsProps["items"]>(() => {
    if (requestState === "APPROVED") {
      return [
        {
          icon: <StyledIcon icon="checkCircle" color={AntdColor.GREEN.GREEN_5} size={28} />,
          title: <StatusTitle>{t("Approved")}</StatusTitle>,
        },
      ];
    }
    if (requestState === "CLOSED") {
      return [
        {
          icon: "closeCircle",
          color: AntdColor.GREY.GREY_0 /* originally #BFBFBF */,
          size: 28,
          title: <StatusTitle>{t("Closed")}</StatusTitle>,
        },
      ];
    }
    return [];
  }, [requestState, t]);

  return <StyledSteps orientation="vertical" current={1} items={items} />;
};

const StyledSteps = styled(Steps)`
  position: relative;
  max-width: 100%;
  padding: 36px 0 0 44px;
  display: inline-block;
  .ant-steps-item-icon::before {
    content: "";
    display: block;
    position: absolute;
    width: ${AntdToken.SPACING.XXS}px;
    height: ${AntdToken.SPACING.LG}px;
    background-color: ${AntdColor.NEUTRAL.BORDER};
    left: ${AntdToken.SPACING.BASE}px;
    top: -30px;
  }
`;

const StyledIcon = styled(Icon)`
  padding-top: 3px;
  padding-left: 3px;
`;

const StatusTitle = styled.p`
  display: inline;
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  font-size: ${AntdToken.FONT.SIZE}px;
  line-height: ${AntdToken.LINE_HEIGHT.BASE}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

export default RequestStatus;
