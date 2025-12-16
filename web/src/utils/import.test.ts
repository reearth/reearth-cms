/* eslint-disable vitest/no-commented-out-tests */
// import { readFileSync } from "fs";
// import { join } from "path";

// import { FeatureCollection } from "geojson";
// import { expect, test, describe } from "vitest";

// import { Model } from "@reearth-cms/components/molecules/Model/types";
// import { Field } from "@reearth-cms/components/molecules/Schema/types";
// import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
// import {
//   GeometryEditorSupportedType,
//   GeometryObjectSupportedType,
//   Model as GQLModel,
//   Maybe,
//   ProjectVisibility,
//   SchemaFieldType,
// } from "@reearth-cms/gql/graphql-client-api";
// import { ImportContentJSON, ImportUtils } from "@reearth-cms/utils/import";

// import { Constant } from "./constant";
// import { ObjectUtils } from "./object";

// async function readFromJSONFile<T>(
//   staticFileDirectory: string,
//   baseDirectory = "public",
// ): Promise<ReturnType<typeof ObjectUtils.safeJSONParse<T>>> {
//   const filePath = join(baseDirectory, staticFileDirectory);
//   const fileContent = readFileSync(filePath, "utf-8");

//   return await ObjectUtils.safeJSONParse(fileContent);
// }

// function readFromCSVFile(staticFileDirectory: string, baseDirectory = "public"): string {
//   const filePath = join(baseDirectory, staticFileDirectory);
//   const fileContent = readFileSync(filePath, "utf-8");

//   return fileContent;
// }

