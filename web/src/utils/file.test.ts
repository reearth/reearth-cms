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

  describe("isUTF8", () => {
    test("returns true for UTF-8 content", async () => {
      expect(await FileUtils.isUTF8(new Blob(["name,タイトル\n1,あ"]))).toBe(true);
    });

    test("returns true for UTF-8 content with BOM", async () => {
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      expect(await FileUtils.isUTF8(new Blob([bom, "name,タイトル\n1,あ"]))).toBe(true);
    });

    test("returns true for ASCII-only content", async () => {
      expect(await FileUtils.isUTF8(new Blob(["name,age\nfoo,1"]))).toBe(true);
    });

    test("returns false for Shift_JIS content", async () => {
      // "name,あ" in Shift_JIS
      const sjis = new Uint8Array([0x6e, 0x61, 0x6d, 0x65, 0x2c, 0x82, 0xa0]);
      expect(await FileUtils.isUTF8(new Blob([sjis]))).toBe(false);
    });
  });
});
