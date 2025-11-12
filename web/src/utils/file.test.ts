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

  describe("parseTextFile", () => {});

  describe.skip("validateGeoJson", () => {});
});
