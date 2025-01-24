import { t } from "i18next";

export type CreateAssetUploadPayload = {
  url: string;
  token: string;
  contentType: string;
  contentLength: number;
  contentEncoding: string;
  next: string;
};

export type CreateAssetUploadFunc = (params: {
  filename: string;
  contentLength: number;
  contentEncoding?: string;
  cursor?: string;
}) => Promise<CreateAssetUploadPayload | undefined>;

export type CreateAssetFunc<T, U> = (token: string, file: T) => Promise<U>;

export async function uploadFiles<T extends File, U>(
  files: T[],
  createAssetUpload: CreateAssetUploadFunc,
  createAsset: CreateAssetFunc<T, U>,
): Promise<(U | undefined)[]> {
  return await Promise.all(
    files.map(async file => {
      const gzip = isGzippable(file);
      let cursor = "";
      let offset = 0;
      let uploadToken = "";

      while (true) {
        const res = await createAssetUpload({
          filename: file.name,
          contentLength: file.size ?? 0,
          contentEncoding: gzip ? "gzip" : "",
          cursor,
        });
        if (!res) {
          return;
        }

        const { url, token, contentType, contentLength, contentEncoding, next } = res;
        uploadToken = token ?? "";

        if (url === "") {
          break;
        }

        // if contentLength is 0, no need to slice the file
        const body: BodyInit =
          contentLength > 0 ? file.slice(offset, offset + contentLength) : file;
        const resp = await fetch(url, {
          method: "PUT",
          body: gzip ? gzipStreamFromBlob(body) : body,
          headers: {
            ...(contentType && { "Content-Type": contentType }),
            ...(contentEncoding && { "Content-Encoding": contentEncoding }),
          },
          // https://developer.chrome.com/docs/capabilities/web-apis/fetch-streaming-requests
          ...(gzip
            ? {
                duplex: "half",
              }
            : {}),
        });

        if (!resp.ok) {
          throw new Error(t("Failed to upload file"));
        }

        if (!next) {
          break;
        }

        cursor = next;
        offset += contentLength;
      }

      return await createAsset(uploadToken, file);
    }),
  );
}

function gzipStreamFromBlob(blob: Blob): ReadableStream {
  return blob.stream().pipeThrough(new window.CompressionStream("gzip"));
}

function isGzippable(file: File): boolean {
  return (
    "CompressionStream" in window &&
    textFileExtensions.some(ext => file.name.endsWith(`.${ext}`)) &&
    file.size > minGzippableFileSize
  );
}

const minGzippableFileSize = 1024 * 1024; // 1MB

const textFileExtensions = [
  "txt",
  "html",
  "css",
  "js",
  "json",
  "json5",
  "jsonl",
  "xml",
  "csv",
  "tsv",
  "yaml",
  "yml",
  "toml",
  "ini",
  "md",
  "markdown",
  "rst",
  "adoc",
  "asciidoc",
  "geojson",
  "geojsonl",
  "topojson",
  "gml",
  "kml",
  "czml",
  "gpx",
  "wkt",
];
