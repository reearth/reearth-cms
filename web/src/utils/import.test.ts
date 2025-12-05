import { readFileSync } from "fs";
import { join } from "path";

import { FeatureCollection } from "geojson";
import { expect, test, describe } from "vitest";

import { Model } from "@reearth-cms/components/molecules/Model/types";
import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import {
  GeometryEditorSupportedType,
  GeometryObjectSupportedType,
  Model as GQLModel,
  Maybe,
  ProjectVisibility,
  SchemaFieldType,
} from "@reearth-cms/gql/graphql-client-api";
import { ImportContentJSON, ImportUtils } from "@reearth-cms/utils/import";

import { Constant } from "./constant";
import { ObjectUtils } from "./object";

async function readFromJSONFile<T>(
  staticFileDirectory: string,
): Promise<ReturnType<typeof ObjectUtils.safeJSONParse<T>>> {
  const filePath = join("public", staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  return await ObjectUtils.safeJSONParse(fileContent);
}

function readFromCSVFile(staticFileDirectory: string): string {
  const filePath = join("public", staticFileDirectory);
  const fileContent = readFileSync(filePath, "utf-8");

  return fileContent;
}

function getExpectedSchema(): Model {
  const expectedSchemaRaw: Maybe<GQLModel> = {
    id: "01k9ry649rr9kcehhz005mj00b",
    name: "grand-slam-model",
    description: "",
    key: "grand-slam-model",
    order: 2,
    metadataSchema: null,
    schema: {
      id: "01k9ry649ppgb2qgszje5rgv8z",
      fields: [
        {
          id: "01k9ry6gms30f3wym0sx9fgpa6",
          type: SchemaFieldType.Text,
          title: "text-1",
          key: "text-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 0,
          typeProperty: {
            defaultValue: null,
            maxLength: null,
            __typename: "SchemaFieldText",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ry6pm7wg46hszyp6kve53v",
          type: SchemaFieldType.TextArea,
          title: "textarea-1",
          key: "textarea-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 1,
          typeProperty: {
            defaultValue: null,
            maxLength: null,
            __typename: "SchemaFieldTextArea",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ry6xg4a11qaks06gzxhj6g",
          type: SchemaFieldType.MarkdownText,
          title: "markdown-text-1",
          key: "markdown-text-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 2,
          typeProperty: {
            defaultValue: null,
            maxLength: null,
            __typename: "SchemaFieldMarkdown",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ry71xzxdvztsbn3yvx09gy",
          type: SchemaFieldType.Asset,
          title: "asset-1",
          key: "asset-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 3,
          typeProperty: {
            defaultValue: null,
            __typename: "SchemaFieldAsset",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ry779cs6ygm9kjv7kvxqhy",
          type: SchemaFieldType.Date,
          title: "date-1",
          key: "date-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 4,
          typeProperty: {
            defaultValue: null,
            __typename: "SchemaFieldDate",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ryg4k0twrwxjezevd85rbz",
          type: SchemaFieldType.Bool,
          title: "boolean-1",
          key: "boolean-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 5,
          typeProperty: {
            defaultValue: null,
            __typename: "SchemaFieldBool",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ryh4dhhbqxjxtctnz3ghng",
          type: SchemaFieldType.Select,
          title: "option-1",
          key: "option-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 6,
          typeProperty: {
            defaultValue: null,
            values: ["a", "b", "c"],
            __typename: "SchemaFieldSelect",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ryhe9q15w5cy8fn85j01fn",
          type: SchemaFieldType.Integer,
          title: "int-1",
          key: "int-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 7,
          typeProperty: {
            defaultValue: null,
            min: null,
            max: null,
            __typename: "SchemaFieldInteger",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ryhjm6jjnagwkm92x5mrh6",
          type: SchemaFieldType.Number,
          title: "float-1",
          key: "float-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 8,
          typeProperty: {
            defaultValue: null,
            min: null,
            max: null,
            __typename: "SchemaFieldNumber",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9ryhph440rrfby12293sv63",
          type: SchemaFieldType.Url,
          title: "url-1",
          key: "url-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 9,
          typeProperty: {
            defaultValue: null,
            __typename: "SchemaFieldURL",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9rykccz2ernve1d79vt1phr",
          type: SchemaFieldType.GeometryObject,
          title: "geo-obj-1",
          key: "geo-obj-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 13,
          typeProperty: {
            defaultValue: null,
            supportedTypes: [GeometryObjectSupportedType.Point],
            __typename: "SchemaFieldGeometryObject",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
        {
          id: "01k9rykjf6qmkt3vxjt78cc6mb",
          type: SchemaFieldType.GeometryEditor,
          title: "geo-editor-1",
          key: "geo-editor-1",
          description: "",
          required: false,
          unique: false,
          isTitle: false,
          multiple: false,
          order: 14,
          typeProperty: {
            defaultValue: null,
            supportedTypes: [GeometryEditorSupportedType.Point],
            __typename: "SchemaFieldGeometryEditor",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          __typename: "SchemaField",
        },
      ],
      projectId: "123",
      project: {
        accessibility: {
          visibility: ProjectVisibility.Public,
        },
        alias: "123",
        createdAt: new Date(),
        description: "123",
        id: "123",
        license: "123",
        name: "123",
        readme: "123",
        updatedAt: new Date(),
        workspaceId: "123",
      },
      __typename: "Schema",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    schemaId: "123",
    projectId: "123",
    project: {
      accessibility: {
        visibility: ProjectVisibility.Public,
      },
      alias: "123",
      createdAt: new Date(),
      description: "123",
      id: "123",
      license: "123",
      name: "123",
      readme: "123",
      updatedAt: new Date(),
      workspaceId: "123",
    },
    __typename: "Model",
  };

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return fromGraphQLModel(expectedSchemaRaw)!;
}

describe("Testing schema & content import from static files", () => {
  describe("Validate schema data from static files", () => {
    test("Validate schema from JSON file", async () => {
      const result = await readFromJSONFile<Record<string, unknown>>(
        Constant.PUBLIC_FILE.IMPORT_SCHEMA_JSON,
      );

      expect(result.isValid).toBe(true);

      if (result.isValid) {
        const parsedData = ImportUtils.validateSchemaFromJSON(result.data);
        expect(parsedData.isValid).toBe(true);
      }
    });
  });

  describe("Validate content data from static files", () => {
    const expectedSchema = getExpectedSchema();

    test("Validate CSV file", async () => {
      const csvString = readFromCSVFile(Constant.PUBLIC_FILE.IMPORT_CONTENT_CSV);

      const csvValidation = await ImportUtils.convertCSVToJSON(csvString);

      expect(csvValidation.isValid).toBe(true);

      if (!csvValidation.isValid) return;

      const contentValidation = await ImportUtils.validateContentFromCSV(
        csvValidation.data,
        expectedSchema.schema.fields,
      );

      expect(contentValidation.isValid).toBe(true);
    });

    test("Validate JSON file", async () => {
      const result = await readFromJSONFile<ImportContentJSON>(
        Constant.PUBLIC_FILE.IMPORT_CONTENT_JSON,
      );

      expect(result.isValid).toBe(true);

      if (result.isValid) {
        const contentValidation = await ImportUtils.validateContentFromJSON(
          result.data,
          expectedSchema.schema.fields,
        );
        expect(contentValidation.isValid).toBe(true);
      }
    });

    test("Validate GeoJSON file", async () => {
      const result = await readFromJSONFile<FeatureCollection>(
        Constant.PUBLIC_FILE.IMPORT_CONTENT_GEO_JSON,
      );

      expect(result.isValid).toBe(true);

      if (result.isValid) {
        const contentValidation = await ImportUtils.validateContentFromGeoJson(
          result.data,
          expectedSchema.schema.fields,
        );
        expect(contentValidation.isValid).toBe(true);
      }
    });
  });

  describe("Test convertCSVToJSON method", () => {
    test.skip("Test illegal CSV string", async () => {
      const illegalCSVString = `name,age,city
        "John Doe,25,New York
        Jane Smith,30,Boston`;

      try {
        await ImportUtils.convertCSVToJSON(illegalCSVString);
        // throw Error(JSON.stringify(result, null, 2));
      } catch (error) {
        throw Error(String(error));
      }
    });

    test("Test legal CSV string", async () => {
      const illegalCSVString = `name,age,city,occupation
      "John Doe",25,"New York","Software Engineer"
      "Jane Smith",30,Boston,"Data Analyst"
      Bob Johnson,35,"Los Angeles",Designer
      "Alice ""Al"" Williams",28,Chicago,"Product Manager"
      Michael Brown,42,Seattle,Consultant
      "Sarah Davis",31,"San Francisco","UX Researcher"`;

      try {
        await ImportUtils.convertCSVToJSON(illegalCSVString);
      } catch (error) {
        throw Error(String(error));
      }
    });
  });
});
