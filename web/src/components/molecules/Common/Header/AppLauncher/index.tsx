import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";

import Dropdown from "@reearth-cms/components/atoms/Dropdown";
import Icon from "@reearth-cms/components/atoms/Icon";
import type { IconName } from "@reearth-cms/components/atoms/Icon";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/data";
import { Constant } from "@reearth-cms/utils/constant";
import { joinPaths } from "@reearth-cms/utils/path";
import { AntdColor, AntdToken, CustomColor } from "@reearth-cms/utils/style";

type Props = {
  workspaceId?: string;
  onHomeNavigation: () => void;
};

type LauncherLink = {
  // `undefined` means the target URL is not configured, so the item renders disabled.
  href?: string;
  onClick?: () => void;
  testId: DATA_TEST_ID;
};

type ProductItem = LauncherLink & {
  title: string;
  icon: IconName;
  iconBackground: string;
};

type DataServiceItem = LauncherLink & {
  title: string;
  description: string;
};

type OtherItem = LauncherLink & {
  title: string;
  icon: IconName;
};

const AppLauncher: React.FC<Props> = ({ workspaceId, onHomeNavigation }) => {
  const t = useT();
  const [open, setOpen] = useState<boolean>(false);

  const dashboardBaseUrl = window.REEARTH_CONFIG?.dashboardBaseUrl;
  const editorUrl = window.REEARTH_CONFIG?.editorUrl;

  const visualizerUrl = useMemo<string | undefined>(() => {
    if (!editorUrl) return undefined;
    return workspaceId ? new URL(`dashboard/${workspaceId}`, editorUrl).href : editorUrl;
  }, [editorUrl, workspaceId]);

  const handleCmsClick = useCallback(() => {
    setOpen(false);
    onHomeNavigation();
  }, [onHomeNavigation]);

  const products: ProductItem[] = [
    {
      title: t("Dashboard"),
      icon: "logoReearth",
      iconBackground: AntdColor.NEUTRAL.BG_LAYOUT,
      href: dashboardBaseUrl,
      testId: DATA_TEST_ID.AppLauncher__Dashboard,
    },
    {
      title: "Visualizer",
      icon: "logoVisualizer",
      iconBackground: CustomColor.PRODUCT_LOGO_BG_VISUALIZER,
      href: visualizerUrl,
      testId: DATA_TEST_ID.AppLauncher__Visualizer,
    },
    {
      title: "CMS",
      icon: "logoCms",
      iconBackground: CustomColor.PRODUCT_LOGO_BG_CMS,
      onClick: handleCmsClick,
      testId: DATA_TEST_ID.AppLauncher__Cms,
    },
  ];

  const dataServices: DataServiceItem[] = [
    {
      title: "Terrain",
      description: t("Open terrain tiles for 3D globes"),
      href: Constant.DATA_SERVICE_URLS.TERRAIN,
      testId: DATA_TEST_ID.AppLauncher__Terrain,
    },
    {
      title: "Buildings",
      description: t("Open 3D buildings tiles for the world"),
      href: Constant.DATA_SERVICE_URLS.BUILDINGS,
      testId: DATA_TEST_ID.AppLauncher__Buildings,
    },
    {
      title: "Papers",
      description: t("Open Map Tile Service"),
      href: Constant.DATA_SERVICE_URLS.PAPERS,
      testId: DATA_TEST_ID.AppLauncher__Papers,
    },
  ];

  const others: OtherItem[] = [
    {
      title: t("Re:Earth Home"),
      icon: "home",
      href: dashboardBaseUrl ? joinPaths(dashboardBaseUrl, "home") : undefined,
      testId: DATA_TEST_ID.AppLauncher__Home,
    },
    {
      title: t("Community"),
      icon: "discord",
      href: Constant.SOCIAL_URLS.DISCORD,
      testId: DATA_TEST_ID.AppLauncher__Community,
    },
  ];

  const renderLink = (item: LauncherLink, children: React.ReactNode, className?: string) => {
    if (item.onClick) {
      return (
        <button
          type="button"
          className={className}
          onClick={item.onClick}
          data-testid={item.testId}>
          {children}
        </button>
      );
    }
    if (!item.href) {
      return (
        <Tooltip title={t("The link is not available for now")}>
          <span className={className} aria-disabled data-testid={item.testId}>
            {children}
          </span>
        </Tooltip>
      );
    }
    return (
      <a
        className={className}
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setOpen(false)}
        data-testid={item.testId}>
        {children}
      </a>
    );
  };

  const panel = (
    <Panel>
      <SectionLabel>{t("Re:Earth products")}</SectionLabel>
      <ProductGrid>
        {products.map(product => (
          <ProductTile key={product.testId}>
            {renderLink(
              product,
              <>
                <IconPlate style={{ backgroundColor: product.iconBackground }}>
                  <Icon icon={product.icon} size={40} />
                </IconPlate>
                <ProductTitle>{product.title}</ProductTitle>
              </>,
            )}
          </ProductTile>
        ))}
      </ProductGrid>

      <Divider />

      <SectionLabel>{t("Map engine")}</SectionLabel>
      <Row>
        {renderLink(
          {
            href: Constant.MAP_ENGINE_URLS.NAVARA,
            testId: DATA_TEST_ID.AppLauncher__Navara,
          },
          <>
            <IconPlate style={{ backgroundColor: CustomColor.PRODUCT_LOGO_BG_NAVARA }}>
              <Icon icon="logoNavara" size={40} />
            </IconPlate>
            <RowText>
              <RowTitle>
                Navara
                <ExternalIcon icon="arrowUpRight" />
              </RowTitle>
              <RowDescription>{t("3D map engine, MapLibre family")}</RowDescription>
            </RowText>
          </>,
        )}
      </Row>

      <Divider />

      <SectionLabel>{t("Re:Earth data services")}</SectionLabel>
      <DataServiceList>
        {dataServices.map(service => (
          <Row key={service.testId}>
            {renderLink(
              service,
              <RowText>
                <RowTitle>
                  {service.title}
                  <ExternalIcon icon="arrowUpRight" />
                </RowTitle>
                <RowDescription>{service.description}</RowDescription>
              </RowText>,
            )}
          </Row>
        ))}
      </DataServiceList>

      <Divider />

      <SectionLabel>{t("Other")}</SectionLabel>
      <PillRow>
        {others.map(other => (
          <Pill key={other.testId}>
            {renderLink(
              other,
              <>
                <Icon icon={other.icon} size={16} />
                {other.title}
              </>,
            )}
          </Pill>
        ))}
      </PillRow>
    </Panel>
  );

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomLeft"
      popupRender={() => panel}>
      <Trigger
        type="button"
        aria-label={t("App launcher")}
        data-testid={DATA_TEST_ID.AppLauncher__Trigger}>
        <Icon icon="dotsNine" size={20} />
      </Trigger>
    </Dropdown>
  );
};

