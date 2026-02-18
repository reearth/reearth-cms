import { useQuery } from "@apollo/client/react";
import { ConfigProvider } from "antd";
import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import { ReactNode, useEffect, useMemo } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";

import { useAuth } from "@reearth-cms/auth";
import { GetLanguageDocument } from "@reearth-cms/gql/__generated__/user.generated";

import i18n from "./i18n";

const antdLocales: Record<string, typeof enUS> = {
  en: enUS,
  ja: jaJP,
};

function AntdLocaleProvider({ children }: { children?: ReactNode }) {
  const { i18n: i18nInstance } = useTranslation();
  const antdLocale = useMemo(
    () => antdLocales[i18nInstance.language] ?? enUS,
    [i18nInstance.language],
  );
  return <ConfigProvider locale={antdLocale}>{children}</ConfigProvider>;
}

export default function Provider({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data } = useQuery(GetLanguageDocument, { skip: !isAuthenticated });
  const locale = data?.me?.lang;

  useEffect(() => {
    i18n.changeLanguage(locale === "und" ? undefined : locale);
  }, [locale]);

  return (
    <I18nextProvider i18n={i18n}>
      <AntdLocaleProvider>{children}</AntdLocaleProvider>
    </I18nextProvider>
  );
}
