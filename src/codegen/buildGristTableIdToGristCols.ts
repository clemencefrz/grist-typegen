import type { ColumnMetadata, TableMetadata } from '../grist/DocApiTypes'
import {
    mappingGristTypeColumnToTypeScriptTypeMapping,
    type GristTypeColumnToTypeScriptTypeMapping,
} from './mappingTypes'

function isDateLikeType(type: string) {
    return type === 'Date' || type.startsWith('DateTime')
}

function isRefListType(type: string) {
    return type === 'Attachments' || type?.startsWith('RefList:')
}

function isRefType(type: string) {
    return type.startsWith('Ref:')
}

// Whether a column is internal and should be hidden.
function isHiddenColType(type: string): boolean {
    return type === 'ManualSortPos'
}

function isGristCellType(
    type: string
): type is keyof GristTypeColumnToTypeScriptTypeMapping {
    if (isHiddenColType(type)) {
        return true
    }

    //type Datetime is always linked with timezone
    // example : 'DateTime:Europe/Paris'
    if (isDateLikeType(type)) {
        return true
    }
    //type Ref and Reflist is always linked with Table of the ref column
    //example: Ref:Client
    if (isRefType(type) || isRefListType(type)) {
        return true
    }

    return type in mappingGristTypeColumnToTypeScriptTypeMapping
}

function formateGristCellTypeForTypescript(
    type: string
): keyof GristTypeColumnToTypeScriptTypeMapping {
    if (!isGristCellType(type)) {
        throw new Error('Not a Grist Cell Type')
    }
    if (isDateLikeType(type)) {
        return 'DateTime'
    }

    if (isRefType(type)) {
        return 'Ref'
    }

    if (isRefListType(type)) {
        return 'RefList'
    }

    return type
}

// The table a Ref/RefList column points to, e.g. 'Client' for 'Ref:Client'.
// Attachments is a RefList without a target table.
function getReferencedTableId(type: string): string | undefined {
    if (!isRefType(type) && !isRefListType(type)) {
        return undefined
    }
    return type.split(':')[1]
}

export type ProcessedColumn = {
    colId: string
    type: keyof GristTypeColumnToTypeScriptTypeMapping
    referencedTableId?: string | undefined
    // Whether the column is computed from a formula (vs. stored data).
    isFormula: boolean
}

function formatColumns(columns: ColumnMetadata[]): ProcessedColumn[] {
    const formattedColumns = columns
        .filter((column) => !isHiddenColType(column.fields.type))
        .map((column) => {
            const { type, isFormula } = column.fields
            const colId = column.id

            if (!isGristCellType(type)) {
                throw new Error(
                    `Unsupported Grist column type "${type}" for column "${colId}". ` +
                        `Please check that all columns use supported types or update GristMapping to handle this type.`
                )
            }

            return {
                colId,
                type: formateGristCellTypeForTypescript(type),
                referencedTableId: getReferencedTableId(type),
                isFormula,
            }
        })

    if (formattedColumns.length === 0) {
        throw new Error(
            `No usable column fields found after filtering. All columns may be hidden system columns. ` +
                `Check your Grist document structure or filtering logic in isHiddenColType.`
        )
    }

    return formattedColumns
}

export function buildGristTableIdToGristCols(
    tables: TableMetadata[]
): Map<string, ProcessedColumn[]> {
    const tablesWithColumns = new Map<string, ProcessedColumn[]>()

    for (const table of tables) {
        const tableId = table.id
        if (!table.columns) {
            throw new Error(
                'No column metadata found. Did you enable the expand option?'
            )
        }
        const columns = formatColumns(table.columns)
        tablesWithColumns.set(tableId, columns)
    }

    if (tablesWithColumns.size === 0) {
        throw new Error(
            'No tables found in Grist document. The document may be empty.'
        )
    }

    return tablesWithColumns
}