// function getExpectedSchema(): Model {
//   const expectedSchemaRaw: Maybe<GQLModel> = {
//     id: "01k9ry649rr9kcehhz005mj00b",
//     name: "grand-slam-model",
//     description: "",
//     key: "grand-slam-model",
//     order: 2,
//     metadataSchema: null,
//     schema: {
//       id: "01k9ry649ppgb2qgszje5rgv8z",
//       fields: [
//         {
//           id: "01k9ry6gms30f3wym0sx9fgpa6",
//           type: SchemaFieldType.Text,
//           title: "text-1",
//           key: "text-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 0,
//           typeProperty: {
//             defaultValue: "def_text",
//             maxLength: 10,
//             __typename: "SchemaFieldText",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ry6pm7wg46hszyp6kve53v",
//           type: SchemaFieldType.TextArea,
//           title: "textarea-1",
//           key: "textarea-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 1,
//           typeProperty: {
//             defaultValue: "def_text",
//             maxLength: 10,
//             __typename: "SchemaFieldTextArea",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ry6xg4a11qaks06gzxhj6g",
//           type: SchemaFieldType.MarkdownText,
//           title: "markdown-text-1",
//           key: "markdown-text-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 2,
//           typeProperty: {
//             defaultValue: "def_text",
//             maxLength: 10,
//             __typename: "SchemaFieldMarkdown",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ry71xzxdvztsbn3yvx09gy",
//           type: SchemaFieldType.Asset,
//           title: "asset-1",
//           key: "asset-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 3,
//           typeProperty: {
//             defaultValue: "01k9xwd47gey5wbhc5m7b2253n",
//             __typename: "SchemaFieldAsset",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ry779cs6ygm9kjv7kvxqhy",
//           type: SchemaFieldType.Date,
//           title: "date-1",
//           key: "date-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 4,
//           typeProperty: {
//             defaultValue: "2025-12-01T00:00:00+09:00",
//             __typename: "SchemaFieldDate",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ryg4k0twrwxjezevd85rbz",
//           type: SchemaFieldType.Bool,
//           title: "boolean-1",
//           key: "boolean-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 5,
//           typeProperty: {
//             defaultValue: true,
//             __typename: "SchemaFieldBool",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ryh4dhhbqxjxtctnz3ghng",
//           type: SchemaFieldType.Select,
//           title: "option-1",
//           key: "option-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 6,
//           typeProperty: {
//             defaultValue: "c",
//             values: ["a", "b", "c"],
//             __typename: "SchemaFieldSelect",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ryhe9q15w5cy8fn85j01fn",
//           type: SchemaFieldType.Integer,
//           title: "int-1",
//           key: "int-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 7,
//           typeProperty: {
//             defaultValue: 5,
//             min: -10,
//             max: 10,
//             __typename: "SchemaFieldInteger",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ryhjm6jjnagwkm92x5mrh6",
//           type: SchemaFieldType.Number,
//           title: "float-1",
//           key: "float-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 8,
//           typeProperty: {
//             defaultValue: 3.5,
//             min: -5.5,
//             max: 5.5,
//             __typename: "SchemaFieldNumber",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9ryhph440rrfby12293sv63",
//           type: SchemaFieldType.Url,
//           title: "url-1",
//           key: "url-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 9,
//           typeProperty: {
//             defaultValue: "https://default.com/",
//             __typename: "SchemaFieldURL",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9rykccz2ernve1d79vt1phr",
//           type: SchemaFieldType.GeometryObject,
//           title: "geo-obj-1",
//           key: "geo-obj-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 13,
//           typeProperty: {
//             defaultValue:
//               '{\n  "coordinates": [\n    139.6917,\n    35.6895\n  ],\n  "type": "Point"\n  }',
//             supportedTypes: [GeometryObjectSupportedType.Point],
//             __typename: "SchemaFieldGeometryObject",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//         {
//           id: "01k9rykjf6qmkt3vxjt78cc6mb",
//           type: SchemaFieldType.GeometryEditor,
//           title: "geo-editor-1",
//           key: "geo-editor-1",
//           description: "",
//           required: true,
//           unique: false,
//           isTitle: false,
//           multiple: false,
//           order: 14,
//           typeProperty: {
//             defaultValue: null,
//             supportedTypes: [GeometryEditorSupportedType.Point],
//             __typename: "SchemaFieldGeometryEditor",
//           },
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           __typename: "SchemaField",
//         },
//       ],
//       projectId: "123",
//       project: {
//         accessibility: {
//           visibility: ProjectVisibility.Public,
//         },
//         alias: "123",
//         createdAt: new Date(),
//         description: "123",
//         id: "123",
//         license: "123",
//         name: "123",
//         readme: "123",
//         updatedAt: new Date(),
//         workspaceId: "123",
//       },
//       __typename: "Schema",
//     },
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     schemaId: "123",
//     projectId: "123",
//     project: {
//       accessibility: {
//         visibility: ProjectVisibility.Public,
//       },
//       alias: "123",
//       createdAt: new Date(),
//       description: "123",
//       id: "123",
//       license: "123",
//       name: "123",
//       readme: "123",
//       updatedAt: new Date(),
//       workspaceId: "123",
//     },
//     __typename: "Model",
//   };

//   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//   return fromGraphQLModel(expectedSchemaRaw)!;
// }

// // function getTestSchema(fields: Field[]): Model {
// //   return {
// //     id: "",
// //     name: "",
// //     description: "",
// //     key: "",
// //     schemaId: "",
// //     schema: { id: "", fields },
// //     metadataSchema: {},
// //   };
// // }

// describe("Testing schema & content import from static files", () => {
//   describe("Validate schema data from static files", () => {
//     test("Validate schema from JSON file", async () => {
//       const result = await readFromJSONFile<Record<string, unknown>>(
//         Constant.PUBLIC_FILE.IMPORT_SCHEMA_JSON,
//       );

//       expect(result.isValid).toBe(true);

//       if (!result.isValid) return;

//       const validation = ImportUtils.validateSchemaFromJSON(result.data);

//       expect(validation.isValid).toBe(true);
//     });

//     describe("Validate field type from schema", () => {});

//     describe("Validate multiple from schema", () => {});

//     describe("Validate text fields with default value and maxLength from schema", () => {});

//     describe("Validate number fields with default value, min, max from schema", () => {});
//   });

//   describe("Validate content data from static files", () => {
//     const expectedSchema = getExpectedSchema();

//     // describe("Validate CSV files", () => {
//     //   test("Pass case: records below limit, fields match", async () => {
//     //     const csvString = readFromCSVFile(Constant.PUBLIC_FILE.IMPORT_CONTENT_CSV);

