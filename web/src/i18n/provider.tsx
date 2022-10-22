import { ConfigProvider } from "antd";
import { Locale } from "antd/lib/locale-provider";
import enUSIntl from "antd/lib/locale/en_US";
import jaJPIntl from "antd/lib/locale/ja_JP";
import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

import { useAuth } from "@reearth-cms/auth";
import { useGetLanguageQuery } from "@reearth-cms/gql/graphql-client-api";

import i18n from "./i18n";

export default function Provider({ children }: { children?: ReactNode }) {
  const [antdLang, setAntdLang] = useState<Locale>(enUSIntl);
  const { isAuthenticated } = useAuth();
  const { data } = useGetLanguageQuery({ skip: !isAuthenticated });
  const locale = data?.me?.lang;

  useEffect(() => {
    i18n.changeLanguage(locale === "und" ? undefined : locale);
  }, [locale]);

  useEffect(() => {
    setAntdLang(locale === "ja" ? jaJPIntl : enUSIntl);
  }, [locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <ConfigProvider locale={antdLang}>{children}</ConfigProvider>
    </I18nextProvider>
  );
}
