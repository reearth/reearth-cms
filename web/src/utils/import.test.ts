import { GeoJSON } from "geojson";
import { expect, test, describe } from "vitest";

import { fromGraphQLModel } from "@reearth-cms/components/organisms/DataConverters/model";
import { Model as GQLModel } from "@reearth-cms/gql/graphql-client-api";
import { ImportContentJSON, ImportUtils } from "@reearth-cms/utils/import";

describe("Testing schema & content import from static files", () => {
  describe("Validate schema data from static files", () => {
    test("Validate schema from JSON file", () => {
      const IMPORT_DATA: Record<string, unknown> = {
        $id: "01kb1tnfhs2c834tzpwgcsmyft",
        $schema: "https://json-schema.org/draft/2020-12/schema",
        title: "grand-slam-model",
        type: "object",
        properties: {
          "asset-1": {
            title: "asset-1",
            description: "asset 1 desc",
            type: "string",
            format: "binary",
          },
          "bool-1": {
            title: "bool-1",
            description: "bool 1 desc",
            type: "boolean",
          },
          "date-1": {
            title: "date-1",
            description: "date 1 desc",
            type: "string",
            format: "date-time",
          },
          "float-1": {
            title: "float-1",
            description: "float 1 desc",
            type: "number",
            maximum: 0.5,
            minimum: -0.5,
          },
          "geo-edi-1": {
            title: "geo-edi-1",
            description: "geo edi 1 desc",
            type: "object",
          },
          "geo-obj-1": {
            title: "geo-obj-1",
            description: "geo obj 1 desc",
            type: "object",
          },
          "int-1": {
            title: "int-1",
            description: "int 1 desc",
            type: "integer",
            maximum: 10,
            minimum: -10,
          },
          "markdown-1": {
            title: "markdown-1",
            description: "markdown 1 desc",
            type: "string",
            maxLength: 500,
          },
          "model-ref-1": {
            title: "model-ref-1",
            description: "model ref 1 desc",
            type: "string",
          },
          "opt-1": {
            title: "opt-1",
            description: "opt 1 desc",
            type: "string",
          },
          "text-1": {
            title: "text-1",
            description: "text desc 1",
            type: "string",
            maxLength: 32,
          },
          "textarea-1": {
            title: "textarea-1",
            description: "textarea 1 desc",
            type: "string",
            maxLength: 150,
          },
          "url-1": {
            title: "url-1",
            description: "url 1 desc",
            type: "string",
            format: "uri",
          },
        },
      };

      const parsedData = ImportUtils.parseImportSchema(IMPORT_DATA);

      expect(parsedData.isValid).toBe(true);
    });
  });

  describe("Validate content data from static files", () => {
    const RAW_SCHEMA = {
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
            type: "Text",
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
            __typename: "SchemaField",
          },
          {
            id: "01k9ry6pm7wg46hszyp6kve53v",
            type: "TextArea",
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
            __typename: "SchemaField",
          },
          {
            id: "01k9ry6xg4a11qaks06gzxhj6g",
            type: "MarkdownText",
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
            __typename: "SchemaField",
          },
          {
            id: "01k9ry71xzxdvztsbn3yvx09gy",
            type: "Asset",
            title: "asset-1",
            key: "asset-1",
            description: "",
            required: false,
            unique: false,
            isTitle: false,
            multiple: false,
            order: 3,
            typeProperty: {
              assetDefaultValue: null,
              __typename: "SchemaFieldAsset",
            },
            __typename: "SchemaField",
          },
          {
            id: "01k9ry779cs6ygm9kjv7kvxqhy",
            type: "Date",
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
            __typename: "SchemaField",
          },
          {
            id: "01k9ryg4k0twrwxjezevd85rbz",
            type: "Bool",
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
            __typename: "SchemaField",
          },
          {
            id: "01k9ryh4dhhbqxjxtctnz3ghng",
            type: "Select",
            title: "option-1",
            key: "option-1",
            description: "",
            required: false,
            unique: false,
            isTitle: false,
            multiple: false,
            order: 6,
            typeProperty: {
              selectDefaultValue: null,
              values: ["a", "b", "c"],
              __typename: "SchemaFieldSelect",
            },
            __typename: "SchemaField",
          },
          {
            id: "01k9ryhe9q15w5cy8fn85j01fn",
            type: "Integer",
            title: "int-1",
            key: "int-1",
            description: "",
            required: false,
            unique: false,
            isTitle: false,
            multiple: false,
            order: 7,
            typeProperty: {
              integerDefaultValue: null,
              min: null,
              max: null,
              __typename: "SchemaFieldInteger",
            },
            __typename: "SchemaField",
          },
          {
            id: "01k9ryhjm6jjnagwkm92x5mrh6",
            type: "Number",
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
              numberMin: null,
              numberMax: null,
              __typename: "SchemaFieldNumber",
            },
            __typename: "SchemaField",
          },
          {
            id: "01k9ryhph440rrfby12293sv63",
            type: "URL",
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
            __typename: "SchemaField",
          },
          {
            id: "01k9ryhzagqnsp97rryxtc47s0",
            type: "Reference",
            title: "ref-1",
            key: "ref-1",
            description: "",
            required: false,
            unique: false,
            isTitle: false,
            multiple: false,
            order: 10,
            typeProperty: {
              modelId: "01k49j9ntrvsewj7r18jz3yb72",
              schema: {
                id: "01k49j9ntjqkt2dbfy3r7aa64m",
                titleFieldId: null,
                __typename: "Schema",
              },
              correspondingField: null,
              __typename: "SchemaFieldReference",
            },
            __typename: "SchemaField",
          },
          {
            id: "01k9ryjd30a2m8e53eg1wp3h2g",
            type: "Reference",
            title: "ref-2",
            key: "ref-2",
            description: "",
            required: false,
            unique: false,
            isTitle: false,
            multiple: false,
            order: 11,
            typeProperty: {
              modelId: "01k49jc5d6j34e24vzgf3k4zzk",
              schema: {
                id: "01k49jc5d59m509hpxk6h3d3vm",
                titleFieldId: null,
                __typename: "Schema",
              },
              correspondingField: {
                id: "01k9ryjd33cca2vd3s54w0j2p7",
                type: "Reference",
                title: "ref-3",
                key: "ref-3",
                description: "",
                required: false,
                unique: false,
                multiple: false,
                order: 0,
                __typename: "SchemaField",
              },
              __typename: "SchemaFieldReference",
            },
            __typename: "SchemaField",
          },
          {
            id: "01k9ryk5dehacaregcg3adrc27",
            type: "Group",
            title: "group-1",
            key: "group-1",
            description: "",
            required: false,
            unique: false,
            isTitle: false,
            multiple: false,
            order: 12,
            typeProperty: {
              groupId: "01k9ry5gq0nabx9xt6az6rhfs0",
              __typename: "SchemaFieldGroup",
            },
            __typename: "SchemaField",
          },
          {
            id: "01k9rykccz2ernve1d79vt1phr",
            type: "GeometryObject",
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
              objectSupportedTypes: ["POINT"],
              __typename: "SchemaFieldGeometryObject",
            },
            __typename: "SchemaField",
          },
          {
            id: "01k9rykjf6qmkt3vxjt78cc6mb",
            type: "GeometryEditor",
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
              editorSupportedTypes: ["POINT"],
              __typename: "SchemaFieldGeometryEditor",
            },
            __typename: "SchemaField",
          },
        ],
        __typename: "Schema",
      },
      __typename: "Model",
    } as GQLModel;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const targetSchema = fromGraphQLModel(RAW_SCHEMA)!;

    test("Validate CSV file", () => {
      const IMPORT_CSV_DATA = `id,text-1,textarea-1,markdown-text-1,date-1,boolean-1,option-1,int-1,float-1,url-1
        01kbchbvncejahmwrdbf8p74jc,text111,textarea111,markdown111,2025-12-01T00:00:00+09:00,true,a,111,1.11,http://111.com/
        01kbchecynpjwddn60ng4dqvax,text2,textarea2,markdown2,2025-12-02T00:00:00+09:00,,b,222,2.22,http://222.com/`;

      const validation = ImportUtils.validateContentFromCSV(IMPORT_CSV_DATA, targetSchema);

      expect(validation.isValid).toBe(true);
    });

    test("Validate JSON file", () => {
      const IMPORT_JSON_DATA: ImportContentJSON = {
        results: [
          {
            "boolean-1": true,
            "date-1": "2025-12-01T00:00:00+09:00",
            "float-1": 1.11,
            "geo-obj-1": {
              coordinates: [139.6917, 35.6895],
              type: "Point",
            },
            id: "01kbchbvncejahmwrdbf8p74jc",
            "int-1": 111,
            "markdown-text-1": "markdown111",
            "option-1": "a",
            "text-1": "text111",
            "textarea-1": "textarea111",
            "url-1": "http://111.com/",
          },
          {
            "date-1": "2025-12-02T00:00:00+09:00",
            "float-1": 2.22,
            "geo-obj-1": {
              coordinates: [139.6917, 35.6895],
              type: "Point",
            },
            id: "01kbchecynpjwddn60ng4dqvax",
            "int-1": 222,
            "markdown-text-1": "markdown2",
            "option-1": "b",
            "text-1": "text2",
            "textarea-1": "textarea2",
            "url-1": "http://222.com/",
          },
        ],
        totalCount: 2,
      };

      const validation = ImportUtils.validateContentFromJSON(IMPORT_JSON_DATA, targetSchema);

      expect(validation.isValid).toBe(true);
    });

    test("Validate GeoJSON file", () => {
      const IMPORT_GEO_JSON_DATA: GeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            geometry: {
              coordinates: [139.6917, 35.6895],
              type: "Point",
            },
            id: "01kbchbvncejahmwrdbf8p74jc",
            properties: {
              "text-1": "text111",
              "textarea-1": "textarea111",
              "markdown-text-1": "markdown111",
              "asset-1": {
                id: "01k9v5yedaf8n2efqjt4e4b4jp",
                url: "",
                type: "asset",
              },
              "date-1": "2025-12-01T00:00:00+09:00",
              "boolean-1": true,
              "option-1": "a",
              "int-1": 111,
              "float-1": 1.11,
              "url-1": "http://111.com/",
            },
            type: "Feature",
          },
          {
            geometry: {
              coordinates: [139.6917, 35.6895],
              type: "Point",
            },
            id: "01kbchecynpjwddn60ng4dqvax",
            properties: {
              "text-1": "text2",
              "textarea-1": "textarea2",
              "markdown-text-1": "markdown2",
              "asset-1": {
                id: "01k9tyv0axrvrm8x638bgdy59z",
                url: "",
                type: "asset",
              },
              "date-1": "2025-12-02T00:00:00+09:00",
              "option-1": "b",
              "int-1": 222,
              "float-1": 2.22,
              "url-1": "http://222.com/",
            },
            type: "Feature",
          },
        ],
      };

      const validation = ImportUtils.validateContentFromGeoJson(IMPORT_GEO_JSON_DATA, targetSchema);

      expect(validation.isValid).toBe(true);
    });
  });
});
