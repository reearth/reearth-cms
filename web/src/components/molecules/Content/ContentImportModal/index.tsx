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
import Upload, { UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { UploaderHookState } from "@reearth-cms/components/molecules/Uploader/provider";
import { ValidateImportResult } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { Trans, useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { Constant } from "@reearth-cms/utils/constant";
import { FileUtils } from "@reearth-cms/utils/file";
import {
  ImportContentItem,
  ImportContentUtils,
  ValidationErrorMeta,
} from "@reearth-cms/utils/importContent";
import { ObjectUtils } from "@reearth-cms/utils/object";

const { Dragger } = Upload;

type Props = {
  alertList: AlertProps[];
  dataChecking: boolean;
  isOpen: boolean;
  modelFields: Model["schema"]["fields"];
  modelId: string | undefined;
  onClose: () => void;
  onEnqueueJob: UploaderHookState["handleEnqueueJob"];
  onSetDataChecking: (isChecking: boolean) => void;
  projectId: string | undefined;
  setAlertList: Dispatch<SetStateAction<AlertProps[]>>;
  setValidateImportResult: Dispatch<SetStateAction<null | ValidateImportResult>>;
  validateImportResult: null | ValidateImportResult;
  workspaceId: string | undefined;
};

const TemplateLink = ({ children, href }: ButtonProps) => (
  <StyledLink download href={href} onClick={event => event.stopPropagation()} type="link">
    {children}
  </StyledLink>
);

const ContentImportModal: React.FC<Props> = ({
  alertList,
  dataChecking,
  isOpen,
  modelFields,
  modelId,
  onClose,
  onEnqueueJob,
  onSetDataChecking,
  projectId,
  setAlertList,
  setValidateImportResult,
  validateImportResult,
  workspaceId,
}) => {
  const t = useT();
  const location = useLocation();

  const raiseIllegalFileAlert = useCallback(() => {
    setAlertList([
      {
        closable: true,
        message: t("The uploaded file is empty or invalid"),
        showIcon: true,
        type: "error",
      },
    ]);
  }, [setAlertList, t]);

  const raiseSingleFileAlert = useCallback(() => {
    setAlertList([
      {
        closable: true,
        message: t("Only one file can be uploaded at a time"),
        showIcon: true,
        type: "error",
      },
    ]);
  }, [setAlertList, t]);

  const raiseIllegalFileFormatAlert = useCallback(() => {
    setAlertList([
      {
        closable: true,
        message: t("File format is not supported"),
        showIcon: true,
        type: "error",
      },
    ]);
  }, [setAlertList, t]);

  const raiseTooLargeFileSizeAlert = useCallback(() => {
    setAlertList([
      {
        closable: true,
        message: t("File size should below {{maxSizeInMB}} MB.", {
          maxSizeInMB: Constant.IMPORT.MAX_FILE_SIZE_IN_MB,
        }),
        showIcon: true,
        type: "error",
      },
    ]);
  }, [setAlertList, t]);

  const schemaValidationAlert = useCallback(
    (errorMeta: ValidationErrorMeta) => {
      setAlertList([]);

      if (errorMeta.exceedLimit) {
        // case: above limit + some mismatch (exceedLimit = true, mismatchFields.size > 0)
        if (errorMeta.typeMismatchFieldKeys.size > 0) {
          setValidateImportResult({
            description: t(
              "The data file can contain a maximum of {{maxRecord}} records and below {{maxSize}} MB. Please split the file and re-upload it. And {{count}} fields do not match the schema.",
              {
                count: errorMeta.typeMismatchFieldKeys.size,
                maxRecords: Constant.IMPORT.MAX_CONTENT_RECORDS,
                maxSize: Constant.IMPORT.MAX_FILE_SIZE_IN_MB,
              },
            ),
            hint: t("Unmatched field hint", {
              count: errorMeta.typeMismatchFieldKeys.size,
              fields: Array.from(errorMeta.typeMismatchFieldKeys),
            }),
            title: t("Data file is too large and some fields don't match the schema."),
            type: "error",
          });
        }
        // case: above limit, full match (exceedLimit = true, mismatchFields.size = 0)
        else {
          setValidateImportResult({
            description: t(
              "The data file can contain a maximum of {{maxRecord}} records and below {{maxSize}} MB. Please split the file and re-upload it",
              {
                maxRecords: Constant.IMPORT.MAX_CONTENT_RECORDS,
                maxSize: Constant.IMPORT.MAX_FILE_SIZE_IN_MB,
              },
            ),
            title: t("Data file is too large."),
            type: "error",
          });
        }
      } else {
        // case: below limit, some mismatch (exceedLimit = false, mismatchFields.size > 0)
        if (
          errorMeta.typeMismatchFieldKeys.size > 0 &&
          errorMeta.typeMismatchFieldKeys.size !== modelFields.length
        ) {
          setValidateImportResult({
            canForwardToImport: true,
            description: t(
              "{{count}} fields do not match the schema. You can continue the import, but the unmatched fields will be ignored.",
              { count: errorMeta.typeMismatchFieldKeys.size },
            ),
            hint: t("Unmatched field hint", {
              count: errorMeta.typeMismatchFieldKeys.size,
              fields: Array.from(errorMeta.typeMismatchFieldKeys),
            }),
            title: t("Some fields don't match the schema"),
            type: "warning",
          });
        }
        // case: below limit, no match (exceedLimit = false, mismatchFields.size = modelFieldCount)
        else {
          setValidateImportResult({
            description: t(
              "The data file does not match the schema. None of the fields could be recognized. Please update the file or use a different schema to continue.",
            ),
            title: t("No matching fields found"),
            type: "error",
          });
        }
      }
    },
    [modelFields.length, setAlertList, setValidateImportResult, t],
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

      if (file.size > FileUtils.MBtoBytes(Constant.IMPORT.MAX_FILE_SIZE_IN_MB)) {
        raiseTooLargeFileSizeAlert();
        return;
      }

      try {
        handleStartLoading();
        const content = await FileUtils.parseTextFile(file);

        const handleEnqueueJob = (extension: "csv" | "geojson" | "json") => {
          if (!workspaceId) throw Error("No workspace id");
          if (!projectId) throw Error("No project id");
          if (!modelId) throw Error("No model id!");

          onEnqueueJob({
            extension,
            file,
            fileName,
            modelId,
            projectId,
            url: location.pathname,
            workspaceId,
          });
          onClose();
        };

        switch (extension) {
          case "json": {
            const jsonValidation = await ObjectUtils.safeJSONParse<ImportContentItem[]>(content);
            if (!jsonValidation.isValid) {
              raiseIllegalFileAlert();
              return;
            }

            const jsonContentValidation = await ImportContentUtils.validateContent(
              jsonValidation.data,
              modelFields,
              "JSON",
            );

            if (!jsonContentValidation.isValid) {
              schemaValidationAlert(jsonContentValidation.error);
              return;
            }

            handleEnqueueJob(extension);
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

            handleEnqueueJob(extension);
            break;
          }

          case "csv": {
            const csvValidation =
              await ImportContentUtils.convertCSVToJSON<ImportContentItem>(content);
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

            handleEnqueueJob(extension);
            break;
          }

          default:
        }
      } catch (error) {
        console.error(error);
        setAlertList([
          {
            closable: true,
            message: t("An unexpected error occurred while processing the file. Please try again."),
            showIcon: true,
            type: "error",
          },
        ]);
      } finally {
        handleEndLoading();
      }

      return false;
    },
    [
      setValidateImportResult,
      setAlertList,
      raiseIllegalFileFormatAlert,
      raiseSingleFileAlert,
      raiseIllegalFileAlert,
      raiseTooLargeFileSizeAlert,
      handleStartLoading,
      workspaceId,
      projectId,
      modelId,
      onEnqueueJob,
      location.pathname,
      onClose,
      modelFields,
      schemaValidationAlert,
      handleEndLoading,
      t,
    ],
  );

  const uploadProps = useMemo<UploadProps>(
    () => ({
      beforeUpload: handleBeforeUpload,
      "data-testid": DATA_TEST_ID.ContentImportModal__FileSelect,
      directory: false,
      listType: "picture",
      multiple: true,
      name: "importContentFile",
      showUploadList: false,
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
      footer={null}
      maskClosable={false}
      onCancel={onClose}
      open={isOpen}
      styles={{ body: { height: "70vh" } }}
      title={t("Import content")}>
      {!validateImportResult ? (
        <>
          {dataChecking ? (
            <LoadingWrapper data-testid={DATA_TEST_ID.ContentImportModal__LoadingWrapper}>
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
                  i18nKey="You can also download file templates: CSV | JSON | GeoJSON"
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
        <StyledFlex
          align="center"
          data-testid={DATA_TEST_ID.ContentImportModal__ErrorWrapper}
          justify="center"
          vertical>
          <Icon
            color={importErrorIcon}
            data-testid={DATA_TEST_ID.ContentImportModal__ErrorIcon}
            icon="warningSolid"
          />
          <Typography.Title data-testid={DATA_TEST_ID.ContentImportModal__ErrorTitle} level={4}>
            {validateImportResult.title}
          </Typography.Title>
          <Typography.Paragraph data-testid={DATA_TEST_ID.ContentImportModal__ErrorDescription}>
            {validateImportResult.description}
          </Typography.Paragraph>
          <Space>
            <StyledActionButton
              onClick={() => {
                setAlertList([]);
                setValidateImportResult(null);
              }}
              type="default">
              {t("go back")}
            </StyledActionButton>
            {validateImportResult.canForwardToImport && (
              <StyledActionButton type="primary">{t("import anyway")}</StyledActionButton>
            )}
          </Space>
          {validateImportResult.hint && (
            <Typography.Paragraph
              data-testid={DATA_TEST_ID.ContentImportModal__ErrorHint}
              type="secondary">
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

const StyledLink = styled(Button)`
  padding: 0;
  text-decoration: underline;
`;

const StyledActionButton = styled(Button)`
  text-transform: capitalize;
`;

const StyledFlex = styled(Flex)`
  height: 100%;
`;
