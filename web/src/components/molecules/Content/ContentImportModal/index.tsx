import styled from "@emotion/styled";
import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

import Alert, { type AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Flex from "@reearth-cms/components/atoms/Flex";
import Icon from "@reearth-cms/components/atoms/Icon";
import Loading from "@reearth-cms/components/atoms/Loading";
import Modal from "@reearth-cms/components/atoms/Modal";
import Table, { TableColumnsType } from "@reearth-cms/components/atoms/Table";
import Upload, { RcFile, UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Model } from "@reearth-cms/components/molecules/Model/types";
import { UploaderHookState } from "@reearth-cms/components/molecules/Uploader/provider";
import { ImportValidationResult } from "@reearth-cms/components/organisms/Project/Content/ContentList/hooks";
import { Trans, useT } from "@reearth-cms/i18n";
import { DATA_TEST_ID } from "@reearth-cms/test/utils";
import { Constant } from "@reearth-cms/utils/constant";
import { FileUtils } from "@reearth-cms/utils/file";
import {
  ImportContentItem,
  ImportContentUtils,
  ValidationErrorMeta,
} from "@reearth-cms/utils/importContent";
import {
  ErrorLogEntry,
  ErrorLogMeta,
  ImportErrorLogUtils,
} from "@reearth-cms/utils/importErrorLog";
import { ObjectUtils } from "@reearth-cms/utils/object";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

const { Dragger } = Upload;

type Props = {
  isOpen: boolean;
  dataChecking: boolean;
  modelFields: Model["schema"]["fields"];
  workspaceId: string | undefined;
  projectId: string | undefined;
  modelId: string | undefined;
  onSetDataChecking: (isChecking: boolean) => void;
  onClose: () => void;
  onEnqueueJob: UploaderHookState["handleEnqueueJob"];
  alertList: AlertProps[];
  setAlertList: Dispatch<SetStateAction<AlertProps[]>>;
  importValidationResult: ImportValidationResult | null;
  setImportValidationResult: Dispatch<SetStateAction<ImportValidationResult | null>>;
};

const TemplateLink = ({ href, children }: ButtonProps) => (
  <StyledLink onClick={event => event.stopPropagation()} type="link" href={href} download>
    {children}
  </StyledLink>
);

const ContentImportModal: React.FC<Props> = ({
  isOpen,
  dataChecking,
  modelFields,
  workspaceId,
  projectId,
  modelId,
  onSetDataChecking,
  onClose,
  onEnqueueJob,
  alertList,
  setAlertList,
  importValidationResult,
  setImportValidationResult,
}) => {
  const t = useT();
  const location = useLocation();
  const pendingImportRef = useRef<{
    file: RcFile;
    fileName: string;
    extension: "json" | "csv" | "geojson";
  } | null>(null);

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

  const raiseTooLargeFileSizeAlert = useCallback(() => {
    setAlertList([
      {
        message: t("File size exceeds the {{maxSizeInMB}} MB limit.", {
          maxSizeInMB: Constant.IMPORT.MAX_FILE_SIZE_IN_MB,
        }),
        type: "error",
        closable: true,
        showIcon: true,
      },
    ]);
  }, [setAlertList, t]);

  const raiseExceedRecordLimitAlert = useCallback(() => {
    setAlertList([
      {
        message: t("File content contains over {{maxRecord}} records.", {
          maxRecord: Constant.IMPORT.MAX_CONTENT_RECORDS,
        }),
        type: "error",
        closable: true,
        showIcon: true,
      },
    ]);
  }, [setAlertList, t]);

  const schemaValidationAlert = useCallback(
    (errorMeta: ValidationErrorMeta, fileName: string) => {
      setAlertList([]);

      const errorLogMeta = ImportErrorLogUtils.buildErrorLogMeta(errorMeta, fileName);
      const canForwardToImport =
        !errorMeta.exceedLimit &&
        errorMeta.typeMismatchFieldKeys.size > 0 &&
        errorMeta.typeMismatchFieldKeys.size !== modelFields.length;

      setImportValidationResult({ canForwardToImport, errorLogMeta });
    },
    [modelFields.length, setAlertList, setImportValidationResult],
  );

  const handleStartLoading = useCallback(() => onSetDataChecking(true), [onSetDataChecking]);
  const handleEndLoading = useCallback(() => onSetDataChecking(false), [onSetDataChecking]);

  const handleEnqueueJob = useCallback(
    (extension: "json" | "csv" | "geojson", file: RcFile, fileName: string) => {
      if (!workspaceId) throw Error("No workspace id");
      if (!projectId) throw Error("No project id");
      if (!modelId) throw Error("No model id!");

      onEnqueueJob({
        workspaceId,
        projectId,
        modelId,
        extension,
        fileName,
        url: location.pathname,
        file,
      });
      onClose();
    },
    [workspaceId, projectId, modelId, onEnqueueJob, location.pathname, onClose],
  );

  const handleBeforeUpload = useCallback<Required<UploadProps>["beforeUpload"]>(
    async (file, fileList) => {
      setImportValidationResult(null);
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

        switch (extension) {
          case "json": {
            const jsonValidation = await ObjectUtils.safeJSONParse<ImportContentItem[]>(content);

            if (!jsonValidation.isValid) {
              raiseIllegalFileAlert();
              return;
            }

            if (jsonValidation.data.length > Constant.IMPORT.MAX_CONTENT_RECORDS) {
              raiseExceedRecordLimitAlert();
              return;
            }

            const jsonContentValidation = await ImportContentUtils.validateContent(
              jsonValidation.data,
              modelFields,
              "JSON",
            );

            if (!jsonContentValidation.isValid) {
              pendingImportRef.current = { file, fileName, extension };
              schemaValidationAlert(jsonContentValidation.error, fileName);
              return;
            }

            handleEnqueueJob(extension, file, fileName);
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

            if (jsonValidation.data.length > Constant.IMPORT.MAX_CONTENT_RECORDS) {
              raiseExceedRecordLimitAlert();
              return;
            }

            const geoJSONContentValidation = await ImportContentUtils.validateContent(
              jsonValidation.data,
              modelFields,
              "GEOJSON",
            );

            if (!geoJSONContentValidation.isValid) {
              pendingImportRef.current = { file, fileName, extension };
              schemaValidationAlert(geoJSONContentValidation.error, fileName);
              return;
            }

            handleEnqueueJob(extension, file, fileName);
            break;
          }

          case "csv": {
            const csvValidation =
              await ImportContentUtils.convertCSVToJSON<ImportContentItem>(content);
            if (!csvValidation.isValid) {
              raiseIllegalFileAlert();
              return;
            }

            if (csvValidation.data.length > Constant.IMPORT.MAX_CONTENT_RECORDS) {
              raiseExceedRecordLimitAlert();
              return;
            }

            const csvContentValidation = await ImportContentUtils.validateContent(
              csvValidation.data,
              modelFields,
              "CSV",
            );

            if (!csvContentValidation.isValid) {
              pendingImportRef.current = { file, fileName, extension };
              schemaValidationAlert(csvContentValidation.error, fileName);
              return;
            }

            handleEnqueueJob(extension, file, fileName);
            break;
          }

          default:
        }
      } catch (error) {
        console.error(error);
        setAlertList([
          {
            message: t("An unexpected error occurred while processing the file. Please try again."),
            type: "error",
            closable: true,
            showIcon: true,
          },
        ]);
      } finally {
        handleEndLoading();
      }

      return false;
    },
    [
      setImportValidationResult,
      setAlertList,
      raiseIllegalFileFormatAlert,
      raiseSingleFileAlert,
      raiseIllegalFileAlert,
      raiseTooLargeFileSizeAlert,
      handleStartLoading,
      handleEnqueueJob,
      modelFields,
      raiseExceedRecordLimitAlert,
      schemaValidationAlert,
      t,
      handleEndLoading,
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
      "data-testid": DATA_TEST_ID.ContentImportModal__FileSelect,
    }),
    [handleBeforeUpload],
  );

  const errorLogColumns = useMemo<TableColumnsType<ErrorLogEntry>>(
    () => [
      {
        title: t("Location"),
        dataIndex: "path",
        key: "path",
        render: (path: string[]) => ImportErrorLogUtils.formatPath(path, "content"),
      },
      { title: t("Detail"), dataIndex: "detail", key: "detail" },
    ],
    [t],
  );

  const handleGoBack = useCallback(() => {
    pendingImportRef.current = null;
    setAlertList([]);
    setImportValidationResult(null);
  }, [setAlertList, setImportValidationResult]);

  const errorLogMeta = useMemo<ErrorLogMeta | null>(
    () => importValidationResult?.errorLogMeta || null,
    [importValidationResult?.errorLogMeta],
  );

  const modalFooter = useMemo<JSX.Element | null>(() => {
    if (!importValidationResult) return null;
    return (
      <Flex justify="space-between">
        {errorLogMeta && (
          <FooterActionButton
            icon={<Icon icon="download" />}
            type="text"
            onClick={() => ImportErrorLogUtils.downloadErrorLog(errorLogMeta)}>
            {t("Download error log")}
          </FooterActionButton>
        )}
        <FooterActionButton type="default" onClick={handleGoBack}>
          {t("go back")}
        </FooterActionButton>
      </Flex>
    );
  }, [importValidationResult, errorLogMeta, t, handleGoBack]);

  return (
    <Modal
      title={t("Import content")}
      open={isOpen}
      onCancel={onClose}
      maskClosable={false}
      footer={modalFooter}
      centered
      width="50vw"
      styles={{
        body: { height: "70vh" },
      }}>
      {!importValidationResult ? (
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
                  "Upload a data file in CSV, JSON, or GeoJSON format. The file must match the required schema, including correct field names and data types. It may contain up to {{maxRecord}} records and must not exceed {{maxSizeInMB}} MB in size.",
                  {
                    maxRecord: Constant.IMPORT.MAX_CONTENT_RECORDS,
                    maxSizeInMB: Constant.IMPORT.MAX_FILE_SIZE_IN_MB,
                  },
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
        <ErrorLogWrapper data-testid={DATA_TEST_ID.ContentImportModal__ErrorWrapper}>
          <Alert
            type="error"
            message={<AlertMessage>{t("Validation errors")}</AlertMessage>}
            description={
              <AlertDescription>
                {t("Download the full error log to see all errors")}
              </AlertDescription>
            }
            showIcon
            icon={
              <Icon
                icon="warningSolid"
                color={AntdColor.RED.RED_5}
                size={AntdToken.LINE_HEIGHT.BASE}
              />
            }
            action={
              errorLogMeta && (
                <ErrorCountBadge>
                  {t("{{count}} errors", { count: errorLogMeta.totalErrors })}
                </ErrorCountBadge>
              )
            }
          />
          {errorLogMeta && errorLogMeta.entries.length > 0 && (
            <Table<ErrorLogEntry>
              dataSource={errorLogMeta.entries}
              columns={errorLogColumns}
              pagination={false}
              scroll={{ y: "calc(70vh - 200px)" }}
              size="small"
              rowKey={(_, index) => index ?? 0}
            />
          )}
        </ErrorLogWrapper>
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
  gap: ${AntdToken.SPACING.LG}px;
`;

const StyledLink = styled(Button)`
  padding: 0;
  text-decoration: underline;
`;

const ErrorLogWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.MD}px;
`;

const FooterActionButton = styled(Button)`
  text-transform: capitalize;
`;

const ErrorCountBadge = styled.span`
  background: ${AntdColor.RED.RED_5};
  color: #fff;
  border-radius: ${AntdToken.SPACING.MD}px;
  padding: ${AntdToken.SPACING.XXS}px ${AntdToken.SPACING.SM}px;
  font-size: ${AntdToken.FONT.SIZE_SM}px;
  white-space: nowrap;
  font-weight: ${AntdToken.FONT_WEIGHT.BOLD};
`;

const AlertMessage = styled.span`
  font-weight: ${AntdToken.FONT_WEIGHT.MEDIUM};
`;

const AlertDescription = styled.span`
  color: ${AntdColor.NEUTRAL.TEXT_TERTIARY};
`;