//     //     const csvValidation = await ImportUtils.convertCSVToJSON(csvString);

//     //     expect(csvValidation.isValid).toBe(true);

//     //     if (!csvValidation.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromCSV(
//     //       csvValidation.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(true);
//     //   });

//     //   test("Fail case: records above limit, fields mismatch", async () => {
//     //     const csvString = readFromCSVFile(
//     //       Constant.TEST_FILE.TEST_IMPORT_CONTENT_CSV_ABOVE_LIMIT_MISMATCH,
//     //       "src",
//     //     );

//     //     const csvValidation = await ImportUtils.convertCSVToJSON(csvString);

//     //     expect(csvValidation.isValid).toBe(true);

//     //     if (!csvValidation.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromCSV(
//     //       csvValidation.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(false);

//     //     if (contentValidation.isValid) return;

//     //     expect(contentValidation.error.exceedLimit).toBe(true);
//     //     expect(contentValidation.error.typeMismatchFieldKeys.size).toBeGreaterThan(0);
//     //   });

//     //   test("Fail case: records above limit, fields match", async () => {
//     //     const csvString = readFromCSVFile(
//     //       Constant.TEST_FILE.TEST_IMPORT_CONTENT_CSV_ABOVE_LIMIT_MATCH,
//     //       "src",
//     //     );

//     //     const csvValidation = await ImportUtils.convertCSVToJSON(csvString);

//     //     expect(csvValidation.isValid).toBe(true);

//     //     if (!csvValidation.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromCSV(
//     //       csvValidation.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(false);

//     //     if (contentValidation.isValid) return;

//     //     expect(contentValidation.error.exceedLimit).toBe(true);
//     //     expect(contentValidation.error.typeMismatchFieldKeys.size).toBe(0);
//     //   });

//     //   test("Fail case: records below limit, fields mismatch", async () => {
//     //     const csvString = readFromCSVFile(
//     //       Constant.TEST_FILE.TEST_IMPORT_CONTENT_CSV_BELOW_LIMIT_MISMATCH,
//     //       "src",
//     //     );

//     //     const csvValidation = await ImportUtils.convertCSVToJSON(csvString);

//     //     expect(csvValidation.isValid).toBe(true);

//     //     if (!csvValidation.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromCSV(
//     //       csvValidation.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(false);

//     //     if (contentValidation.isValid) return;

//     //     expect(contentValidation.error.exceedLimit).toBe(false);
//     //     expect(contentValidation.error.typeMismatchFieldKeys.size).toBeGreaterThan(0);
//     //   });

//     //   test("Fail case: records below limit, fields no match", async () => {
//     //     const result = readFromCSVFile(
//     //       Constant.TEST_FILE.TEST_IMPORT_CONTENT_CSV_BELOW_LIMIT_NOMATCH,
//     //       "src",
//     //     );

//     //     const csvValidation = await ImportUtils.convertCSVToJSON(result);

//     //     expect(csvValidation.isValid).toBe(true);

//     //     if (!csvValidation.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromCSV(
//     //       csvValidation.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(false);

//     //     if (contentValidation.isValid) return;

//     //     expect(contentValidation.error.exceedLimit).toBe(false);
//     //     expect(contentValidation.error.typeMismatchFieldKeys.size).toEqual(
//     //       contentValidation.error.modelFieldCount,
//     //     );
//     //   });
//     // });

//     describe("Validate JSON files", () => {
//       test("Pass case: records below limit | fields match | value in range", async () => {
//         const result = await readFromJSONFile<ImportContentJSON>(
//           Constant.PUBLIC_FILE.IMPORT_CONTENT_JSON,
//         );

//         expect(result.isValid).toBe(true);

//         if (!result.isValid) return;

//         const contentValidation = await ImportUtils.validateContentFromJSON(
//           result.data,
//           expectedSchema.schema.fields,
//           Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//         );
//         expect(contentValidation.isValid).toBe(true);
//       });

