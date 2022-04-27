import Typography from "@reearth-cms/components/atoms/Typography";
import { useTranslation } from "react-i18next";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  const { t } = useTranslation();
  const { Title } = Typography;
  return <Title>{t("test")}</Title>;
};

export default RootPage;
