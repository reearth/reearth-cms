import styled from "@emotion/styled";
import { GeoJSON } from "geojson";
import { Dispatch, SetStateAction, useCallback, useMemo, useState } from "react";

import Alert, { type AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Loading from "@reearth-cms/components/atoms/Loading";
import Modal from "@reearth-cms/components/atoms/Modal";
import Upload, { UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Model } from "@reearth-cms/components/molecules/Model/types";
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
      const partialAlertProps: Pick<AlertProps, "type" | "closable" | "showIcon"> = {
        type: "error",
        closable: true,
        showIcon: true,
      };

      const newAlertList: AlertProps[] = [];

      console.log("errorMeta", errorMeta);

      if (errorMeta.exceedLimit)
        newAlertList.push({
          ...partialAlertProps,
          message: "too larrrrrge!",
        });

      if (errorMeta.mismatchFields.size > 0)
        newAlertList.push({
          ...partialAlertProps,
          message: `fields mismatch: ${Array.from(errorMeta.mismatchFields).join(", ")}`,
        });

      setAlertList(newAlertList);
    },
    [setAlertList, t],
  );

  const handleStartLoading = useCallback(() => onSetDataChecking(true), [onSetDataChecking]);
  const handleEndLoading = useCallback(() => onSetDataChecking(false), [onSetDataChecking]);

  const handleBeforeUpload = useCallback<Required<UploadProps>["beforeUpload"]>(
    async (file, fileList) => {
      setAlertList([]);

      const extension = FileUtils.getExtension(file.name);

      if (!["geojson", "json", "csv"].includes(extension))
        return void raiseIllegalFileFormatAlert();

      if (fileList.length > 1) return void raiseSingleFileAlert();

      if (file.size === 0) return void raiseIllegalFileAlert();

      try {
        handleStartLoading();
        const content = await FileUtils.parseTextFile(file);

        switch (extension) {
          case "json":
            {
              const jsonValidation = await ObjectUtils.safeJSONParse<ImportContentJSON>(content);
              if (!jsonValidation.isValid) return void raiseIllegalFileAlert();

              const jsonContentValidation = await ImportUtils.validateContentFromJSON(
                jsonValidation.data,
                modelFields,
              );

              if (!jsonContentValidation.isValid) {
                return void schemaValidationAlert(jsonContentValidation.error);
              }

              onFileContentChange({ fileContent: jsonContentValidation.data, extension });
            }
            break;

          case "geojson":
            {
              const geoJSONValidation = await ObjectUtils.validateGeoJson(content);
              if (!geoJSONValidation.isValid) return void raiseIllegalFileAlert();

              const geoJSONContentValidation = await ImportUtils.validateContentFromGeoJson(
                geoJSONValidation.data,
                modelFields,
              );

              if (!geoJSONContentValidation.isValid)
                return void schemaValidationAlert(geoJSONContentValidation.error);

              onFileContentChange({ fileContent: geoJSONContentValidation.data, extension });
            }
            break;

          case "csv":
            {
              const csvValidation = await ImportUtils.convertCSVToJSON(content);
              if (!csvValidation.isValid) return void raiseIllegalFileAlert();

              const csvContentValidation = await ImportUtils.validateContentFromCSV(
                csvValidation.data,
                modelFields,
              );

              if (!csvContentValidation.isValid)
                return void schemaValidationAlert(csvContentValidation.error);
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
      raiseIllegalFileAlert,
      raiseIllegalFileFormatAlert,
      raiseSingleFileAlert,
    ],
  );

  const uploadProps: UploadProps = useMemo(
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

  return (
    <Modal
      styles={{ body: { height: "70vh" } }}
      title={t("Import content")}
      open={isOpen}
      onCancel={onClose}
      footer={null}>
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
              "Upload a data file in CSV, JSON, or GeoJSON formats. File must match the schema with field names and types. File can contain a maximum of {{count}} records.",
              { count: Constant.IMPORT.MAX_CONTENT_RECORDS },
            )}
          </p>
          <p className="ant-upload-hint">
            <Trans
              i18nKey="You can also download file templates: CSV | JSON | GeoJSON"
              components={{
                l1: <TemplateLink href={Constant.PUBLIC_FILE.IMPORT_CONTENT_CSV}>CSV</TemplateLink>,
                l2: (
                  <TemplateLink href={Constant.PUBLIC_FILE.IMPORT_CONTENT_JSON}>JSON</TemplateLink>
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
