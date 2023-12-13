import InnerContent from "@reearth-cms/components/atoms/InnerContents/basic";
import ContentSection from "@reearth-cms/components/atoms/InnerContents/ContentSection";
import WorkspaceTilesForm from "@reearth-cms/components/molecules/Settings/TilesForm";
import { useT } from "@reearth-cms/i18n";

const Settings: React.FC = () => {
  const t = useT();

  const tiles = [
    {
      id: "1",
      name: "tile1",
      url: "http://127.0.0.1:3000/",
      image: "http://127.0.0.1:3000/",
    },
    {
      id: "2",
      name: "tile2",
      url: "http://127.0.0.1:3000/",
      image: "http://127.0.0.1:3000/",
    },
    {
      id: "3",
      name: "tile3",
      url: "http://127.0.0.1:3000/",
      image: "http://127.0.0.1:3000/",
    },
  ];

  return (
    <InnerContent title={t("Settings")}>
      <ContentSection
        title={t("Geospatial asset preview setting")}
        description={t("For asset viewer (formats like 3D Tiles, MVT, GeoJSON, CZML ... )")}>
        <WorkspaceTilesForm tiles={tiles} />
      </ContentSection>
    </InnerContent>
  );
};

export default Settings;
