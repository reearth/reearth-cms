import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Config } from "@reearth-cms/config";
import { DATA_TEST_ID } from "@reearth-cms/test/data";
import { Constant } from "@reearth-cms/utils/constant";

import AppLauncher from ".";

const DISABLED_TITLE = "The link is not available for now";

describe("AppLauncher", () => {
  const originalConfig = window.REEARTH_CONFIG;

  beforeEach(() => {
    window.REEARTH_CONFIG = {
      api: "/api",
      editorUrl: "https://visualizer.example.com",
      dashboardBaseUrl: "https://dashboard.example.com",
    } as Config;
  });

  afterEach(() => {
    window.REEARTH_CONFIG = originalConfig;
  });

  const openLauncher = async (props: Partial<React.ComponentProps<typeof AppLauncher>> = {}) => {
    const user = userEvent.setup();
    const onHomeNavigation = vi.fn();
    render(<AppLauncher workspaceId="ws-1" onHomeNavigation={onHomeNavigation} {...props} />);
    await user.click(screen.getByTestId(DATA_TEST_ID.AppLauncher__Trigger));
    return { user, onHomeNavigation };
  };

  test("renders all sections when opened", async () => {
    await openLauncher();

    expect(await screen.findByText("Re:Earth products")).toBeInTheDocument();
    expect(screen.getByText("Map engine")).toBeInTheDocument();
    expect(screen.getByText("Re:Earth data services")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  test("builds product links from runtime config", async () => {
    await openLauncher();

    expect(await screen.findByTestId(DATA_TEST_ID.AppLauncher__Dashboard)).toHaveAttribute(
      "href",
      "https://dashboard.example.com",
    );
    expect(screen.getByTestId(DATA_TEST_ID.AppLauncher__Visualizer)).toHaveAttribute(
      "href",
      "https://visualizer.example.com/dashboard/ws-1",
    );
    expect(screen.getByTestId(DATA_TEST_ID.AppLauncher__Home)).toHaveAttribute(
      "href",
      "https://dashboard.example.com/home",
    );
  });

  test("opens external links in a new tab", async () => {
    await openLauncher();

    const navara = await screen.findByTestId(DATA_TEST_ID.AppLauncher__Navara);
    expect(navara).toHaveAttribute("href", Constant.MAP_ENGINE_URLS.NAVARA);
    expect(navara).toHaveAttribute("target", "_blank");
    expect(navara).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByTestId(DATA_TEST_ID.AppLauncher__Terrain)).toHaveAttribute(
      "href",
      Constant.DATA_SERVICE_URLS.TERRAIN,
    );
    expect(screen.getByTestId(DATA_TEST_ID.AppLauncher__Community)).toHaveAttribute(
      "href",
      Constant.SOCIAL_URLS.DISCORD,
    );
  });

  test("disables links whose URL is not configured", async () => {
    window.REEARTH_CONFIG = { api: "/api" } as Config;
    await openLauncher();

    for (const testId of [
      DATA_TEST_ID.AppLauncher__Dashboard,
      DATA_TEST_ID.AppLauncher__Visualizer,
      DATA_TEST_ID.AppLauncher__Home,
    ]) {
      const item = await screen.findByTestId(testId);
      expect(item).toHaveAttribute("aria-disabled", "true");
      expect(item).toHaveAttribute("title", DISABLED_TITLE);
      expect(item).not.toHaveAttribute("href");
    }
  });

  test("navigates home within CMS when the CMS tile is clicked", async () => {
    const { user, onHomeNavigation } = await openLauncher();

    await user.click(await screen.findByTestId(DATA_TEST_ID.AppLauncher__Cms));

    expect(onHomeNavigation).toHaveBeenCalledOnce();
  });
});
