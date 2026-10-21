import styled from "@emotion/styled";
import { useCallback, useEffect, useRef, useState } from "react";

import Alert from "@reearth-cms/components/atoms/Alert";
import Button from "@reearth-cms/components/atoms/Button";
import Icon from "@reearth-cms/components/atoms/Icon";
import Search from "@reearth-cms/components/atoms/Search";
import Select from "@reearth-cms/components/atoms/Select";
import Space from "@reearth-cms/components/atoms/Space";
import Tag from "@reearth-cms/components/atoms/Tag";
import Tooltip from "@reearth-cms/components/atoms/Tooltip";
import Typography from "@reearth-cms/components/atoms/Typography";
import { useLang, useT } from "@reearth-cms/i18n";
import { AntdColor, AntdToken } from "@reearth-cms/utils/style";

import { GeocoderId, PROVIDERS } from "./providers";
import type { GeocodeResult } from "./providers";

const PROVIDER_KEY = "reearth-cms:geometry-v2:geocoder";

type Props = {
  /** Searched immediately on mount, e.g. when typed into the inline field. */
  initialQuery?: string;
  activeResultId: string | null;
  /** "Add point" / "Replace point"; undefined when the field cannot hold a point. */
  addLabel?: string;
  onFlyTo: (result: GeocodeResult) => void;
  onAdd: (result: GeocodeResult) => void;
  onClear: () => void;
};

const readProvider = (): GeocoderId => {
  try {
    const stored = localStorage.getItem(PROVIDER_KEY);
    if (stored && stored in PROVIDERS) return stored as GeocoderId;
  } catch {
    // Storage can be unavailable; the default is fine.
  }
  return GeocoderId.NOMINATIM;
};

/**
 * Searching never changes the value by itself: a result is first flown to and shown as a
 * pin, and only "Add point" writes it into the field.
 */
