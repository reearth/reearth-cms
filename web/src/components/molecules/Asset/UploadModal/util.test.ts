import { describe, test, expect } from "vitest";

import { type UploadFile } from "@reearth-cms/components/atoms/Upload";

import { isImageUrl } from "./util";

const file = (props: Partial<UploadFile>): UploadFile => ({
  uid: "1",
  name: "file",
  ...props,
});

describe("isImageUrl", () => {
  test("returns true for image MIME type", () => {
    expect(isImageUrl(file({ type: "image/png" }))).toBe(true);
    expect(isImageUrl(file({ type: "image/jpeg" }))).toBe(true);
    expect(isImageUrl(file({ type: "image/svg+xml" }))).toBe(true);
  });

  test("returns false for non-image MIME type", () => {
    expect(isImageUrl(file({ type: "application/pdf" }))).toBe(false);
    expect(isImageUrl(file({ type: "text/plain" }))).toBe(false);
  });

  test("returns true for base64 image data URI", () => {
    expect(isImageUrl(file({ thumbUrl: "data:image/png;base64,abc123" }))).toBe(true);
  });

  test("returns false for non-image base64 data URI", () => {
    expect(isImageUrl(file({ thumbUrl: "data:application/pdf;base64,abc123" }))).toBe(false);
  });

  test("returns true for image file extensions", () => {
    expect(isImageUrl(file({ url: "https://example.com/photo.png" }))).toBe(true);
    expect(isImageUrl(file({ url: "https://example.com/photo.jpg" }))).toBe(true);
    expect(isImageUrl(file({ url: "https://example.com/photo.jpeg" }))).toBe(true);
    expect(isImageUrl(file({ url: "https://example.com/photo.gif" }))).toBe(true);
    expect(isImageUrl(file({ url: "https://example.com/photo.svg" }))).toBe(true);
    expect(isImageUrl(file({ url: "https://example.com/photo.webp" }))).toBe(true);
    expect(isImageUrl(file({ url: "https://example.com/photo.bmp" }))).toBe(true);
    expect(isImageUrl(file({ url: "https://example.com/photo.ico" }))).toBe(true);
    expect(isImageUrl(file({ url: "https://example.com/photo.heic" }))).toBe(true);
  });

  test("returns false for non-image file extensions", () => {
    expect(isImageUrl(file({ url: "https://example.com/file.pdf" }))).toBe(false);
    expect(isImageUrl(file({ url: "https://example.com/file.zip" }))).toBe(false);
    expect(isImageUrl(file({ url: "https://example.com/file.txt" }))).toBe(false);
  });

  test("returns true when no extension and no data URI", () => {
    expect(isImageUrl(file({ url: "https://example.com/image" }))).toBe(true);
  });

  test("prefers type over URL when thumbUrl is absent", () => {
    expect(isImageUrl(file({ type: "image/png", url: "https://example.com/file.pdf" }))).toBe(true);
    expect(isImageUrl(file({ type: "application/pdf", url: "https://example.com/photo.png" }))).toBe(false);
  });

  test("uses thumbUrl when type has thumbUrl", () => {
    expect(isImageUrl(file({ type: "image/png", thumbUrl: "https://example.com/file.pdf" }))).toBe(false);
  });
});
