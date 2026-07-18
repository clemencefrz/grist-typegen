import type { ProcessedColumn } from './buildGristTableIdToGristCols'

export function generateTypeFile(
    gristTableIdToGristCols: Map<string, ProcessedColumn[]>,
    docId?: string
): string {
    const generatedDate = new Date().toISOString()
    const typeDefinitions: string[] = [
        `/**`,
        ` * Auto-generated Grist type definitions`,
        ` * Generated: ${generatedDate}`,
        ...(docId ? [` * Document ID: ${docId}`] : []),
        ` */`,
        ``,
        `import type { GristTypeColumnToTypeScriptTypeMapping } from '../codegen/mappingTypes'`,
        ``,
    ]

    gristTableIdToGristCols.forEach((columns, tableId) => {
        const fieldLines = columns.map(
            ({ colId, type }) =>
                `  ${colId}: GristTypeColumnToTypeScriptTypeMapping["${type}"],`
        )

        typeDefinitions.push(`export type ${tableId} = {`)
        typeDefinitions.push(...fieldLines)
        typeDefinitions.push(`};`)
        typeDefinitions.push(``)
    })

    return typeDefinitions.join('\n')
}
