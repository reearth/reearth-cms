import styled from "@emotion/styled";
import MonacoEditor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import geometrySchema from "@reearth-cms/components/molecules/Common/Form/GeometryItem/schema";
import { useT } from "@reearth-cms/i18n";
import { registerJsonSchema } from "@reearth-cms/utils/monacoJsonSchemas";
import { AntdColor } from "@reearth-cms/utils/style";

import { collectionToText, parseText, withStableIds } from "../core/fieldValue";
import { useGeoSnapshot, useGeoStore } from "../core/StoreContext";
import { EditOrigin } from "../core/types";
import { formatIssue } from "../core/validation";
import type { GeometryIssue, ValidateOptions } from "../core/validation";

import PanelHeader from "./PanelHeader";

const COMMIT_DEBOUNCE_MS = 400;

export type GeoJsonPanelHandle = {
  /** Applies text still waiting for the debounce. False when that text is invalid. */
  flush(): boolean;
};

type Props = {
  ref?: Ref<GeoJsonPanelHandle>;
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
 * The value exactly as it is stored — a bare geometry, or a list of them — never the
 * internal FeatureCollection with its ids.
 */
const GeoJsonPanel: React.FC<Props> = ({
  ref,
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
  const pendingTextRef = useRef<string | null>(null);
  const appliedRevisionRef = useRef(snapshot.revision);
  const dirtyRef = useRef(false);

  useEffect(() => onIssuesChange(issues), [issues, onIssuesChange]);

  const reloadFromStore = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    pendingTextRef.current = null;
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

  const commitText = useCallback(
    (next: string): boolean => {
      pendingTextRef.current = null;
      const result = parseText(next, multiple, validateOptions);
      if (!result.ok) {
        setIssues(result.issues);
        return false;
      }
      setIssues([]);
      setOutOfSync(false);
      const current = store.getSnapshot();
      store.commit(withStableIds(result.geometries, current.collection), EditOrigin.TEXT);
      appliedRevisionRef.current = store.getSnapshot().revision;
      dirtyRef.current = false;
      return true;
    },
    [multiple, store, validateOptions],
  );

  useImperativeHandle(
    ref,
    () => ({
      flush: () => {
        if (timerRef.current !== null) window.clearTimeout(timerRef.current);
        const pending = pendingTextRef.current;
        return pending === null ? true : commitText(pending);
      },
    }),
    [commitText],
  );

  const handleChange = (value: string | undefined) => {
    const next = value ?? "";
    setText(next);
    dirtyRef.current = true;
    pendingTextRef.current = next;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => commitText(next), COMMIT_DEBOUNCE_MS);
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
      <PanelHeader
        title="GeoJSON"
        open={open}
        status={status}
        actions={
          <>
            {/* The editor only exists while the panel is open. */}
            {open && !readOnly && (
              <Tooltip title={t("Format GeoJSON")}>
                <Button
                  size="small"
                  type="text"
                  aria-label={t("Format GeoJSON")}
                  icon={<Icon icon="textAlignLeft" size={14} />}
                  onClick={() =>
                    void editorRef.current?.getAction("editor.action.formatDocument")?.run()
                  }
                />
              </Tooltip>
            )}
            <Tooltip title={t("Copy GeoJSON")}>
              <Button
                size="small"
                type="text"
                aria-label={t("Copy GeoJSON")}
                icon={<Icon icon="editorCopy" size={14} />}
                onClick={() => void navigator.clipboard?.writeText(text)}
              />
            </Tooltip>
          </>
        }
        onToggle={onToggle}
      />
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
