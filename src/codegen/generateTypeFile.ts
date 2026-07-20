import type { ProcessedColumn } from './buildGristTableIdToGristCols'
import { mappingGristTypeColumnToTypeScriptTypeMapping } from './mappingTypes'

// Helper types referenced by the mapping, imported only when actually emitted.
const HELPER_TYPES = ['GristObjCode', 'CellValue'] as const

export function generateTypeFile(
    gristTableIdToGristCols: Map<string, ProcessedColumn[]>,
    docId?: string
): string {
    const generatedDate = new Date().toISOString()
    const tableDefinitions: string[] = []
    const usedTypeScriptTypes = new Set<string>()

    gristTableIdToGristCols.forEach((columns, tableId) => {
        const fieldLines = columns.map(
            ({ colId, type, referencedTableId }) => {
                const typeScriptType =
                    mappingGristTypeColumnToTypeScriptTypeMapping[type]
                usedTypeScriptTypes.add(typeScriptType)

                // Only Ref/RefList columns carry a referenced table.
                const comment = referencedTableId
                    ? ` // ${type} -> ${referencedTableId}`
                    : ''

                return `  ${colId}: ${typeScriptType},${comment}`
            }
        )

        tableDefinitions.push(`export type ${tableId} = {`)
        tableDefinitions.push(...fieldLines)
        tableDefinitions.push(`};`)
        tableDefinitions.push(``)
    })

    const neededHelpers = HELPER_TYPES.filter((helper) =>
        [...usedTypeScriptTypes].some((type) => type.includes(helper))
    )

    return [
        `/**`,
        ` * Auto-generated Grist type definitions`,
        ` * Generated: ${generatedDate}`,
        ...(docId ? [` * Document ID: ${docId}`] : []),
        ` */`,
        ``,
        ...(neededHelpers.length
            ? [
                  `import type { ${neededHelpers.join(', ')} } from '../grist/types'`,
                  ``,
              ]
            : []),
        ...tableDefinitions,
    ].join('\n')
}
