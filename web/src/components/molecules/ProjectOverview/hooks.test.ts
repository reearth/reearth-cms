import { renderHook, act } from "@testing-library/react";
import { ChangeEvent } from "react";
import { describe, test, expect, vi } from "vitest";

import { Project } from "../Workspace/types";

import useHook from "./hooks";

const baseProject: Project = {
  id: "project-1",
  name: "Test Project",
  description: "desc",
  alias: "test-alias",
  readme: "# README",
  license: "MIT License",
  requestRoles: [],
};

describe("ProjectOverview hooks", () => {
  describe("initial state", () => {
    test("returns correct default values", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: undefined, onProjectUpdate }));

      expect(result.current.activeReadmeTab).toBe("edit");
      expect(result.current.readmeEditMode).toBe(false);
      expect(result.current.readmeValue).toBe("");
      expect(result.current.activeLicenseTab).toBe("edit");
      expect(result.current.licenseEditMode).toBe(false);
      expect(result.current.licenseValue).toBe("");
    });
  });

  describe("useEffect syncs project readme/license", () => {
    test("initializes readmeValue from project.readme", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      expect(result.current.readmeValue).toBe("# README");
    });

    test("initializes licenseValue from project.license", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      expect(result.current.licenseValue).toBe("MIT License");
    });

    test("updates readmeValue when project.readme changes", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      let project = { ...baseProject, readme: "old" };
      const { result, rerender } = renderHook(
        ({ project }) => useHook({ project, onProjectUpdate }),
        { initialProps: { project } },
      );

      expect(result.current.readmeValue).toBe("old");

      project = { ...baseProject, readme: "new readme" };
      rerender({ project });

      expect(result.current.readmeValue).toBe("new readme");
    });

    test("does not overwrite values when project readme/license is falsy", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const project = { ...baseProject, readme: "", license: "" };
      const { result } = renderHook(() => useHook({ project, onProjectUpdate }));

      expect(result.current.readmeValue).toBe("");
      expect(result.current.licenseValue).toBe("");
    });
  });

  describe("handleReadmeSave", () => {
    test("calls onProjectUpdate with readme and resets edit state", async () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      await act(async () => {
        result.current.handleReadmeEdit();
      });
      expect(result.current.readmeEditMode).toBe(true);

      await act(async () => {
        await result.current.handleReadmeSave();
      });

      expect(onProjectUpdate).toHaveBeenCalledWith({
        projectId: "project-1",
        readme: "# README",
      });
      expect(result.current.activeReadmeTab).toBe("edit");
      expect(result.current.readmeEditMode).toBe(false);
    });

    test("returns early when project is undefined", async () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useHook({ project: undefined, onProjectUpdate }),
      );

      await act(async () => {
        await result.current.handleReadmeSave();
      });

      expect(onProjectUpdate).not.toHaveBeenCalled();
    });
  });

  describe("handleReadmeEdit", () => {
    test("sets readmeEditMode to true", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      expect(result.current.readmeEditMode).toBe(false);

      act(() => {
        result.current.handleReadmeEdit();
      });

      expect(result.current.readmeEditMode).toBe(true);
    });
  });

  describe("handleLicenseSave", () => {
    test("calls onProjectUpdate with license and resets edit state", async () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      await act(async () => {
        result.current.handleLicenseEdit();
      });
      expect(result.current.licenseEditMode).toBe(true);

      await act(async () => {
        await result.current.handleLicenseSave();
      });

      expect(onProjectUpdate).toHaveBeenCalledWith({
        projectId: "project-1",
        license: "MIT License",
      });
      expect(result.current.activeLicenseTab).toBe("edit");
      expect(result.current.licenseEditMode).toBe(false);
    });

    test("returns early when project is undefined", async () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useHook({ project: undefined, onProjectUpdate }),
      );

      await act(async () => {
        await result.current.handleLicenseSave();
      });

      expect(onProjectUpdate).not.toHaveBeenCalled();
    });
  });

  describe("handleLicenseEdit", () => {
    test("sets licenseEditMode to true", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      expect(result.current.licenseEditMode).toBe(false);

      act(() => {
        result.current.handleLicenseEdit();
      });

      expect(result.current.licenseEditMode).toBe(true);
    });
  });

  describe("handleReadmeMarkdownChange", () => {
    test("updates readmeValue from change event", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      act(() => {
        result.current.handleReadmeMarkdownChange({
          target: { value: "updated readme" },
        } as ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.readmeValue).toBe("updated readme");
    });
  });

  describe("handleLicenseMarkdownChange", () => {
    test("updates licenseValue from change event", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      act(() => {
        result.current.handleLicenseMarkdownChange({
          target: { value: "Apache 2.0" },
        } as ChangeEvent<HTMLTextAreaElement>);
      });

      expect(result.current.licenseValue).toBe("Apache 2.0");
    });
  });

  describe("handleChooseLicenseTemplate", () => {
    test("updates licenseValue with the provided string", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      act(() => {
        result.current.handleChooseLicenseTemplate("GPL-3.0 License text");
      });

      expect(result.current.licenseValue).toBe("GPL-3.0 License text");
    });
  });

  describe("setActiveReadmeTab / setActiveLicenseTab", () => {
    test("exposed state setters update tab values", () => {
      const onProjectUpdate = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useHook({ project: baseProject, onProjectUpdate }));

      act(() => {
        result.current.setActiveReadmeTab("preview");
      });
      expect(result.current.activeReadmeTab).toBe("preview");

      act(() => {
        result.current.setActiveLicenseTab("preview");
      });
      expect(result.current.activeLicenseTab).toBe("preview");
    });
  });
});
