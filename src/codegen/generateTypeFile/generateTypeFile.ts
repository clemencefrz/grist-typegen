import type { ProcessedColumn } from '../buildGristTableIdToGristCols'
import {
    mappingGristTypeColumnToTypeScriptTypeMapping,
    TYPE_ALIASES_TO_EMIT,
} from '../mappingTypes'
import {
    isEmittedAlias,
    applyFormulaNullability,
    EMITTED_ALIASES,
    HELPER_TYPES,
    type EmittedAlias,
} from './utils'

export function generateTypeFile(
    gristTableIdToGristCols: Map<string, ProcessedColumn[]>,
    docId?: string
): string {
    const generatedDate = new Date().toISOString()
    const tableDefinitions: string[] = []
    const usedTypeScriptTypes = new Set<string>()
    const usedAliases = new Set<EmittedAlias>()

    gristTableIdToGristCols.forEach((columns, tableId) => {
        const fieldLines = columns.map(
            ({ colId, type, referencedTableId, isFormula }) => {
                const mappedType =
                    mappingGristTypeColumnToTypeScriptTypeMapping[type]
                if (isEmittedAlias(mappedType)) {
                    usedAliases.add(mappedType)
                }

                const typeScriptType = applyFormulaNullability(
                    mappedType,
                    isFormula
                )
                usedTypeScriptTypes.add(typeScriptType)

                // Mark computed columns, and note the target of Ref/RefList columns.
                const commentParts = [
                    ...(isFormula ? ['Formula'] : []),
                    ...(referencedTableId
                        ? [`${type} -> ${referencedTableId}`]
                        : []),
                ]
                const comment = commentParts.length
                    ? ` // ${commentParts.join(', ')}`
                    : ''

                return `  ${colId}: ${typeScriptType},${comment}`
            }
        )

        tableDefinitions.push(`export type ${tableId} = {`)

        // The Grist native Id column is always present, but not returned by fetchTable endpoint.
        // In theory, it could be a number or a boolean, but in practice it seems to always be a number.
        // TODO: make this more robust by checking the actual type of the Id column in the Grist table.
        tableDefinitions.push(`  id: number, // Grist native Id column`)

        tableDefinitions.push(...fieldLines)
        tableDefinitions.push(`};`)
        tableDefinitions.push(``)
    })

    // Aliases are declared in the generated file itself, in mapping order.
    const aliasDeclarations = EMITTED_ALIASES.filter((alias) =>
        usedAliases.has(alias)
    ).map((alias) => TYPE_ALIASES_TO_EMIT[alias])

    const neededHelpers = HELPER_TYPES.filter((helper) =>
        [...usedTypeScriptTypes, ...aliasDeclarations].some((type) =>
            type.includes(helper)
        )
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
                  `import type { ${neededHelpers.join(', ')} } from '../grist/GristData'`,
                  ``,
              ]
            : []),
        ...(aliasDeclarations.length ? [...aliasDeclarations, ``] : []),
        ...tableDefinitions,
    ].join('\n')
}
