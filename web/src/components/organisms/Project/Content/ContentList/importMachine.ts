// import { assign, fromPromise, setup } from "xstate";

// import { AlertProps } from "@reearth-cms/components/atoms/Alert";
// import { RcFile } from "@reearth-cms/components/atoms/Upload";
// import { Field } from "@reearth-cms/components/molecules/Schema/types";
// import { useT } from "@reearth-cms/i18n";
// import { FileUtils } from "@reearth-cms/utils/file";
// import { ImportContentJSON } from "@reearth-cms/utils/importContent";
// import { ObjectUtils } from "@reearth-cms/utils/object";

// const COMMON_ALERT_PROPS: Pick<AlertProps, "type" | "closable" | "showIcon"> = {
//   type: "error",
//   closable: true,
//   showIcon: true,
// };

// type ImportContentMachineContext = {
//   fileErrors: AlertProps[];
//   checkResult: ValidateImportResult | null;
//   file: RcFile | null;
//   fileList: RcFile[];
//   modelFields: Field[];
//   t: ReturnType<typeof useT> | null;
// };

// type ValidateImportResult = {
//   type: "warning" | "error";
//   title: string;
//   description: string;
//   canForwardToImport?: boolean;
//   hint?: string;
// };

// type ImportContentMachineInput = {
//   t: ReturnType<typeof useT>;
//   modelFields: Field[];
// };

// type ImportContentMachineEvents =
//   | { type: "TO_SELECT_FILE" }
//   | { type: "TO_FILE_CHECKING"; payload: { file: RcFile; fileList: RcFile[] } }
//   | { type: "TO_CONTENT_CHECKING" }
//   | { type: "TO_FILE_SELECT" }
//   | { type: "TO_CHECK_RESULT" };

// const INITIAL_CONTEXT: ImportContentMachineContext = {
//   fileErrors: [],
//   checkResult: null,
//   file: null,
//   fileList: [],
//   modelFields: [],
//   t: null,
// };

// export const importContentMachine = setup({
//   actions: {
//     ADD_FILE: assign({
//       file: (_, params: { payload: { file: RcFile; fileList: RcFile[] } }) => {
//         return params.payload.file;
//       },
//       fileList: (_, params: { payload: { file: RcFile; fileList: RcFile[] } }) => {
//         return params.payload.fileList;
//       },
//     }),
//     RAISE_ILLEGAL_FILE_ALERT: assign({
//       fileErrors: ({ context }) => {
//         if (!context.t) return context.fileErrors;

//         return [
//           {
//             ...COMMON_ALERT_PROPS,
//             message: context.t("The uploaded file is empty or invalid"),
//           },
//         ];
//       },
//     }),
//     RAISE_SINGLE_FILE_ALERT: assign({
//       fileErrors: ({ context }) => {
//         if (!context.t) return context.fileErrors;

//         return [
//           {
//             ...COMMON_ALERT_PROPS,
//             message: context.t("Only one file can be uploaded at a time"),
//           },
//         ];
//       },
//     }),
//     RAISE_ILLEGAL_FILE_FORMAT_ALERT: assign({
//       fileErrors: ({ context }) => {
//         if (!context.t) return context.fileErrors;

