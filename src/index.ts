import "dotenv/config";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { GENERATED_DIR, OUTPUT_FILE, getGristCredentials } from "./config";
import { fetchTableColumns } from "./grist/client";

import { generateTypeFile } from "./generators/generateTypeFile";
import { transformRecordsToFields } from "./generators/transformRecordsToFields";

async function main() {
  console.log("Retrieving Grist tables column data...");
  const { docId, apiKey } = getGristCredentials();

  const columnData = await fetchTableColumns(docId, apiKey);

  console.log("Table data retrieved successfully.");

  const fields = transformRecordsToFields(columnData.records);

  if (!existsSync(GENERATED_DIR)) {
    mkdirSync(GENERATED_DIR);
  }

  console.log("Generating type file...");
  const content = generateTypeFile(fields);
  writeFileSync(OUTPUT_FILE, content);

  console.log(`✓ Type file generated successfully at ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
