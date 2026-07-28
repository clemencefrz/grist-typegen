import 'dotenv/config'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { GENERATED_DIR, OUTPUT_FILE, getGristCredentials } from './config'
import { fetchTables } from './grist/client'

import { generateTypeFile } from './codegen/generateTypeFile/generateTypeFile'
import { buildGristTableIdToGristCols } from './codegen/buildGristTableIdToGristCols'

async function main() {
    console.log('Retrieving Grist tables data...')
    const { docId, apiKey } = getGristCredentials()

    const response = await fetchTables(docId, apiKey)

    if (!response.tables || response.tables.length === 0) {
        throw new Error(
            'No tables found in Grist document. The document may be empty or the API request failed.'
        )
    }

    console.log('Table data retrieved successfully.')
    const gristTableIdToGristColIds = buildGristTableIdToGristCols(
        response.tables
    )

    if (!existsSync(GENERATED_DIR)) {
        mkdirSync(GENERATED_DIR)
    }

    console.log('Generating type file...')
    const content = generateTypeFile(gristTableIdToGristColIds, docId)
    writeFileSync(OUTPUT_FILE, content)

    console.log(`✓ Type file generated successfully at ${OUTPUT_FILE}`)
}

main().catch((err) => {
    console.error('Error:', err)
    process.exit(1)
})
