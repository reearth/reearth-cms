import styled from "@emotion/styled";

import Alert, { AlertProps } from "@reearth-cms/components/atoms/Alert";
import Button, { ButtonProps } from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Loading from "@reearth-cms/components/atoms/Loading";
import Upload, {
  UploadFile as RawUploadFile,
  UploadProps,
} from "@reearth-cms/components/atoms/Upload";
import { Trans, useT } from "@reearth-cms/i18n";
import { Constant } from "@reearth-cms/utils/constant";
import { DATA_TEST_ID } from "@reearth-cms/utils/test";

const { Dragger } = Upload;

type Props = {
  fileList: RawUploadFile[];
  alertList?: AlertProps[];
  onFileContentChange: UploadProps["beforeUpload"];
  onFileRemove: UploadProps["onRemove"];
  dataChecking?: boolean;
};

const TemplateLink = ({ href, children }: ButtonProps) => (
  <StyledButton onClick={event => event.stopPropagation()} type="link" href={href} download>
    {children}
  </StyledButton>
);

const FileSelectionStep: React.FC<Props> = ({
  fileList,
  alertList = [],
  onFileContentChange,
  onFileRemove,
  dataChecking = false,
}) => {
  const t = useT();

  const uploadProps: UploadProps = {
    name: "importSchemaFile",
    multiple: true,
    directory: false,
    showUploadList: false,
    listType: "picture",
    onRemove: onFileRemove,
    beforeUpload: onFileContentChange,
    fileList,
  };

  return (
    <>
      {dataChecking ? (
        <LoadingWrapper data-testid={DATA_TEST_ID.FileSelectionStep__FileSelectLoadingWrapper}>
          <Loading spinnerSize="large" />
          <p>{t("Checking the data file...")}</p>
        </LoadingWrapper>
      ) : (
        <Dragger {...uploadProps} data-testid={DATA_TEST_ID.FileSelectionStep__FileSelect}>
          <p className="ant-upload-drag-icon">
            <Icon icon="inbox" />
          </p>
          <p className="ant-upload-text">
            <Trans
              i18nKey="Choose or drag & drop a file"
              components={{ l: <StyledButton type="link">Choose</StyledButton> }}
            />
          </p>
          <p className="ant-upload-hint">{t("Only JSON format is supported")}</p>
          <p>
            <Trans
              i18nKey="You can also download file templates: JSON"
              components={{
                l1: (
                  <TemplateLink href={Constant.PUBLIC_FILE.IMPORT_SCHEMA_JSON}>JSON</TemplateLink>
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

const StyledButton = styled(Button)`
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
