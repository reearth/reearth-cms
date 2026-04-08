import { RcFile } from "@reearth-cms/components/atoms/Upload";

/* eslint-disable @typescript-eslint/no-extraneous-class */
export abstract class FileUtils {
  public static getExtension(filename?: string): string {
    if (!filename?.includes(".")) return "";

    return filename.toLowerCase().slice(filename.lastIndexOf(".") + 1, filename.length);
  }

  public static parseTextFile(file: RcFile): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = event => {
        resolve(event.target?.result as string);
      };

      reader.onerror = error => {
        reject(error);
      };

      reader.readAsText(file);
    });
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

  public static MBtoBytes(src: number): number {
    return src * 1024 ** 2;
  }
}
