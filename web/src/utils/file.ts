import { RcFile } from "@reearth-cms/components/atoms/Upload";

/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class FileUtils {
  public static getExtension(filename?: string): string {
    if (!filename?.includes(".")) return "";

    return filename.toLowerCase().slice(filename.lastIndexOf(".") + 1, filename.length);
  }

  public static parseTextFile(
    file: RcFile,
    handleContent: (content: string | null) => void,
    handleError?: (error: DOMException | null | undefined) => void,
  ): void {
    const reader = new FileReader();

    reader.onload = event => {
      if (event.target && typeof event.target.result === "string") {
        handleContent(event.target.result);
      } else {
        handleContent(null);
      }
    };

    reader.onerror = event => {
      if (handleError) handleError(event.target?.error);
    };

    reader.readAsText(file);
  }

  public static async readInput(input: string | ArrayBuffer | Blob): Promise<string> {
    if (typeof input === "string") return input;

    if (input instanceof Blob) {
      return await input.text();
    }

    if (input instanceof ArrayBuffer) {
      return new TextDecoder("utf-8").decode(input);
    }

    throw new Error("Unsupported input type. Provide a string, ArrayBuffer, or Blob.");
  }
}
