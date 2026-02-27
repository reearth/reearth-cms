import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("@reearth-cms/gql", () => ({
  useAuthHeader: () => ({
    getHeader: vi.fn().mockResolvedValue({ Authorization: "Bearer token" }),
  }),
}));

vi.mock("@reearth-cms/i18n", () => ({
  useT: () => (key: string) => key,
}));

import ImageViewer from ".";

describe("ImageViewer", () => {
  const mockRevokeObjectURL = vi.fn();
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCreateObjectURL = vi.fn().mockReturnValue("blob:http://localhost/abc");
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
    render(<ImageViewer url="https://example.com/image.png" isAssetPublic />);
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });

  test("public asset sets src to URL directly", () => {
    render(<ImageViewer url="https://example.com/image.png" isAssetPublic />);
    expect(screen.getByRole("img", { hidden: true })).toHaveAttribute(
      "src",
      "https://example.com/image.png",
    );
  });

  test("public asset does not call fetch", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ImageViewer url="https://example.com/image.png" isAssetPublic />);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("protected asset calls fetch with auth headers", async () => {
    const mockBlob = new Blob(["image-data"], { type: "image/png" });
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    } as Response);

    render(<ImageViewer url="https://example.com/image.png" isAssetPublic={false} />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith("https://example.com/image.png", {
        method: "GET",
        headers: { Authorization: "Bearer token" },
      });
    });
  });

  test("protected asset sets src to blob URL after fetch", async () => {
    const mockBlob = new Blob(["image-data"], { type: "image/png" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    } as Response);

    render(<ImageViewer url="https://example.com/image.png" isAssetPublic={false} />);

    await waitFor(() => {
      expect(screen.getByRole("img", { hidden: true })).toHaveAttribute(
        "src",
        "blob:http://localhost/abc",
      );
    });
  });

  test("revokeObjectURL called on unmount", async () => {
    const mockBlob = new Blob(["image-data"], { type: "image/png" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(mockBlob),
    } as Response);

    const { unmount } = render(
      <ImageViewer url="https://example.com/image.png" isAssetPublic={false} />,
    );

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
    });

    unmount();
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/abc");
  });

  test("custom alt prop is rendered on img", () => {
    render(<ImageViewer url="https://example.com/image.png" isAssetPublic alt="my photo" />);
    expect(screen.getByRole("img", { hidden: true })).toHaveAttribute("alt", "my photo");
  });
});