//         return [
//           {
//             ...COMMON_ALERT_PROPS,
//             message: context.t("File format is not supported"),
//           },
//         ];
//       },
//     }),
//     RESET_CONTEXT: assign(INITIAL_CONTEXT),
//   },
//   types: {
//     context: {} as ImportContentMachineContext,
//     events: {} as ImportContentMachineEvents,
//     input: {} as ImportContentMachineInput,
//   },
//   guards: {
//     IS_MULTIPLE_FILES: ({ context }) => context.fileList.length > 1,
//     IS_ILLEGAL_EXTENSION: ({ context }) => {
//       if (!context.file) return false;
//       const extension = FileUtils.getExtension(context.file.name);
//       return !["geojson", "json", "csv"].includes(extension);
//     },
//     IS_EMPTY_FILE: ({ context }) => {
//       if (!context.file) return false;
//       return context.file.size === 0;
//     },
//     IS_CSV: ({ context }) => {
//       if (!context.file) return false;
//       return FileUtils.getExtension(context.file.name) === "csv";
//     },
//     IS_JSON: ({ context }) => {
//       if (!context.file) return false;
//       return FileUtils.getExtension(context.file.name) === "json";
//     },
//     IS_GEO_JSON: ({ context }) => {
//       if (!context.file) return false;
//       return FileUtils.getExtension(context.file.name) === "geojson";
//     },
//   },
//   actors: {
//     // VALIDATE_CONTENT: fromPromise<any, ImportContentMachineContext>(async promiseCreator => {
//     //   if (!promiseCreator.input.file) throw Error();

//     //   const file = promiseCreator.input.file;
//     //   const modelFields = promiseCreator.input.modelFields;
//     //   const extension = FileUtils.getExtension(file.name);
//     //   const content = await FileUtils.parseTextFile(file);

//     //   switch (extension) {
//     //     case "json":
//     //       {
//     //         const jsonValidation = await ObjectUtils.safeJSONParse<ImportContentJSON>(content);
//     //         if (!jsonValidation.isValid) {
//     //           raiseIllegalFileAlert();
//     //           return;
//     //         }

//     //         const jsonContentValidation = await ImportUtils.validateContentFromJSON(
//     //           jsonValidation.data,
//     //           modelFields,
//     //         );

//     //         if (!jsonContentValidation.isValid) {
//     //           schemaValidationAlert(jsonContentValidation.error);
//     //           return;
//     //         }

//     //         onFileContentChange({ fileContent: jsonContentValidation.data, extension });
//     //       }
//     //       break;

//     //     case "geojson":
//     //       {
//     //         const geoJSONValidation = await ObjectUtils.validateGeoJson(content);
//     //         if (!geoJSONValidation.isValid) {
//     //           raiseIllegalFileAlert();
//     //           return;
//     //         }

//     //         const geoJSONContentValidation = await ImportUtils.validateContentFromGeoJson(
//     //           geoJSONValidation.data,
//     //           modelFields,
//     //         );

//     //         if (!geoJSONContentValidation.isValid) {
//     //           schemaValidationAlert(geoJSONContentValidation.error);
//     //           return;
//     //         }

//     //         onFileContentChange({ fileContent: geoJSONContentValidation.data, extension });
//     //       }
//     //       break;

//     //     case "csv":
//     //       {
//     //         const csvValidation = await ImportUtils.convertCSVToJSON(content);
//     //         if (!csvValidation.isValid) {
//     //           raiseIllegalFileAlert();
//     //           return;
//     //         }

//     //         const csvContentValidation = await ImportUtils.validateContentFromCSV(
//     //           csvValidation.data,
//     //           modelFields,
//     //         );

//     //         if (!csvContentValidation.isValid) {
//     //           schemaValidationAlert(csvContentValidation.error);
//     //           return;
//     //         }

//     //         onFileContentChange({ fileContent: csvContentValidation.data, extension });
//     //       }
//     //       break;

//     //     default:
//     //   }
//     // }),
//     VALIDATE_CSV_CONTENT: fromPromise<any, ImportContentMachineContext>(async promiseCreator => {
//       if (!promiseCreator.input.file) throw Error("no file");

//       const content = await FileUtils.parseTextFile(promiseCreator.input.file);
//       const jsonValidation = await ObjectUtils.safeJSONParse<ImportContentJSON>(content);
//       if (!jsonValidation.isValid) throw Error("invalid json");

//       // const jsonContentValidation = await ImportContentUtils.validateContentFromJSON(
//       //   jsonValidation.data,
//       //   promiseCreator.input.modelFields,
//       // );