//       test("Fail case: records above limit | field key mismatch | value in range", async () => {
//         const result = await readFromJSONFile<ImportContentJSON>(
//           Constant.TEST_FILE.IMPORT_CONTENT_JSON_ABOVE_LIMIT_KEY_MISMATCH,
//           "src",
//         );

//         expect(result.isValid).toBe(true);

//         if (!result.isValid) return;

//         const contentValidation = await ImportUtils.validateContentFromJSON(
//           result.data,
//           expectedSchema.schema.fields,
//           Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//         );

//         expect(contentValidation.isValid).toBe(false);

//         if (contentValidation.isValid) return;

//         expect(contentValidation.error.exceedLimit).toBe(true);
//         expect(contentValidation.error.missedFieldKeys.size).toBeGreaterThan(0);
//         expect(contentValidation.error.outOfRangeFieldKeys.size).toEqual(0);
//         expect(contentValidation.error.typeMismatchFieldKeys.size).toEqual(0);
//       });

//       test("Fail case: records above limit | fields all match | value in range", async () => {
//         const result = await readFromJSONFile<ImportContentJSON>(
//           Constant.TEST_FILE.IMPORT_CONTENT_JSON_ABOVE_LIMIT_ALL_MATCH,
//           "src",
//         );

//         expect(result.isValid).toBe(true);

//         if (!result.isValid) return;

//         const contentValidation = await ImportUtils.validateContentFromJSON(
//           result.data,
//           expectedSchema.schema.fields,
//           Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//         );

//         expect(contentValidation.isValid).toBe(false);

//         if (contentValidation.isValid) return;

//         expect(contentValidation.error.exceedLimit).toBe(true);
//         expect(contentValidation.error.typeMismatchFieldKeys.size).toEqual(0);
//         expect(contentValidation.error.outOfRangeFieldKeys.size).toEqual(0);
//         expect(contentValidation.error.illegalFieldKeys.size).toEqual(0);
//         expect(contentValidation.error.missedFieldKeys.size).toEqual(0);
//       });

//       test("Fail case: records below limit | fields key mismatch | value in range", async () => {
//         const result = await readFromJSONFile<ImportContentJSON>(
//           Constant.TEST_FILE.IMPORT_CONTENT_JSON_BELOW_LIMIT_KEY_MISMATCH_IN_RANGE,
//           "src",
//         );

//         expect(result.isValid).toBe(true);

//         if (!result.isValid) return;

//         const contentValidation = await ImportUtils.validateContentFromJSON(
//           result.data,
//           expectedSchema.schema.fields,
//           Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//         );

//         expect(contentValidation.isValid).toBe(false);

//         if (contentValidation.isValid) return;

//         console.log("contentValidation.error", contentValidation.error);

//         expect(contentValidation.error.exceedLimit).toBe(false);
//         expect(contentValidation.error.typeMismatchFieldKeys.size).toEqual(0);
//         expect(contentValidation.error.outOfRangeFieldKeys).toEqual(0);
//         expect(contentValidation.error.illegalFieldKeys).toBeGreaterThan(0);
//         expect(contentValidation.error.missedFieldKeys).toBeGreaterThan(0);
//       });

//       test("Fail case: records below limit, fields no match", async () => {
//         const result = await readFromJSONFile<ImportContentJSON>(
//           Constant.TEST_FILE.IMPORT_CONTENT_JSON_BELOW_LIMIT_NO_KEY_MATCH,
//           "src",
//         );

//         expect(result.isValid).toBe(true);

//         if (!result.isValid) return;

//         const contentValidation = await ImportUtils.validateContentFromJSON(
//           result.data,
//           expectedSchema.schema.fields,
//           Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//         );

//         expect(contentValidation.isValid).toBe(false);

//         if (contentValidation.isValid) return;

//         expect(contentValidation.error.exceedLimit).toBe(false);
//         expect(contentValidation.error.missedFieldKeys).toEqual(
//           contentValidation.error.legalFieldKeys,
//         );
//       });

//       test("Fail case: records below limit, fields match, out of range", async () => {
//         const result = await readFromJSONFile<ImportContentJSON>(
//           Constant.TEST_FILE.IMPORT_CONTENT_JSON_BELOW_LIMIT_MATCH_OUT_OF_RANGE,
//           "src",
//         );