const SearchBox: React.FC<Props> = ({
  initialQuery,
  activeResultId,
  addLabel,
  onFlyTo,
  onAdd,
  onClear,
}) => {
  const t = useT();
  const lang = useLang();
  const [providerId, setProviderId] = useState<GeocoderId>(readProvider);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [searchedQuery, setSearchedQuery] = useState<string | null>(null);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    setSearchedQuery(null);
    setError(null);
    setLoading(false);
    onClear();
  }, [onClear]);

  const runSearch = useCallback(
    async (text: string, provider: GeocoderId) => {
      const trimmed = text.trim();
      if (!trimmed) {
        clear();
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);
      try {
        const found = await PROVIDERS[provider].search(trimmed, lang, controller.signal);
        setResults(found);
        setSearchedQuery(trimmed);
      } catch (e) {
        if (controller.signal.aborted) return;
        setResults([]);
        setSearchedQuery(trimmed);
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [clear, lang],
  );

  // Run the search handed over from the inline field when the editor opens. No "once"
  // guard: React's dev double-mount aborts the first request, so it must run again.
  useEffect(() => {
    if (initialQuery) void runSearch(initialQuery, providerId);
    // Only on open; provider changes re-run the search in handleProviderChange.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleProviderChange = useCallback(
    (next: GeocoderId) => {
      setProviderId(next);
      try {
        localStorage.setItem(PROVIDER_KEY, next);
      } catch {
        // Not remembering the choice is acceptable.
      }
      if (searchedQuery) void runSearch(query, next);
    },
    [query, runSearch, searchedQuery],
  );

  const provider = PROVIDERS[providerId];
  const open = searchedQuery !== null;

  return (
    <Wrapper>
      <Space.Compact block>
        <Select
          value={providerId}
          onChange={handleProviderChange}
          popupMatchSelectWidth={false}
          aria-label={t("Search provider")}
          options={Object.values(PROVIDERS).map(p => ({ value: p.id, label: p.label() }))}
          style={{ width: 160, flexShrink: 0 }}
        />
        <Search
          value={query}
          allowClear
          loading={loading}
          aria-label={t("Search for a place or address")}
          placeholder={t("Search for a place or address")}
          onChange={e => {
            setQuery(e.target.value);
            if (!e.target.value) clear();
          }}
          onSearch={value => void runSearch(value, providerId)}
        />
      </Space.Compact>
      {open && (
        <Results role="listbox" aria-label={t("Search results")}>
          <ResultsHeader>
            <Typography.Text type="secondary">
              {loading ? t("Searching…") : t("{{count}} results", { count: results.length })}
            </Typography.Text>
            <Button size="small" type="text" onClick={clear} aria-label={t("Close results")}>
              <Icon icon="close" />
            </Button>
          </ResultsHeader>
          {error && (
            <Alert
              type="error"
              showIcon
              banner
              message={t("Search is unavailable right now. Try again in a moment.")}
              description={error}
            />
          )}
          {!error && !loading && results.length === 0 && (
            <EmptyText type="secondary">
              {t("No places found. Try another spelling, or the other search source.")}
            </EmptyText>
          )}
          <ResultList>
            {results.map(result => {
              const active = result.id === activeResultId;
              return (
                <ResultRow
                  key={result.id}
                  role="option"
                  aria-selected={active}
                  active={active}
                  tabIndex={0}
                  onClick={() => onFlyTo(result)}
                  onKeyDown={e => {
                    if (e.key === "Enter") onFlyTo(result);
                  }}>
                  <ResultText>
                    <Typography.Text strong ellipsis>
                      {result.label}
                    </Typography.Text>
                    {result.detail && (
                      <Typography.Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                        {result.detail}
                      </Typography.Text>
                    )}
                    {result.kind && <KindTag bordered={false}>{result.kind}</KindTag>}
                  </ResultText>
                  <ResultActions>
                    <Tooltip title={t("Show on the map without changing the value")}>
                      <Button
                        size="small"
                        icon={<Icon icon="aim" />}
                        onClick={e => {
                          e.stopPropagation();
                          onFlyTo(result);
                        }}>
                        {t("Fly to")}
                      </Button>
                    </Tooltip>
                    {addLabel && (
                      <Button
                        size="small"
                        type={active ? "primary" : "default"}
                        icon={<Icon icon="plus" />}
                        onClick={e => {
                          e.stopPropagation();
                          onAdd(result);
                        }}>
                        {addLabel}
                      </Button>
                    )}
                  </ResultActions>
                </ResultRow>
              );
            })}
          </ResultList>
          <Attribution type="secondary">{provider.attribution}</Attribution>
        </Results>
      )}
    </Wrapper>
  );
};

export default SearchBox;

const Wrapper = styled.div`
  width: 460px;
  max-width: calc(100% - 24px);
`;

const Results = styled.div`
  margin-top: ${AntdToken.SPACING.XXS}px;
  background: ${AntdColor.NEUTRAL.BG_WHITE};
  border-radius: ${AntdToken.RADIUS.LG}px;
  box-shadow: ${AntdToken.SHADOW.SECONDARY};
  overflow: hidden;
`;

const ResultsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${AntdToken.SPACING.XXS}px ${AntdToken.SPACING.XXS}px ${AntdToken.SPACING.XXS}px
    ${AntdToken.SPACING.SM}px;
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
`;

const ResultList = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const ResultRow = styled.div<{ active: boolean }>`
  display: flex;
  gap: ${AntdToken.SPACING.XS}px;
  align-items: center;
  padding: ${AntdToken.SPACING.XS}px ${AntdToken.SPACING.SM}px;
  cursor: pointer;
  background: ${({ active }) => (active ? AntdColor.BLUE.BLUE_0 : "transparent")};
  border-bottom: 1px solid ${AntdColor.NEUTRAL.BORDER_SECONDARY};
  &:hover {
    background: ${({ active }) => (active ? AntdColor.BLUE.BLUE_0 : AntdColor.NEUTRAL.BG_ELEVATED)};
  }
  &:focus-visible {
    outline: 2px solid ${AntdColor.BLUE.BLUE_5};
    outline-offset: -2px;
  }
`;

const ResultText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  flex: 1;
`;

const ResultActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${AntdToken.SPACING.XXS}px;
  flex-shrink: 0;
`;

const KindTag = styled(Tag)`
  margin-top: 2px;
  font-size: 11px;
`;

const EmptyText = styled(Typography.Text)`
  display: block;
  padding: ${AntdToken.SPACING.SM}px;
`;

const Attribution = styled(Typography.Text)`
  display: block;
  padding: ${AntdToken.SPACING.XXS}px ${AntdToken.SPACING.SM}px;
  font-size: 11px;
`;
