import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import SvgViewer from ".";

vi.mock("@reearth-cms/gql", () => ({
  useAuthHeader: () => ({
    getHeader: vi.fn().mockResolvedValue({ Authorization: "Bearer token" }),
  }),
}));

vi.mock("@reearth-cms/i18n", () => ({
  useT: () => (key: string) => key,
}));

describe("SvgViewer", () => {
  const mockRevokeObjectURL = vi.fn();
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCreateObjectURL = vi.fn().mockReturnValue("blob:http://localhost/svg");
    vi.stubGlobal("URL", {
      ...globalThis.URL,
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("shows loading text initially", () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<svg></svg>"),
    } as Response);
    render(<SvgViewer url="https://example.com/icon.svg" svgRender isAssetPublic />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  test("svgRender=true renders img element", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<svg></svg>"),
    } as Response);
    render(<SvgViewer url="https://example.com/icon.svg" svgRender isAssetPublic />);

    await waitFor(() => {
      expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
    });
  });

  test("svgRender=false renders pre with SVG text, no img", async () => {
    const svgContent = '<svg xmlns="http://www.w3.org/2000/svg"><circle/></svg>';
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(svgContent),
    } as Response);
    render(
      <SvgViewer url="https://example.com/icon.svg" svgRender={false} isAssetPublic={false} />,
    );

    await waitFor(() => {
      expect(screen.getByText(svgContent)).toBeInTheDocument();
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  test("public asset image src is direct URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<svg></svg>"),
    } as Response);
    render(<SvgViewer url="https://example.com/icon.svg" svgRender isAssetPublic />);

    await waitFor(() => {
      expect(screen.getByRole("img", { hidden: true })).toHaveAttribute("src", "https://example.com/icon.svg");
    });
  });

  test("protected asset image src is blob URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<svg></svg>"),
    } as Response);
    render(
      <SvgViewer url="https://example.com/icon.svg" svgRender isAssetPublic={false} />,
    );

    await waitFor(() => {
      expect(screen.getByRole("img", { hidden: true })).toHaveAttribute("src", "blob:http://localhost/svg");
    });
  });

  test("fetch error displays error text", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);
    render(<SvgViewer url="https://example.com/icon.svg" svgRender={false} isAssetPublic />);

    await waitFor(() => {
      expect(screen.getByText("Could not display svg")).toBeInTheDocument();
    });
  });

  test("revokeObjectURL called on unmount", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<svg></svg>"),
    } as Response);
    const { unmount } = render(
      <SvgViewer url="https://example.com/icon.svg" svgRender isAssetPublic={false} />,
    );

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    unmount();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/svg");
  });

  test("no re-fetch when text and blobUrl are already populated", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("<svg></svg>"),
    } as Response);
    const { rerender } = render(
      <SvgViewer url="https://example.com/icon.svg" svgRender isAssetPublic />,
    );

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    rerender(<SvgViewer url="https://example.com/icon.svg" svgRender isAssetPublic />);

    // Still only one fetch call after rerender
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
