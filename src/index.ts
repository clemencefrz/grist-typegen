import 'dotenv/config'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import {
    GENERATED_DIR,
    GRIST_TABLES_COLUMN_TABLE,
    GRIST_TABLES_TABLE,
    OUTPUT_FILE,
    getGristCredentials,
} from './config'
import { fetchMetadataColumns, fetchMetadataTables } from './grist/client'

import { generateTypeFile } from './codegen/generateTypeFile'
import { buildGristTableIdToGristCols } from './codegen/buildGristTableIdToGristCols'

async function main() {
    console.log('Retrieving Grist tables column and table data...')
    const { docId, apiKey } = getGristCredentials()

    const metadataColumns = await fetchMetadataColumns(docId, apiKey)
    const metadataTables = await fetchMetadataTables(docId, apiKey)

    const metadataTablesRecords = metadataTables.records
    if (!metadataTablesRecords || metadataTables.records.length === 0) {
        throw new Error(
            `No table records found in Grist table "${GRIST_TABLES_TABLE}". The table may be empty or the document may not have any table defined.`
        )
    }
    const metadataColumnsRecords = metadataColumns.records
    if (!metadataColumnsRecords || metadataColumnsRecords.length === 0) {
        throw new Error(
            `No column records found in Grist table "${GRIST_TABLES_COLUMN_TABLE}". The table may be empty or the document may not have any columns defined.`
        )
    }

    console.log('Table data retrieved successfully.')

    const gristTableIdToGristColIds = buildGristTableIdToGristCols(
        metadataColumnsRecords,
        metadataTablesRecords
    )

    if (!existsSync(GENERATED_DIR)) {
        mkdirSync(GENERATED_DIR)
    }

    console.log('Generating type file...')
    const content = generateTypeFile(gristTableIdToGristColIds)
    writeFileSync(OUTPUT_FILE, content)

    console.log(`✓ Type file generated successfully at ${OUTPUT_FILE}`)
}

main().catch((err) => {
    console.error('Error:', err)
    process.exit(1)
})
