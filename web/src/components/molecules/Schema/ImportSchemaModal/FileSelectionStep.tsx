import styled from "@emotion/styled";
import { useCallback } from "react";

import Alert, { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Loading from "@reearth-cms/components/atoms/Loading";
import Upload, {
  UploadFile as RawUploadFile,
  UploadFile,
  UploadProps,
} from "@reearth-cms/components/atoms/Upload";
import { Trans, useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { FileUtils } from "@reearth-cms/utils/file";
import { ObjectUtils } from "@reearth-cms/utils/object";

const { Dragger } = Upload;

type Props = {
  fileList: RawUploadFile[];
  alertList?: AlertProps[];
  setFileList: (fileList: UploadFile<File>[]) => void;
  setAlertList: (alertList: AlertProps[]) => void;
  onFileContentChange: (fileContent: string) => void;
  dataChecking?: boolean;
};

const FileSelectionStep: React.FC<Props> = ({
  fileList,
  alertList = [],
  setFileList,
  setAlertList,
  onFileContentChange,
  dataChecking = false,
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

  const uploadProps: UploadProps = {
    name: "importSchemaFile",
    multiple: true,
    directory: false,
    showUploadList: false,
    listType: "picture",
    onRemove: () => {
      setFileList([]);
      setAlertList([]);
    },
    beforeUpload: (file, fileList) => {
      const extension = FileUtils.getExtension(file.name);

      if (!["geojson", "json"].includes(extension)) {
        raiseIllegalFileFormatAlert();
        return;
      }

      if (fileList.length > 1) {
        raiseSingleFileAlert();
        return;
      }

      setFileList([file]);

      if (file.size === 0) {
        raiseIllegalFileAlert();
        return;
      }

      FileUtils.parseTextFile(file, content => {
        if (content) {
          const jsonValidation = ObjectUtils.safeJSONParse(content);

          if (
            (jsonValidation.isValid && ObjectUtils.isEmpty(jsonValidation.data)) ||
            !jsonValidation.isValid
          ) {
            raiseIllegalFileAlert();
            return;
          }

          setAlertList([]);
          onFileContentChange(content);
        }
      });

      return false;
    },
    fileList,
  };

  return (
    <>
      {dataChecking ? (
        <LoadingWrapper data-testId="LoadingWrapper">
          <Loading spinnerSize="large" />
          <p>{t("Checking the data file...")}</p>
        </LoadingWrapper>
      ) : (
        <Dragger {...uploadProps} data-testId="ImportSchemaFileSelect">
          <p className="ant-upload-drag-icon">
            <Icon icon="inbox" />
          </p>
          <p className="ant-upload-text">
            <Trans
              i18nKey="Choose or drag & drop a file"
              components={{ l: <TemplateFileLink type="link">Choose</TemplateFileLink> }}
            />
          </p>
          <p className="ant-upload-hint">{t("Only JSON or GeoJSON format is supported")}</p>
          <p>
            <Trans
              i18nKey="You can also download file templates: JSON | GeoJSON"
              components={{
                l1: (
                  <TemplateFileLink
                    type="link"
                    href={Constant.PUBLIC_FILE.IMPORT_SCHEMA_JSON}
                    download>
                    JSON
                  </TemplateFileLink>
                ),
                l2: (
                  <TemplateFileLink
                    type="link"
                    href={Constant.PUBLIC_FILE.IMPORT_SCHEMA_GEO_JSON}
                    download>
                    GeoJSON
                  </TemplateFileLink>
                ),
              }}
            />
          </p>
          {alertList.map((alert, index) => (
            <StyledAlert
              {...alert}
              key={alert?.message?.toString() || index}
              onClick={e => e.stopPropagation()}
            />
          ))}
        </Dragger>
      )}
    </>
  );
};

export default FileSelectionStep;

const TemplateFileLink = styled(Button)`
  padding: 0;
  text-decoration: underline;
`;

const StyledAlert = styled(Alert)`
  margin: 0 auto;
  width: fit-content;
`;

const LoadingWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
`;
