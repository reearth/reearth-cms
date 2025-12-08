import { gold, red } from "@ant-design/colors";
import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import Alert, { type AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Flex from "@reearth-cms/components/atoms/Flex";
import Icon from "@reearth-cms/components/atoms/Icon";
import Loading from "@reearth-cms/components/atoms/Loading";
import Modal from "@reearth-cms/components/atoms/Modal";
import Space from "@reearth-cms/components/atoms/Space";
import Typography from "@reearth-cms/components/atoms/Typography";
import Upload, { UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ValidateImportResult } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { Trans, useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { FileUtils } from "@reearth-cms/utils/file";
import { ErrorMeta, ImportContentJSON, ImportUtils } from "@reearth-cms/utils/import";
import { ObjectUtils } from "@reearth-cms/utils/object";

const { Dragger } = Upload;

type Props = {
  isOpen: boolean;
  dataChecking: boolean;
  modelFields: Model["schema"]["fields"];
  onSetDataChecking: (isChecking: boolean) => void;
  onClose: () => void;
  onFileContentChange: ({
    fileContent,
    extension,
  }: {
    fileContent: Record<string, unknown>[];
    extension: "csv" | "json" | "geojson";
  }) => void;
  alertList: AlertProps[];
  setAlertList: Dispatch<SetStateAction<AlertProps[]>>;
  validateImportResult: ValidateImportResult | null;
  setValidateImportResult: Dispatch<SetStateAction<ValidateImportResult | null>>;
};

const TemplateLink = ({ href, children }: ButtonProps) => (
  <StyledButton onClick={event => event.stopPropagation()} type="link" href={href} download>
    {children}
  </StyledButton>
);

const ContentImportModal: React.FC<Props> = ({
  isOpen,
  dataChecking,
  modelFields,
  onSetDataChecking,
  onClose,
  onFileContentChange,
  alertList,
  setAlertList,
  validateImportResult,
  setValidateImportResult,
}) => {
  const t = useT();

  const raiseIllegalFileAlert = useCallback(() => {
    setAlertList([
      {
        message: t("The uploaded file is empty or invalid"),
        type: "error",
        closable: true,
        showIcon: true,
      },
    ]);
  }, [setAlertList, t]);

  const raiseSingleFileAlert = useCallback(() => {
    setAlertList([
      {
        message: t("Only one file can be uploaded at a time"),
        type: "error",
        closable: true,
        showIcon: true,
      },
    ]);
  }, [setAlertList, t]);

  const raiseIllegalFileFormatAlert = useCallback(() => {
    setAlertList([
      {
        message: t("File format is not supported"),
        type: "error",
        closable: true,
        showIcon: true,
      },
    ]);
  }, [setAlertList, t]);

  const schemaValidationAlert = useCallback(
    (errorMeta: ErrorMeta) => {
      // const partialAlertProps: Pick<AlertProps, "type" | "closable" | "showIcon"> = {
      //   type: "error",
      //   closable: true,
      //   showIcon: true,
      // };

      setAlertList([]);

      // console.log("errorMeta", errorMeta);

      if (errorMeta.exceedLimit) {
        // case: above limit + some mismatch (exceedLimit = true, mismatchFields.size > 0)
        if (errorMeta.mismatchFields.size > 0) {
          setValidateImportResult({
            type: "error",
            title: t("Data file is too large and some fields don't match the schema."),
            description: t(
              "The data file can contain a maximum of {{max}} records. Please split the file and re-upload it. And {{count}} fields do not match the schema.",
              { max: Constant.IMPORT.MAX_CONTENT_RECORDS, count: errorMeta.mismatchFields.size },
            ),
            hint: t("Unmatched field hint", {
              count: errorMeta.mismatchFields.size,
              fields: Array.from(errorMeta.mismatchFields),
            }),
          });
        }
        // case: above limit, full match (exceedLimit = true, mismatchFields.size = 0)
        else {
          setValidateImportResult({
            type: "error",
            title: t("Data file is too large."),
            description: t(
              "The data file can contain a maximum of {{max}} records. Please split the file and re-upload it",
              { max: Constant.IMPORT.MAX_CONTENT_RECORDS },
            ),
          });
        }
      } else {
        // case: below limit, some mismatch (exceedLimit = false, mismatchFields.size > 0)
        if (
          errorMeta.mismatchFields.size > 0 &&
          errorMeta.mismatchFields.size < errorMeta.modelFieldCount
        ) {
          console.log("errorMeta", errorMeta);
          setValidateImportResult({
            type: "warning",
            title: t("Some fields don't match the schema"),
            description: t(
              "{{count}} fields do not match the schema. You can continue the import, but the unmatched fields will be ignored.",
              { count: errorMeta.mismatchFields.size },
            ),
            hint: t("Unmatched field hint", {
              count: errorMeta.mismatchFields.size,
              fields: Array.from(errorMeta.mismatchFields),
            }),
            canForwardToImport: true,
          });
        }
        // case: below limit, no match (exceedLimit = false, mismatchFields.size = modelFieldCount)
        else {
          setValidateImportResult({
            type: "error",
            title: t("No matching fields found"),
            description: t(
              "The data file does not match the schema. None of the fields could be recognized. Please update the file or use a different schema to continue.",
            ),
          });
        }
      }
    },
    [setAlertList, setValidateImportResult, t],
  );

  const handleStartLoading = useCallback(() => onSetDataChecking(true), [onSetDataChecking]);
  const handleEndLoading = useCallback(() => onSetDataChecking(false), [onSetDataChecking]);

  const handleBeforeUpload = useCallback<Required<UploadProps>["beforeUpload"]>(
    async (file, fileList) => {
      setValidateImportResult(null);
      setAlertList([]);

      const extension = FileUtils.getExtension(file.name);

      if (!["geojson", "json", "csv"].includes(extension)) {
        raiseIllegalFileFormatAlert();
        return;
      }

      if (fileList.length > 1) {
        raiseSingleFileAlert();
        return;
      }

      if (file.size === 0) {
        raiseIllegalFileAlert();
        return;
      }

      try {
        handleStartLoading();
        const content = await FileUtils.parseTextFile(file);

        switch (extension) {
          case "json":
            {
              const jsonValidation = await ObjectUtils.safeJSONParse<ImportContentJSON>(content);
              if (!jsonValidation.isValid) {
                raiseIllegalFileAlert();
                return;
              }

              const jsonContentValidation = await ImportUtils.validateContentFromJSON(
                jsonValidation.data,
                modelFields,
              );

              if (!jsonContentValidation.isValid) {
                schemaValidationAlert(jsonContentValidation.error);
                return;
              }

              onFileContentChange({ fileContent: jsonContentValidation.data, extension });
            }
            break;

          case "geojson":
            {
              const geoJSONValidation = await ObjectUtils.validateGeoJson(content);
              if (!geoJSONValidation.isValid) {
                raiseIllegalFileAlert();
                return;
              }

              const geoJSONContentValidation = await ImportUtils.validateContentFromGeoJson(
                geoJSONValidation.data,
                modelFields,
              );

              if (!geoJSONContentValidation.isValid) {
                schemaValidationAlert(geoJSONContentValidation.error);
                return;
              }

              onFileContentChange({ fileContent: geoJSONContentValidation.data, extension });
            }
            break;

          case "csv":
            {
              const csvValidation = await ImportUtils.convertCSVToJSON(content);
              if (!csvValidation.isValid) {
                raiseIllegalFileAlert();
                return;
              }

              const csvContentValidation = await ImportUtils.validateContentFromCSV(
                csvValidation.data,
                modelFields,
              );

              if (!csvContentValidation.isValid) {
                schemaValidationAlert(csvContentValidation.error);
                return;
              }

              onFileContentChange({ fileContent: csvContentValidation.data, extension });
            }
            break;

          default:
        }
      } catch (error) {
        console.error(error);
      } finally {
        handleEndLoading();
      }

      return false;
    },
    [
      handleEndLoading,
      handleStartLoading,
      modelFields,
      onFileContentChange,
      raiseIllegalFileAlert,
      raiseIllegalFileFormatAlert,
      raiseSingleFileAlert,
      schemaValidationAlert,
      setAlertList,
      setValidateImportResult,
    ],
  );

  const uploadProps = useMemo<UploadProps>(
    () => ({
      name: "importContentFile",
      multiple: true,
      directory: false,
      showUploadList: false,
      listType: "picture",
      beforeUpload: handleBeforeUpload,
    }),
    [handleBeforeUpload],
  );

  const importErrorIcon = useMemo<string | undefined>(() => {
    switch (validateImportResult?.type) {
      case "error":
        return red.primary;
      case "warning":
        return gold.primary;
      default:
        return undefined;
    }
  }, [validateImportResult]);

  return (
    <Modal
      styles={{ body: { height: "70vh" } }}
      title={t("Import content")}
      open={isOpen}
      onCancel={onClose}
      footer={null}>
      {!validateImportResult ? (
        <>
          {dataChecking ? (
            <LoadingWrapper data-testId="LoadingWrapper">
              <Loading spinnerSize="large" />
              <p>{t("Checking the data file...")}</p>
            </LoadingWrapper>
          ) : (
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <Icon icon="inbox" />
              </p>
              <p className="ant-upload-text">{t("Click or drag files to this area to upload")}</p>
              <p className="ant-upload-hint">
                {t(
                  "Upload a data file in CSV, JSON, or GeoJSON formats. File must match the schema with field names and types. File can contain a maximum of {{max}} records.",
                  { max: Constant.IMPORT.MAX_CONTENT_RECORDS },
                )}
              </p>
              <p className="ant-upload-hint">
                <Trans
                  i18nKey="You can also download file templates: CSV | JSON | GeoJSON"
                  components={{
                    l1: (
                      <TemplateLink href={Constant.PUBLIC_FILE.IMPORT_CONTENT_CSV}>
                        CSV
                      </TemplateLink>
                    ),
                    l2: (
                      <TemplateLink href={Constant.PUBLIC_FILE.IMPORT_CONTENT_JSON}>
                        JSON
                      </TemplateLink>
                    ),
                    l3: (
                      <TemplateLink href={Constant.PUBLIC_FILE.IMPORT_CONTENT_GEO_JSON}>
                        GeoJSON
                      </TemplateLink>
                    ),
                  }}
                />
              </p>
              {alertList.map((alert, index) => (
                <Alert
                  {...alert}
                  key={alert?.message?.toString() || index}
                  onClick={e => e.stopPropagation()}
                />
              ))}
            </Dragger>
          )}
        </>
      ) : (
        <StyledFlex data-testId="errorWrapper" vertical justify="center" align="center">
          <Icon data-testId="errorIcon" icon="warningSolid" color={importErrorIcon} />
          <Typography.Title data-testId="errorTitle" level={4}>
            {validateImportResult.title}
          </Typography.Title>
          <Typography.Paragraph data-testId="errorDescription">
            {validateImportResult.description}
          </Typography.Paragraph>
          <Space>
            <Button
              type="default"
              onClick={() => {
                setAlertList([]);
                setValidateImportResult(null);
              }}>
              Go Back
            </Button>
            {validateImportResult.canForwardToImport && (
              <Button type="primary">Import Anyway</Button>
            )}
          </Space>
          {validateImportResult.hint && (
            <Typography.Paragraph type="secondary" data-testId="errorHint">
              {validateImportResult.hint}
            </Typography.Paragraph>
          )}
        </StyledFlex>
      )}
    </Modal>
  );
};

export default ContentImportModal;

const LoadingWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;

const StyledButton = styled(Button)`
  padding: 0;
  text-decoration: underline;
`;

const StyledFlex = styled(Flex)`
  height: 100%;
`;