export default AppLauncher;

const Trigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${AntdToken.SPACING.XXS}px;
  border: none;
  border-radius: ${AntdToken.RADIUS.BASE}px;
  background: none;
  color: ${CustomColor.HEADER_TEXT};
  cursor: pointer;

  :hover {
    background-color: ${CustomColor.HEADER_DIVIDER};
  }
`;

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.SM}px;
  width: 312px;
  max-width: calc(100vw - ${AntdToken.SPACING.XL}px);
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  padding: ${AntdToken.SPACING.BASE}px;
  border-radius: ${AntdToken.RADIUS.LG}px;
  background-color: ${AntdColor.NEUTRAL.BG_WHITE};
  box-shadow: ${AntdToken.SHADOW.SECONDARY};

  a,
  button,
  [aria-disabled] {
    color: ${AntdColor.NEUTRAL.TEXT};
  }

  button {
    border: none;
    background: none;
    font: inherit;
    cursor: pointer;
  }

  [aria-disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }

  a:focus-visible,
  button:focus-visible {
    outline: 2px solid ${AntdColor.BLUE.BLUE_5};
    outline-offset: 2px;
  }
`;

const SectionLabel = styled.span`
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
  white-space: nowrap;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${AntdColor.NEUTRAL.BORDER_SPLIT};
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 72px);
  justify-content: center;
  gap: ${AntdToken.SPACING.XS}px;
`;

const ProductTile = styled.div`
  display: flex;

  > * {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${AntdToken.SPACING.XXS}px;
    width: 100%;
    padding: ${AntdToken.SPACING.XXS}px;
    border-radius: ${AntdToken.RADIUS.LG}px;
  }

  > a:hover,
  > button:hover {
    background-color: ${AntdColor.BLUE.BLUE_0};
  }
`;

const IconPlate = styled.div`
  display: flex;
  flex-shrink: 0;
  padding: ${AntdToken.SPACING.XS}px;
  border-radius: ${AntdToken.RADIUS.LG}px;
`;

const ProductTitle = styled.span`
  width: 100%;
  /* Japanese is the primary UI language; wrap long titles (e.g. ダッシュボード) instead of truncating. */
  word-break: auto-phrase;
  overflow-wrap: anywhere;
  text-align: center;
  font-size: ${AntdToken.FONT.SIZE}px;
`;

const Row = styled.div`
  > * {
    display: flex;
    align-items: center;
    gap: ${AntdToken.SPACING.SM}px;
    padding: ${AntdToken.SPACING.XXS}px;
    margin: -${AntdToken.SPACING.XXS}px;
    border-radius: ${AntdToken.RADIUS.LG}px;
    text-align: left;
  }

  > a:hover {
    background-color: ${AntdColor.BLUE.BLUE_0};
  }
`;

const RowText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const RowTitle = styled.span`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XXS}px;
  font-size: ${AntdToken.FONT.SIZE}px;
`;

const RowDescription = styled.span`
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;

const ExternalIcon = styled(Icon)`
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};

  svg {
    width: 12px;
    height: 12px;
  }
`;

const DataServiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.XS}px;
`;

const PillRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${AntdToken.SPACING.XS}px;
`;

const Pill = styled.div`
  > * {
    display: flex;
    align-items: center;
    gap: ${AntdToken.SPACING.XXS}px;
    padding: 6px ${AntdToken.SPACING.SM}px;
    border-radius: 999px;
    background-color: ${AntdColor.NEUTRAL.BG_LAYOUT};
    font-size: ${AntdToken.FONT.SIZE}px;
  }

  > a:hover {
    background-color: ${AntdColor.BLUE.BLUE_0};
  }
`;
