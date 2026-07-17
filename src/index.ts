import "dotenv/config";
import type * as GristCallApi from "./GristCallApi";
import {
  formateGristCellTypeForTypescript,
  isGristCellType,
  isHiddenColType,
} from "./GristMapping";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const GRIST_BASE_URL = "https://grist.numerique.gouv.fr/api/docs";
const GRIST_TABLES_COLUMN_TABLE = "_grist_Tables_column";
const GENERATED_DIR = join(process.cwd(), "src", "generated");
const OUTPUT_FILE = join(GENERATED_DIR, "Table.ts");

async function fetchTableColumns(): Promise<GristCallApi.GristTablesColumn> {
  const docId = process.env.GRIST_DOC_ID;
  const apiKey = process.env.GRIST_API_KEY;
  if (!docId) {
    throw new Error(
      "Missing GRIST_DOC_ID environment variable. Please set it to your Grist document ID.",
    );
  }

  const url = `${GRIST_BASE_URL}/${docId}/tables/${GRIST_TABLES_COLUMN_TABLE}/records`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    const statusMessage = `${response.status} ${response.statusText}`;
    if (response.status === 401) {
      throw new Error(
        `Authentication failed (${statusMessage}). Check that your GRIST_API_KEY is valid.`,
      );
    }
    if (response.status === 403) {
      throw new Error(
        `Access denied (${statusMessage}). Check that GRIST_DOC_ID is correct and your API key has permission to access it.`,
      );
    }
    if (response.status === 404) {
      throw new Error(
        `Document not found (${statusMessage}). Check that GRIST_DOC_ID is correct.`,
      );
    }
    throw new Error(
      `Failed to fetch Grist tables (${statusMessage}). Check your network connection and Grist server status.`,
    );
  }

  return (await response.json()) as GristCallApi.GristTablesColumn;
}

function transformRecordsToFields(
  records: GristCallApi.GristTablesColumn["records"],
): Array<{ colId: string; type: string }> {
  if (!records || records.length === 0) {
    throw new Error(
      `No column records found in Grist table "${GRIST_TABLES_COLUMN_TABLE}". The table may be empty or the document may not have any columns defined.`,
    );
  }

  const fields = records
    .filter((record) => !isHiddenColType(record.fields.type))
    .map((record) => {
      const { type, colId } = record.fields;

      if (!isGristCellType(type)) {
        throw new Error(
          `Unsupported Grist column type "${type}" for column "${colId}". ` +
            `Please check that all columns use supported types or update GristMapping to handle this type.`,
        );
      }

      return {
        colId,
        type: formateGristCellTypeForTypescript(type),
      };
    });

  if (fields.length === 0) {
    throw new Error(
      `No usable column fields found after filtering. All columns may be hidden system columns. ` +
        `Check your Grist document structure or filtering logic in isHiddenColType.`,
    );
  }

  return fields;
}

function generateTypeFile(
  fields: Array<{ colId: string; type: string }>,
): string {
  const fieldLines = fields.map(
    ({ colId, type }) =>
      `  ${colId}: GristTypeColumnToTypeScriptTypeMapping["${type}"],`,
  );

  return [
    `import type { GristTypeColumnToTypeScriptTypeMapping } from "../GristMapping";`,
    ``,
    `export type Table = {`,
    ...fieldLines,
    `};`,
  ].join("\n");
}

async function main() {
  console.log("Retrieving Grist tables column data...");
  const data = await fetchTableColumns();
  const fields = transformRecordsToFields(data.records);

  if (!existsSync(GENERATED_DIR)) {
    mkdirSync(GENERATED_DIR);
  }
  console.log("Done!");
  console.log("Writing generated file...");
  const content = generateTypeFile(fields);
  writeFileSync(OUTPUT_FILE, content);

  console.log("Done! in", OUTPUT_FILE);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