//         expect(result.isValid).toBe(true);

//         if (!result.isValid) return;

//         const contentValidation = await ImportUtils.validateContentFromJSON(
//           result.data,
//           expectedSchema.schema.fields,
//           Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//         );

//         expect(contentValidation.isValid).toBe(false);

//         if (contentValidation.isValid) return;

//         expect(contentValidation.error.exceedLimit).toBe(false);
//         expect(contentValidation.error.typeMismatchFieldKeys.size).toEqual(
//           contentValidation.error.modelFieldCount,
//         );
//       });

//       describe("Control variable: field key", () => {
//         test("Pass case: all field keys match", async () => {
//           const result = await readFromJSONFile<ImportContentJSON>(
//             Constant.TEST_FILE.IMPORT_CONTENT_JSON_ALL_FIELD_KEYS_MATCH,
//             "src",
//           );

//           expect(result.isValid).toBe(true);

//           if (!result.isValid) return;

//           const contentValidation = await ImportUtils.validateContentFromJSON(
//             result.data,
//             expectedSchema.schema.fields,
//             Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//           );
//           expect(contentValidation.isValid).toBe(true);

//           if (contentValidation.isValid) return;

//           const {
//             exceedLimit,
//             typeMismatchFieldKeys,
//             outOfRangeFieldKeys,
//             missedFieldKeys,
//             illegalFieldKeys,
//           } = contentValidation.error;

//           expect(exceedLimit).toBe(false);
//           expect(typeMismatchFieldKeys.size).toEqual(0);
//           expect(outOfRangeFieldKeys.size).toEqual(0);
//           expect(missedFieldKeys.size).toEqual(0);
//           expect(illegalFieldKeys.size).toEqual(0);
//         });

//         test.only("Fail case: text field key mismatch", async () => {
//           const modelFields: Field[] = [
//             {
//               id: "",
//               type: SchemaFieldType.Text,
//               title: "text-1",
//               key: "text-1",
//               description: "",
//               required: false,
//               unique: false,
//               isTitle: false,
//               multiple: false,
//               typeProperty: {},
//             },
//           ];

//           // console.log("expectedSchema", JSON.stringify(expectedSchema, null, 2));

//           const result = await readFromJSONFile<ImportContentJSON>(
//             Constant.TEST_FILE.IMPORT_CONTENT_JSON_TEXT_FIELD_KEY_MISMATCH,
//             "src",
//           );

//           expect(result.isValid).toBe(true);

//           if (!result.isValid) return;

//           const contentValidation = await ImportUtils.validateContentFromJSON(
//             result.data,
//             modelFields,
//             Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//           );
//           expect(contentValidation.isValid).toBe(false);

//           console.log("contentValidation", contentValidation);

//           if (contentValidation.isValid) return;

//           const {
//             exceedLimit,
//             typeMismatchFieldKeys,
//             outOfRangeFieldKeys,
//             missedFieldKeys,
//             illegalFieldKeys,
//             legalFieldKeys,
//           } = contentValidation.error;

//           expect(exceedLimit).toBe(false);
//           expect(typeMismatchFieldKeys.size).toEqual(0);
//           expect(outOfRangeFieldKeys.size).toEqual(0);
//           expect(missedFieldKeys).toEqual(legalFieldKeys);
//           expect(illegalFieldKeys.size).toEqual(0);
//         });
//       });
//     });

//     // describe("Validate GeoJSON files", () => {
//     //   test("Pass case: records below limit, fields match", async () => {
//     //     const result = await readFromJSONFile<FeatureCollection>(
//     //       Constant.PUBLIC_FILE.IMPORT_CONTENT_GEO_JSON,
//     //     );

//     //     expect(result.isValid).toBe(true);

//     //     if (!result.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromGeoJson(
//     //       result.data,
//     //       expectedSchema.schema.fields,
//     //     );
//     //     expect(contentValidation.isValid).toBe(true);
//     //   });

