import React from "react";
import { useTranslation } from "react-i18next";

export type Props = {
  path?: string;
};

const RootPage: React.FC<Props> = () => {
  const { t } = useTranslation();
  return <h1>{t("CMS root page")}</h1>;
};

export default RootPage;
