import styled from "@emotion/styled";
import { useCallback, useMemo, useState } from "react";
import ReactDragListView from "react-drag-listview";
import { Link } from "react-router-dom";

import Button from "@reearth-cms/components/atoms/Button";
import Col from "@reearth-cms/components/atoms/Col";
import Icon from "@reearth-cms/components/atoms/Icon";
import List from "@reearth-cms/components/atoms/List";
import Modal from "@reearth-cms/components/atoms/Modal";
import Progress from "@reearth-cms/components/atoms/Progress";
import Row from "@reearth-cms/components/atoms/Row";
import Select from "@reearth-cms/components/atoms/Select";
import Steps from "@reearth-cms/components/atoms/Step";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import { Trans, useT } from "@reearth-cms/i18n";

import { fieldTypes } from "./fieldTypes";
import useHooks from "./hooks";
import SelectSchemaFileModal from "./selectSchemaFileModal";
import { Field, FieldType } from "./types";

type Props = {
  visible: boolean;
  selectFileModalVisible: boolean;
  currentPage: number;
  nextPage: () => void;
  hasUpdateRight: boolean;
  hasDeleteRight: boolean;
  onSelectFile: () => void;
  onSelectSchemaFileModalClose: () => void;
  onModalClose: () => void;
};

const ImportSchemaModal: React.FC<Props> = ({
  visible,
  selectFileModalVisible,
  currentPage: currentImportSchemaModalPage,
  nextPage: nextSchemaImportPage,
  hasUpdateRight,
  hasDeleteRight,
  onSelectFile,
  onSelectSchemaFileModalClose,
  onModalClose: onSchemaImportModalClose,
}) => {
  const t = useT();

  const fields: Field[] = [
    {
      id: "01jkde813j9ffyghqs5ewq2mwz",
      type: "Text",
      title: "Name",
      key: "name",
      description: "",
      required: false,
      unique: false,
      isTitle: false,
      multiple: false,
      typeProperty: {
        defaultValue: null,
      },
    },
    {
      id: "01jppw7ctmv1ny91z49h2rfcdc",
      type: "Integer",
      title: "Age",
      key: "age",
      description: "",
      required: false,
      unique: false,
      isTitle: false,
      multiple: false,
      typeProperty: {
        integerDefaultValue: null,
      },
    },
  ];
  const [data, setData] = useState<Field[] | undefined>(fields);

  const reorder = useCallback((list: Field[] | undefined, startIndex: number, endIndex: number) => {
    if (!list) return;
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    // onFieldReorder(result);
    return result;
  }, []);

  const onDragEnd = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (toIndex < 0) return;
      return setData(reorder(data, fromIndex, toIndex));
    },
    [data, reorder],
  );

  const options = useMemo(() => {
    const result = [];
    for (const [key, value] of Object.entries(fieldTypes)) {
      result.push({
        value: key,
        label: (
          <div style={{ width: "100%", display: "flex", justifyContent: "start", gap: 8 }}>
            <Icon icon={value.icon} color={value.color} />
            <span>{value.title}</span>
          </div>
        ),
      });
    }
    return result;
  }, []);

  const handleFieldDelete = useCallback(
    (id: string) => {
      setData(data?.filter(item => item.id !== id));
    },
    [data],
  );

  const handleFieldTypeChange = useCallback(
    (id: string, value: FieldType) => {
      setData(data?.map(field => (field.id === id ? { ...field, type: value } : field)));
    },
    [data],
  );

  const handleFieldDeleteConfirmation = useCallback(
    (fieldId: string, name: string) => {
      Modal.confirm({
        content: <Trans i18nKey="Are you sure you want to delete this field?" values={{ name }} />,
        icon: <Icon icon="exclamationCircle" />,
        cancelText: t("Cancel"),
        maskClosable: true,
        onOk() {
          handleFieldDelete(fieldId);
        },
      });
    },
    [handleFieldDelete, t],
  );

  const {
    workspaceId,
    projectId,
    assetList,
    loading,
    totalCount,
    selectedAsset,
    uploadProps,
    fileList,
    uploadType,
    uploadUrl,
    uploading,
    setUploadUrl,
    setUploadType,
    hasCreateRight,
    uploadModalVisibility,
    displayUploadModal,
    page,
    pageSize,
    handleSelect,
    handleSearchTerm,
    handleAssetsReload,
    handleAssetTableChange,
    handleUploadModalCancel,
    handleUploadAndLink,
  } = useHooks();

  const steps = [
    {
      title: "Select file",
      content: (
        <>
          <div>
            <h2>{t("Select file")}</h2>
            {selectedAsset ? (
              <AssetWrapper>
                <AssetDetailsWrapper>
                  <AssetButton enabled={!!selectedAsset} onClick={onSelectFile}>
                    <Icon icon="folder" size={24} />
                    <AssetName>{selectedAsset?.fileName}</AssetName>
                  </AssetButton>
                  <Tooltip title={selectedAsset.fileName}>
                    {
                      <Link
                        to={`/workspace/${workspaceId}/project/${projectId}/asset/${selectedAsset.id}`}
                        target="_blank">
                        <AssetLinkedName type="link">{selectedAsset.fileName}</AssetLinkedName>
                      </Link>
                    }
                  </Tooltip>
                </AssetDetailsWrapper>
                <Space />
              </AssetWrapper>
            ) : (
              <AssetButton onClick={onSelectFile}>
                <Icon icon="linkSolid" size={14} />
                <AssetButtonTitle>{t("Asset")}</AssetButtonTitle>
              </AssetButton>
            )}
          </div>
          <div>
            <h2>{t("Notes")}</h2>
            <Trans
              i18nKey="importSchemaNotes"
              components={{
                l: <TemplateFileLink type="link">template file</TemplateFileLink>,
              }}
            />
          </div>
        </>
      ),
    },
    {
      title: "Schema preview",
      content: (
        <>
          <div>
            <h2>{t("Schema preview")}</h2>
            <p>
              {t(
                "Here is the schema generated by your file. Please confirm the type of each field. If it does not match your expectations, you can modify the field type.",
              )}
            </p>
          </div>
          <ReactDragListView
            nodeSelector=".ant-list-item"
            handleSelector=".grabbable"
            lineClassName="dragLine"
            onDragEnd={onDragEnd}>
            <FieldStyledList
              itemLayout="horizontal"
              header={
                <Row style={{ padding: "12px 24px" }}>
                  <Col span={1} />
                  <Col span={11} style={{ textAlign: "left" }}>
                    <span>Field Name</span>
                  </Col>
                  <Col span={11} style={{ textAlign: "left" }}>
                    <span>Field Type</span>
                  </Col>
                  <Col span={1} />
                </Row>
              }>
              {data?.map((item, index) => (
                <List.Item className="draggable-item" key={index}>
                  <List.Item.Meta
                    title={
                      <Row>
                        <Col span={1}>
                          <FieldThumbnail>
                            {hasUpdateRight && <DragIcon icon="menu" className="grabbable" />}
                          </FieldThumbnail>
                        </Col>
                        <Col span={11} style={{ textAlign: "left" }}>
                          <ItemTitle>
                            <ItemTitleHeading>{item.title}</ItemTitleHeading>
                            {item.required ? " *" : ""}
                            <ItemKey>#{item.key}</ItemKey>
                            {item.unique ? <ItemUnique>({t("unique")})</ItemUnique> : ""}
                            {item.isTitle ? <ItemTitleTag>{t("Title")}</ItemTitleTag> : ""}
                          </ItemTitle>
                        </Col>
                        <Col span={11} style={{ textAlign: "left" }}>
                          <Select
                            value={item.type}
                            style={{ width: 176 }}
                            onChange={value => handleFieldTypeChange(item.id, value)}
                            options={options}
                          />
                        </Col>
                        <Col span={1}>
                          <Button
                            type="text"
                            shape="circle"
                            size="small"
                            onClick={() => handleFieldDeleteConfirmation(item.id, item.title)}
                            icon={<Icon icon="delete" color="#8c8c8c" />}
                            disabled={!hasDeleteRight}
                          />
                        </Col>
                      </Row>
                    }
                  />
                </List.Item>
              ))}
            </FieldStyledList>
          </ReactDragListView>
        </>
      ),
    },
    {
      title: "Importing",
      content: (
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
      ),
    },
  ];

  const items = steps.map(item => ({ key: item.title, title: item.title }));

  return (
    <StyledModal
      title={t("Import Schema")}
      centered
      open={visible}
      onCancel={onSchemaImportModalClose}
      width="70vw"
      footer={
        <>
          {currentImportSchemaModalPage == 0 && (
            <Button type="primary" onClick={nextSchemaImportPage}>
              {t("Next")}
            </Button>
          )}
          {currentImportSchemaModalPage == 1 && (
            <Button type="primary" onClick={nextSchemaImportPage}>
              {t("Import schema")}
            </Button>
          )}
        </>
      }
      styles={{
        body: {
          height: "70vh",
        },
      }}>
      <>
        <Steps current={currentImportSchemaModalPage} items={items} style={{ display: "none" }} />
        <div className="steps-content" style={{ height: "100%" }}>
          {steps[currentImportSchemaModalPage].content}
        </div>
        <SelectSchemaFileModal
          visible={selectFileModalVisible}
          onModalClose={onSelectSchemaFileModalClose}
          linkedAsset={selectedAsset}
          assetList={assetList}
          loading={loading}
          uploadProps={uploadProps}
          uploading={uploading}
          fileList={fileList}
          uploadUrl={uploadUrl}
          uploadType={uploadType}
          setUploadUrl={setUploadUrl}
          setUploadType={setUploadType}
          displayUploadModal={displayUploadModal}
          hasCreateRight={hasCreateRight}
          uploadModalVisibility={uploadModalVisibility}
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onSelect={handleSelect}
          onSearchTerm={handleSearchTerm}
          onAssetsReload={handleAssetsReload}
          onAssetTableChange={handleAssetTableChange}
          onUploadModalCancel={handleUploadModalCancel}
          onUploadAndLink={handleUploadAndLink}
        />
      </>
    </StyledModal>
  );
};

