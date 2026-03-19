import { test, expect, describe, vi } from "vitest";

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

    test("returns empty string for empty string input", () => {
      expect(FileUtils.getExtension("")).toBe("");
    });

    test("returns full name after dot for dotfile like .bashrc", () => {
      expect(FileUtils.getExtension(".bashrc")).toBe("bashrc");
    });

    test("returns lowercase extension for uppercase input", () => {
      expect(FileUtils.getExtension("Photo.JPG")).toBe("jpg");
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

    test("converts 1000 MB to bytes without overflow", () => {
      expect(FileUtils.MBtoBytes(1000)).toBe(1048576000);
    });
  });

  describe("readInput", () => {
    test("returns string input as-is", async () => {
      expect(await FileUtils.readInput("hello")).toBe("hello");
    });

    test("throws for unsupported input type", async () => {
      await expect(FileUtils.readInput(42 as never)).rejects.toThrow("Unsupported input type");
    });

    test("reads Blob input as text", async () => {
      const blob = new Blob(["blob text"]);
      blob.text = () => Promise.resolve("blob text");
      expect(await FileUtils.readInput(blob)).toBe("blob text");
    });

    test("reads ArrayBuffer input as text", async () => {
      const buffer = new ArrayBuffer(11);
      const view = new Uint8Array(buffer);
      new TextEncoder().encode("buffer text").forEach((byte, i) => {
        view[i] = byte;
      });
      expect(await FileUtils.readInput(buffer)).toBe("buffer text");
    });
  });

  describe("parseTextFile", () => {
    test("resolves with file content", async () => {
      const file = new File(["file content here"], "test.txt", { type: "text/plain" });
      const result = await FileUtils.parseTextFile(file as never);
      expect(result).toBe("file content here");
    });

    test("rejects when FileReader encounters an error", async () => {
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      const readAsTextSpy = vi
        .spyOn(FileReader.prototype, "readAsText")
        .mockImplementation(function (this: FileReader) {
          setTimeout(() => {
            const errorEvent = new ProgressEvent("error");
            this.onerror?.(errorEvent as never);
          }, 0);
        });

      await expect(FileUtils.parseTextFile(file as never)).rejects.toBeDefined();
      readAsTextSpy.mockRestore();
    });
  });
});
