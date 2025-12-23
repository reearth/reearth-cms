import { gold, red } from "@ant-design/colors";
import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";

import Alert, { type AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Flex from "@reearth-cms/components/atoms/Flex";
import Icon from "@reearth-cms/components/atoms/Icon";
import Loading from "@reearth-cms/components/atoms/Loading";
import Modal from "@reearth-cms/components/atoms/Modal";
import Space from "@reearth-cms/components/atoms/Space";
import Typography from "@reearth-cms/components/atoms/Typography";
import Upload, { RcFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { ValidateImportResult } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { Trans, useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { FileUtils } from "@reearth-cms/utils/file";
import {
  ImportContentUtils,
  ImportContentJSON,
  ValidationErrorMeta,
  ImportContentResultItem,
} from "@reearth-cms/utils/importContent";
import { ObjectUtils } from "@reearth-cms/utils/object";

const { Dragger } = Upload;

type Props = {
  isOpen: boolean;
  dataChecking: boolean;
  modelFields: Model["schema"]["fields"];
  onSetDataChecking: (isChecking: boolean) => void;
  onClose: () => void;
  onFileContentChange: (payload: {
    fileName: string;
    fileContent: ImportContentJSON["results"];
    extension: "csv" | "json" | "geojson";
    url: string;
    raw: RcFile;
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
  const location = useLocation();

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
    (errorMeta: ValidationErrorMeta) => {
      // const partialAlertProps: Pick<AlertProps, "type" | "closable" | "showIcon"> = {
      //   type: "error",
      //   closable: true,
      //   showIcon: true,
      // };

      setAlertList([]);

      console.log("errorMeta", errorMeta);

      if (errorMeta.exceedLimit) {
        // case: above limit + some mismatch (exceedLimit = true, mismatchFields.size > 0)
        if (errorMeta.typeMismatchFieldKeys.size > 0) {
          setValidateImportResult({
            type: "error",
            title: t("Data file is too large and some fields don't match the schema."),
            description: t(
              "The data file can contain a maximum of {{max}} records. Please split the file and re-upload it. And {{count}} fields do not match the schema.",
              {
                max: Constant.IMPORT.MAX_CONTENT_RECORDS,
                count: errorMeta.typeMismatchFieldKeys.size,
              },
            ),
            hint: t("Unmatched field hint", {
              count: errorMeta.typeMismatchFieldKeys.size,
              fields: Array.from(errorMeta.typeMismatchFieldKeys),
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
        if (errorMeta.typeMismatchFieldKeys.size > 0) {
          console.log("errorMeta", errorMeta);
          setValidateImportResult({
            type: "warning",
            title: t("Some fields don't match the schema"),
            description: t(
              "{{count}} fields do not match the schema. You can continue the import, but the unmatched fields will be ignored.",
              { count: errorMeta.typeMismatchFieldKeys.size },
            ),
            hint: t("Unmatched field hint", {
              count: errorMeta.typeMismatchFieldKeys.size,
              fields: Array.from(errorMeta.typeMismatchFieldKeys),
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

      const fileName = file.name;
      const extension = FileUtils.getExtension(fileName);

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
          case "json": {
            const jsonValidation = await ObjectUtils.safeJSONParse<ImportContentJSON>(content);
            if (!jsonValidation.isValid) {
              raiseIllegalFileAlert();
              return;
            }

            const jsonContentValidation = await ImportContentUtils.validateContent(
              jsonValidation.data.results,
              modelFields,
              "JSON",
            );

            if (!jsonContentValidation.isValid) {
              schemaValidationAlert(jsonContentValidation.error);
              return;
            }

            onFileContentChange({
              fileContent: jsonContentValidation.data,
              extension,
              fileName,
              url: location.pathname,
              raw: file,
            });
            break;
          }

          case "geojson": {
            const geoJSONValidation = await ObjectUtils.validateGeoJson(content);
            if (!geoJSONValidation.isValid) {
              raiseIllegalFileAlert();
              return;
            }

            const jsonValidation = await ImportContentUtils.convertGeoJSONToJSON(
              geoJSONValidation.data,
            );

            if (!jsonValidation.isValid) {
              raiseIllegalFileAlert();
              return;
            }

            const geoJSONContentValidation = await ImportContentUtils.validateContent(
              jsonValidation.data,
              modelFields,
              "GEOJSON",
            );

            if (!geoJSONContentValidation.isValid) {
              schemaValidationAlert(geoJSONContentValidation.error);
              return;
            }

            onFileContentChange({
              fileContent: geoJSONContentValidation.data,
              extension,
              fileName,
              url: location.pathname,
              raw: file,
            });
            break;
          }

          case "csv": {
            const csvValidation =
              await ImportContentUtils.convertCSVToJSON<ImportContentResultItem>(content);
            if (!csvValidation.isValid) {
              raiseIllegalFileAlert();
              return;
            }

            const csvContentValidation = await ImportContentUtils.validateContent(
              csvValidation.data,
              modelFields,
              "CSV",
            );

            if (!csvContentValidation.isValid) {
              schemaValidationAlert(csvContentValidation.error);
              return;
            }

            onFileContentChange({
              fileContent: csvContentValidation.data,
              extension,
              fileName,
              url: location.pathname,
              raw: file,
            });
            break;
          }

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
      location.pathname,
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
      maskClosable={false}
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