export default ImportSchemaModal;

const StyledModal = styled(Modal)`
  .ant-pro-card-body {
    padding: 0;
    .ant-pro-table-list-toolbar {
      padding-left: 12px;
    }
  }
`;

const AssetButton = styled(Button)<{ enabled?: boolean }>`
  width: 100px;
  height: 100px;
  border: 1px dashed;
  border-color: ${({ enabled }) => (enabled ? "#d9d9d9" : "#00000040")};
  color: ${({ enabled }) => (enabled ? "#000000D9" : "#00000040")};
  padding: 0 5px;
  flex-flow: column;
`;

const Space = styled.div`
  flex: 1;
`;

const AssetWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const AssetLinkedName = styled(Button)<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? "#00000040" : "#1890ff")};
  margin-left: 12px;
  span {
    text-align: start;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-all;
  }
`;

const AssetDetailsWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const AssetName = styled.div`
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AssetButtonTitle = styled.div`
  margin-top: 4px;
`;

const TemplateFileLink = styled(Button)`
  padding: 0;
`;

const FieldStyledList = styled(List)`
  // padding-top: 12px;
  .ant-list-empty-text {
    display: none;
  }
  .ant-list-item {
    background-color: #fff;
    + .ant-list-item {
      // margin-top: 12px;
    }
    padding: 12px 24px;
    // box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.15);
    .ant-list-item-meta {
      .ant-list-item-meta-content {
        text-align: center;
        margin: auto;
      }
      .ant-list-item-meta-title {
        margin: 0;
      }
      align-items: center;
    }
    .ant-list-item-action > li {
      padding: 0 3px;
    }
  }
`;

const FieldThumbnail = styled.div`
  display: flex;
  align-items: center;
  h3 {
    margin: 0;
    margin-left: 12px;
    font-weight: 400;
    font-size: 14px;
    line-height: 22px;
    color: rgba(0, 0, 0, 0.45);
  }
`;

const ItemTitle = styled.p`
  color: rgba(0, 0, 0, 0.85);
  margin: 0;
  display: flex;
  justify-content: start;
`;

const ItemTitleHeading = styled.span`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const ItemKey = styled.span`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const ItemUnique = styled.span`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 400;
`;

const ItemTitleTag = styled(Tag)`
  margin-left: 4px;
  color: rgba(0, 0, 0, 0.45);
  background-color: #fafafa;
`;

const DragIcon = styled(Icon)`
  margin-right: 16px;
  cursor: grab;
  :active {
    cursor: grabbing;
  }
`;
