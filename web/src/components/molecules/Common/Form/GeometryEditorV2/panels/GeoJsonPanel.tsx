import styled from "@emotion/styled";
import MonacoEditor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import geometrySchema from "@reearth-cms/components/molecules/Common/Form/GeometryItem/schema";
import { useT } from "@reearth-cms/i18n";
import { registerJsonSchema } from "@reearth-cms/utils/monacoJsonSchemas";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { collectionToText, parseText, withStableIds } from "../core/fieldValue";
import { useGeoSnapshot, useGeoStore } from "../core/StoreContext";
import { EditOrigin } from "../core/types";
import { formatIssue } from "../core/validation";
import type { GeometryIssue, ValidateOptions } from "../core/validation";

const COMMIT_DEBOUNCE_MS = 400;

type Props = {
  multiple: boolean;
  readOnly: boolean;
  open: boolean;
  validateOptions: ValidateOptions;
  /** Text and issues of a stored value that could not be loaded. */
  initialInvalid?: { text: string; issues: GeometryIssue[] };
  onToggle: () => void;
  onIssuesChange: (issues: GeometryIssue[]) => void;
};

const registerSchemas = () => {
  registerJsonSchema({
    uri: "inmemory://schemas/geometry-v2-single",
    fileMatch: ["geometry-v2/single/*"],
    schema: geometrySchema,
  });
  registerJsonSchema({
    uri: "inmemory://schemas/geometry-v2-multiple",
    fileMatch: ["geometry-v2/multiple/*"],
    schema: { type: "array", items: geometrySchema },
  });
};

/**
 * The value exactly as it is stored — a bare geometry, or a list of them — rather than
 * the PoC's FeatureCollection with internal ids and properties.
 */
const GeoJsonPanel: React.FC<Props> = ({
  multiple,
  readOnly,
  open,
  validateOptions,
  initialInvalid,
  onToggle,
  onIssuesChange,
}) => {
  const t = useT();
  const store = useGeoStore();
  const snapshot = useGeoSnapshot();
  const modelPath = `geometry-v2/${multiple ? "multiple" : "single"}/${useId().replace(/:/g, "")}.json`;

  const [text, setText] = useState(
    () => initialInvalid?.text ?? collectionToText(snapshot.collection, multiple),
  );
  const [issues, setIssues] = useState<GeometryIssue[]>(initialInvalid?.issues ?? []);
  const [outOfSync, setOutOfSync] = useState(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const timerRef = useRef<number | null>(null);
  const appliedRevisionRef = useRef(snapshot.revision);
  const dirtyRef = useRef(false);

  useEffect(() => onIssuesChange(issues), [issues, onIssuesChange]);

  const reloadFromStore = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    const current = store.getSnapshot();
    setText(collectionToText(current.collection, multiple));
    appliedRevisionRef.current = current.revision;
    dirtyRef.current = false;
    setIssues([]);
    setOutOfSync(false);
  }, [multiple, store]);

  useEffect(() => {
    if (snapshot.revision === appliedRevisionRef.current) return;
    // Never overwrite text the user is in the middle of writing.
    if (dirtyRef.current && editorRef.current?.hasTextFocus()) {
      setOutOfSync(true);
      return;
    }
    reloadFromStore();
  }, [snapshot.revision, reloadFromStore]);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handleChange = (value: string | undefined) => {
    const next = value ?? "";
    setText(next);
    dirtyRef.current = true;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const result = parseText(next, multiple, validateOptions);
      if (!result.ok) {
        setIssues(result.issues);
        return;
      }
      setIssues([]);
      setOutOfSync(false);
      const current = store.getSnapshot();
      store.commit(withStableIds(result.geometries, current.collection), EditOrigin.TEXT);
      appliedRevisionRef.current = store.getSnapshot().revision;
      dirtyRef.current = false;
    }, COMMIT_DEBOUNCE_MS);
  };

  const handleMount: OnMount = instance => {
    editorRef.current = instance;
  };

  const status =
    issues.length > 0 ? (
      <Tag color="error" bordered={false}>
        {t("{{count}} problems", { count: issues.length })}
      </Tag>
    ) : (
      <Tag color="success" bordered={false}>
        {t("Valid")}
      </Tag>
    );

  return (
    <Panel open={open}>
      <Header>
        <HeaderToggle type="button" onClick={onToggle} aria-expanded={open}>
          <Icon icon={open ? "caretDown" : "caretRight"} size={12} />
          <Typography.Text strong>GeoJSON</Typography.Text>
          {status}
        </HeaderToggle>
        <Tooltip title={t("Copy GeoJSON")}>
          <Button
            size="small"
            type="text"
            aria-label={t("Copy GeoJSON")}
            icon={<Icon icon="editorCopy" size={14} />}
            onClick={() => void navigator.clipboard?.writeText(text)}
          />
        </Tooltip>
      </Header>
      {open && (
        <Body>
          {outOfSync && (
            <Alert
              banner
              type="warning"
              message={t("The map changed while you were typing.")}
              action={
                <Button size="small" onClick={reloadFromStore}>
                  {t("Discard my text")}
                </Button>
              }
            />
          )}
          <EditorWrapper>
            <MonacoEditor
              path={modelPath}
              language="json"
              value={text}
              beforeMount={registerSchemas}
              onMount={handleMount}
              onChange={handleChange}
              options={{
                readOnly,
                readOnlyMessage: { value: t("Cannot edit in read-only editor") },
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                fontSize: 12,
                lineNumbersMinChars: 3,
                folding: true,
                automaticLayout: true,
              }}
            />
          </EditorWrapper>
          {issues.length > 0 && (
            <Alert
              banner
              type="error"
              message={formatIssue(issues[0])}
              description={
                issues.length > 1
                  ? t("... and {{count}} more errors", { count: issues.length - 1 })
                  : t("The map keeps showing the last valid value until this is fixed.")
              }
            />
          )}
        </Body>
      )}
    </Panel>
  );
};

export default GeoJsonPanel;

const Panel = styled.div<{ open: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border-top: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${AntdToken.SPACING.XS}px 0 0;
  height: 40px;
  flex-shrink: 0;
`;

const HeaderToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${AntdToken.SPACING.XS}px;
  height: 100%;
  flex: 1;
  padding: 0 ${AntdToken.SPACING.SM}px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  &:focus-visible {
    outline: 2px solid ${AntdColor.BLUE.BLUE_5};
    outline-offset: -2px;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const EditorWrapper = styled.div`
  flex: 1;
  min-height: 120px;
`;
