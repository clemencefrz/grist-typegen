import type { ProcessedColumn } from './buildGristTableIdToGristCols'

export function generateTypeFile(
    gristTableIdToGristCols: Map<string, ProcessedColumn[]>
): string {
    const typeDefinitions: string[] = [
        `import type { GristTypeColumnToTypeScriptTypeMapping } from '../codegen/types'`,
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
