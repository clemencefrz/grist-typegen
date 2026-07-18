import type {
    GristTablesColumn,
    GristTablesColumnRecord,
    GristTablesRecord,
} from '../grist/types'
import {
    mappingGristTypeColumnToTypeScriptTypeMapping,
    type GristTypeColumnToTypeScriptTypeMapping,
} from './types'

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
    // gérer les ref
    return type in mappingGristTypeColumnToTypeScriptTypeMapping
}

function formateGristCellTypeForTypescript(
    type: string
): GristTypeColumnToTypeScriptTypeMapping[keyof GristTypeColumnToTypeScriptTypeMapping] {
    if (!isGristCellType) {
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

type Column = Pick<
    GristTablesColumn['records'][number]['fields'],
    'colId' | 'parentId' | 'type'
>

function transformRecordsToFields(
    metadataColumnsRecords: GristTablesColumnRecord[]
): Column[] {
    const fields = metadataColumnsRecords
        .filter((record) => !isHiddenColType(record.fields.type))
        .map((record) => {
            const { type, colId, parentId } = record.fields

            if (!isGristCellType(type)) {
                throw new Error(
                    `Unsupported Grist column type "${type}" for column "${colId}". ` +
                        `Please check that all columns use supported types or update GristMapping to handle this type.`
                )
            }

            return {
                colId,
                parentId,
                type: formateGristCellTypeForTypescript(type),
            }
        })

    if (fields.length === 0) {
        throw new Error(
            `No usable column fields found after filtering. All columns may be hidden system columns. ` +
                `Check your Grist document structure or filtering logic in isHiddenColType.`
        )
    }

    return fields
}

export function buildGristTableIdToGristCols(
    metadataColumnsRecords: GristTablesColumnRecord[],
    gristTableRecords: GristTablesRecord[]
): Map<
    GristTablesRecord['fields']['tableId'],
    Pick<Column, 'colId' | 'type'>[]
> {
    const columns = transformRecordsToFields(metadataColumnsRecords)
    const tablesWithColumn: Map<
        GristTablesRecord['fields']['tableId'],
        Pick<Column, 'colId' | 'type'>[]
    > = new Map(gristTableRecords.map((record) => [record.fields.tableId, []]))
    columns.forEach((column) => {
        const parentId = column.parentId
        const parentRecord = gristTableRecords.find(
            (record) => record.id === parentId
        )
        if (
            !parentRecord ||
            !tablesWithColumn.get(parentRecord.fields.tableId)
        ) {
            throw new Error(
                `parentId ${parentId} of column ${column.colId} is not found in Grist tables`
            )
        }
        const currentColumns = tablesWithColumn.get(parentRecord.fields.tableId)
        tablesWithColumn.set(parentRecord.fields.tableId, [
            ...new Set([
                ...(currentColumns ?? []),
                { colId: column.colId, type: column.type },
            ]),
        ])
    })

    return tablesWithColumn
}
