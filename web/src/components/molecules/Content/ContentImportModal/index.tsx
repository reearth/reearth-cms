import styled from "@emotion/styled";
import { useCallback, useState } from "react";

import Alert, { type AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Loading from "@reearth-cms/components/atoms/Loading";
import Modal from "@reearth-cms/components/atoms/Modal";
import Upload, { UploadProps } from "@reearth-cms/components/atoms/Upload";
import { Trans, useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { FileUtils } from "@reearth-cms/utils/file";
import { ObjectUtils } from "@reearth-cms/utils/object";

const { Dragger } = Upload;

type Props = {
  isOpen: boolean;
  dataChecking: boolean;
  onClose: () => void;
  onFileContentChange: (fileContent: string) => void;
};

const TemplateLink = ({ href, children }: ButtonProps) => (
  <StyledButton onClick={event => event.stopPropagation()} type="link" href={href} download>
    {children}
  </StyledButton>
);

const ContentImportModal: React.FC<Props> = ({
  isOpen,
  dataChecking,
  onClose,
  onFileContentChange,
}) => {
  const t = useT();
  const [alertList, setAlertList] = useState<AlertProps[]>([]);

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
    name: "importContentFile",
    multiple: true,
    directory: false,
    showUploadList: false,
    listType: "picture",
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
  };

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
