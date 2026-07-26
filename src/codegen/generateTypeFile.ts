import type { ProcessedColumn } from './buildGristTableIdToGristCols'
import { mappingGristTypeColumnToTypeScriptTypeMapping } from './mappingTypes'

// Helper types referenced by the mapping, imported only when actually emitted.
const HELPER_TYPES = ['GristObjCode', 'CellValue'] as const

// A formula column can evaluate to Python None, which Grist returns as null.
// For instance, its "Text"/"Choice" type is display-only and does not coerce None to ''.
// So a text-typed formula column is `string | null` at runtime; a plain data
// text column keeps '' for empty values and stays `string`.
//
// This is the single boundary where formula nullability is applied, so every
// emitted type stays honest without callers repeating the widening.
function applyFormulaNullability(tsType: string, isFormula: boolean): string {
    if (!isFormula) {
        return tsType
    }
    // `unknown` already admits null, and mappings that are already nullable
    // (e.g. `... | null`) need no widening.
    if (tsType === 'unknown' || tsType.includes('null')) {
        return tsType
    }
    return `${tsType} | null`
}

export function generateTypeFile(
    gristTableIdToGristCols: Map<string, ProcessedColumn[]>,
    docId?: string
): string {
    const generatedDate = new Date().toISOString()
    const tableDefinitions: string[] = []
    const usedTypeScriptTypes = new Set<string>()

    gristTableIdToGristCols.forEach((columns, tableId) => {
        const fieldLines = columns.map(
            ({ colId, type, referencedTableId, isFormula }) => {
                const typeScriptType = applyFormulaNullability(
                    mappingGristTypeColumnToTypeScriptTypeMapping[type],
                    isFormula
                )
                usedTypeScriptTypes.add(typeScriptType)

                // Mark computed columns, and note the target of Ref/RefList columns.
                const commentParts = [
                    ...(isFormula ? ['Formula'] : []),
                    ...(referencedTableId ? [`${type} -> ${referencedTableId}`] : []),
                ]
                const comment = commentParts.length
                    ? ` // ${commentParts.join(', ')}`
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
