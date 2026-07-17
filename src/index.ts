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
  if (!docId) {
    throw new Error("GRIST_DOC_ID environment variable is not set");
  }

  const url = `${GRIST_BASE_URL}/${docId}/tables/${GRIST_TABLES_COLUMN_TABLE}/records`;
  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch Grist tables: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as GristCallApi.GristTablesColumn;
}

function transformRecordsToFields(
  records: GristCallApi.GristTablesColumn["records"],
): Array<{ colId: string; type: string }> {
  if (!records || records.length === 0) {
    throw new Error(`No records in table ${GRIST_TABLES_COLUMN_TABLE}`);
  }

  const fields = records
    .filter((record) => !isHiddenColType(record.fields.type))
    .map((record) => {
      const { type, colId } = record.fields;

      if (!isGristCellType(type)) {
        throw new Error(
          `The type ${type} of record ${JSON.stringify(record)} and colId ${colId} is not a Grist Type.`,
        );
      }

      return {
        colId,
        type: formateGristCellTypeForTypescript(type),
      };
    });

  if (fields.length === 0) {
    throw new Error(`No data fields in table ${GRIST_TABLES_COLUMN_TABLE}`);
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
