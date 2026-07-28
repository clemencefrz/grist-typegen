/**
 *
 * extract from {@link https://github.com/gristlabs/grist-core/blob/56cbd9a73c90a76fd285b132193ad5061a563273/app/plugin/DocApiTypes.ts}
 *
 */

import type { CellValue } from './GristData'

export interface ColumnMetadata {
    id: string
    fields: {
        colRef: number
        label: string
        isFormula: boolean
        type: string
        [colId: string]: CellValue
    }
}

export interface TableMetadata {
    id: string
    fields: {
        tableRef: number
        [colId: string]: CellValue
    }
    columns?: ColumnMetadata[]
}

export interface TablesGet {
    tables: [TableMetadata, ...TableMetadata[]]
}
