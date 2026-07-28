import type { GristObjCode, CellValue } from '../grist/GristData'

/**
 * Maps Grist column types to TypeScript types for type-safe schema generation.
 * @see https://github.com/gristlabs/grist-core/blob/main/app/common/gristTypes.ts
 */
export type GristTypeColumnToTypeScriptTypeMapping = {
    Any: unknown
    Attachments: [GristObjCode.List, ...CellValue[]] | null
    Text: string
    Blob: string
    Int: number | boolean | null
    Bool: boolean | 1 | 0 | null
    Date: number | boolean | null
    DateTime: number | boolean | null
    Numeric: number | boolean | null
    Id: number | boolean
    PositionNumber: number | boolean
    Ref: number | boolean
    RefList: [GristObjCode.List, ...CellValue[]] | null
    Choice: string
    ChoiceList: [GristObjCode.List, ...CellValue[]] | null
}

export const mappingGristTypeColumnToTypeScriptTypeMapping = {
    Any: 'unknown',
    Attachments: '[GristObjCode.List, ...CellValue[]] | null',
    Text: 'string',
    Blob: 'string',
    Int: 'number | boolean | null',
    Bool: 'boolean | 1 | 0 | null',
    Date: 'number | boolean | null',
    DateTime: 'number | boolean | null',
    Numeric: 'number | boolean | null',
    Id: 'number | boolean',
    PositionNumber: 'number | boolean',
    Ref: 'number | boolean',
    RefList: '[GristObjCode.List, ...CellValue[]] | null',
    Choice: 'string',
    ChoiceList: '[GristObjCode.List, ...CellValue[]] | null',
} as const
