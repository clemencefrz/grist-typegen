interface Field {
    colId: string
    type: string
}

export function generateTypeFile(
    gristTableIdToGristCols: Map<string, Pick<Field, 'colId' | 'type'>[]>
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