//     //   test("Fail case: records above limit, fields mismatch", async () => {
//     //     const result = await readFromJSONFile<FeatureCollection>(
//     //       Constant.TEST_FILE.TEST_IMPORT_CONTENT_GEO_JSON_ABOVE_LIMIT_MISMATCH,
//     //       "src",
//     //     );

//     //     expect(result.isValid).toBe(true);

//     //     if (!result.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromGeoJson(
//     //       result.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(false);

//     //     if (contentValidation.isValid) return;

//     //     expect(contentValidation.error.exceedLimit).toBe(true);
//     //     expect(contentValidation.error.typeMismatchFieldKeys.size).toBeGreaterThan(0);
//     //   });

//     //   test("Fail case: records above limit, fields match", async () => {
//     //     const result = await readFromJSONFile<FeatureCollection>(
//     //       Constant.TEST_FILE.TEST_IMPORT_CONTENT_GEO_JSON_ABOVE_LIMIT_MATCH,
//     //       "src",
//     //     );

//     //     expect(result.isValid).toBe(true);

//     //     if (!result.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromGeoJson(
//     //       result.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(false);

//     //     if (contentValidation.isValid) return;

//     //     expect(contentValidation.error.exceedLimit).toBe(true);
//     //     expect(contentValidation.error.typeMismatchFieldKeys.size).toBe(0);
//     //   });

//     //   test("Fail case: records below limit, fields mismatch", async () => {
//     //     const result = await readFromJSONFile<FeatureCollection>(
//     //       Constant.TEST_FILE.TEST_IMPORT_CONTENT_GEO_JSON_BELOW_LIMIT_MISMATCH,
//     //       "src",
//     //     );

//     //     expect(result.isValid).toBe(true);

//     //     if (!result.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromGeoJson(
//     //       result.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(false);

//     //     if (contentValidation.isValid) return;

//     //     expect(contentValidation.error.exceedLimit).toBe(false);
//     //     expect(contentValidation.error.typeMismatchFieldKeys.size).toBeGreaterThan(0);
//     //   });

//     //   test("Fail case: records below limit, fields no match", async () => {
//     //     const result = await readFromJSONFile<FeatureCollection>(
//     //       Constant.TEST_FILE.TEST_IMPORT_CONTENT_GEO_JSON_BELOW_LIMIT_NOMATCH,
//     //       "src",
//     //     );

//     //     expect(result.isValid).toBe(true);

//     //     if (!result.isValid) return;

//     //     const contentValidation = await ImportUtils.validateContentFromGeoJson(
//     //       result.data,
//     //       expectedSchema.schema.fields,
//     //       Constant.IMPORT.TEST_MAX_CONTENT_RECORDS,
//     //     );

//     //     expect(contentValidation.isValid).toBe(false);

//     //     if (contentValidation.isValid) return;

//     //     expect(contentValidation.error.exceedLimit).toBe(false);
//     //     expect(contentValidation.error.typeMismatchFieldKeys.size).toEqual(
//     //       contentValidation.error.modelFieldCount,
//     //     );
//     //   });
//     // });
//   });

//   describe.skip("Test convertCSVToJSON method", () => {
//     test("Fail case: illegal CSV string", async () => {
//       const illegalCSVString = `name,age,city
//         "John Doe,25,New York
//         Jane Smith,30,Boston`;

//       const result = await ImportUtils.convertCSVToJSON(illegalCSVString);
//       expect(result.isValid).toBe(false);
//     });

//     test("Pass case: legal CSV string", async () => {
//       const illegalCSVString = `name,age,city,occupation
//       "John Doe",25,"New York","Software Engineer"
//       "Jane Smith",30,Boston,"Data Analyst"
//       Bob Johnson,35,"Los Angeles",Designer
//       "Alice ""Al"" Williams",28,Chicago,"Product Manager"
//       Michael Brown,42,Seattle,Consultant
//       "Sarah Davis",31,"San Francisco","UX Researcher"`;

//       const result = await ImportUtils.convertCSVToJSON(illegalCSVString);
//       expect(result.isValid).toBe(false);
//     });
//   });
// });
