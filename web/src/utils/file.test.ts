import { test, expect, describe } from "vitest";

import { FileUtils } from "./file";

describe("FileUtils", () => {
  describe("getExtension", () => {
    test("FileUtils.getExtension function returns correct extension when filename has extension", () => {
      expect(FileUtils.getExtension("file.txt")).toBe("txt");
      expect(FileUtils.getExtension("document.pdf")).toBe("pdf");
      expect(FileUtils.getExtension("image.jpeg")).toBe("jpeg");
    });

    test("FileUtils.getExtension function returns empty string when filename does not have an extension", () => {
      expect(FileUtils.getExtension("filename")).toBe("");
      expect(FileUtils.getExtension("anotherfile")).toBe("");
      expect(FileUtils.getExtension("noextension")).toBe("");
    });

    test("FileUtils.getExtension function returns correct extension when filename has multiple dots", () => {
      expect(FileUtils.getExtension("archive.tar.gz")).toBe("gz");
      expect(FileUtils.getExtension("backup.tar.gz")).toBe("gz");
      expect(FileUtils.getExtension("code.min.js")).toBe("js");
    });

    test("FileUtils.getExtension function returns empty string when filename is undefined or null", () => {
      expect(FileUtils.getExtension(undefined)).toBe("");
    });
  });

  describe("MBtoBytes", () => {
    test("converts 1 MB to bytes", () => {
      expect(FileUtils.MBtoBytes(1)).toBe(1048576);
    });

    test("converts 0 MB to 0 bytes", () => {
      expect(FileUtils.MBtoBytes(0)).toBe(0);
    });

    test("converts 0.5 MB to bytes", () => {
      expect(FileUtils.MBtoBytes(0.5)).toBe(524288);
    });
  });

  describe("readInput", () => {
    test("returns string input as-is", async () => {
      expect(await FileUtils.readInput("hello")).toBe("hello");
    });

    test("throws for unsupported input type", async () => {
      await expect(FileUtils.readInput(42 as never)).rejects.toThrow("Unsupported input type");
    });
  });

  describe("parseTextFile", () => {
    test("resolves with file content", async () => {
      const file = new File(["file content here"], "test.txt", { type: "text/plain" });
      const result = await FileUtils.parseTextFile(file as never);
      expect(result).toBe("file content here");
    });
  });
});
