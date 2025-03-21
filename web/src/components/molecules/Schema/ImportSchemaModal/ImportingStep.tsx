import Progress from "@reearth-cms/components/atoms/Progress";

type ImportingStepProps = {
  t: (key: string) => string;
};

const ImportingStep: React.FC<ImportingStepProps> = ({ t }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    }}>
    <Progress type="circle" percent={50} />
    <p style={{ fontSize: 24 }}>{t("Importing...")}</p>
  </div>
);

export default ImportingStep;