//       // if (!jsonContentValidation.isValid) {
//       //   promiseCreator.input.checkResult = jsonContentValidation.error;
//       //   throw Error();
//       // }

//       // return { fileContent: jsonContentValidation.data, extension: "csv" };
//     }),
//     VALIDATE_JSON_CONTENT: fromPromise<any, ImportContentMachineContext>(
//       async promiseCreator => {},
//     ),
//     VALIDATE_GEO_JSON_CONTENT: fromPromise<any, ImportContentMachineContext>(
//       async promiseCreator => {},
//     ),
//   },
// }).createMachine({
//   context: ({ input }) => ({ ...INITIAL_CONTEXT, t: input.t, modelFields: input.modelFields }),
//   description: "import content file modal",
//   initial: "CLOSE",
//   states: {
//     CLOSE: {
//       on: {
//         TO_SELECT_FILE: {
//           target: "SELECT_FILE",
//         },
//       },
//     },
//     SELECT_FILE: {
//       on: {
//         TO_FILE_CHECKING: {
//           actions: {
//             type: "ADD_FILE",
//             params: ({ event }) => ({ payload: event.payload }),
//           },
//           target: "FILE_CHECKING",
//         },
//       },
//     },
//     FILE_CHECKING: {
//       always: [
//         {
//           actions: "RAISE_ILLEGAL_FILE_FORMAT_ALERT",
//           guard: "IS_ILLEGAL_EXTENSION",
//           target: "SELECT_FILE",
//         },
//         {
//           actions: "RAISE_SINGLE_FILE_ALERT",
//           guard: "IS_MULTIPLE_FILES",
//           target: "SELECT_FILE",
//         },
//         {
//           actions: "RAISE_ILLEGAL_FILE_ALERT",
//           guard: "IS_EMPTY_FILE",
//           target: "SELECT_FILE",
//         },
//         {
//           target: "EXTENSION_CHECKING",
//         },
//       ],
//     },
//     EXTENSION_CHECKING: {
//       always: [
//         {
//           guard: "IS_CSV",
//           target: "CONTENT_CSV_CHECKING",
//         },
//         {
//           guard: "IS_JSON",
//           target: "CONTENT_JSON_CHECKING",
//         },
//         {
//           guard: "IS_GEO_JSON",
//           target: "CONTENT_GEO_JSON_CHECKING",
//         },
//         {
//           actions: "RAISE_ILLEGAL_FILE_FORMAT_ALERT",
//           target: "SELECT_FILE",
//         },
//       ],
//     },
//     CONTENT_CSV_CHECKING: {
//       invoke: {
//         input: ({ context }) => context,
//         onDone: {
//           target: "CLOSE",
//         },
//         onError: {
//           target: "RESULT",
//         },
//         src: "VALIDATE_CSV_CONTENT",
//       },
//     },
//     CONTENT_JSON_CHECKING: {
//       invoke: {
//         input: ({ context }) => context,
//         onDone: {
//           target: "CLOSE",
//         },
//         onError: {
//           target: "RESULT",
//         },
//         src: "VALIDATE_JSON_CONTENT",
//       },
//     },
//     CONTENT_GEO_JSON_CHECKING: {
//       invoke: {
//         input: ({ context }) => context,
//         onDone: {
//           target: "CLOSE",
//         },
//         onError: {
//           target: "RESULT",
//         },
//         src: "VALIDATE_GEO_JSON_CONTENT",
//       },
//     },
//     // CONTENT_CHECKING: {
//     //   invoke: {
//     //     input: ({ context }) => context,
//     //     onDone: {
//     //       target: "CLOSE",
//     //     },
//     //     onError: {
//     //       target: "RESULT",
//     //     },
//     //     src: "VALIDATE_CONTENT",
//     //   },
//     // },
//     RESULT: {
//       on: {
//         TO_SELECT_FILE: {
//           target: "SELECT_FILE",
//         },
//       },
//     },
//   },
// });
