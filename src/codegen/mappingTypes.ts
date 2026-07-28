import type { GristObjCode, CellValue } from '../grist/GristData'

export type Attachments = [GristObjCode.List, ...number[]] | null

/**
 * Type aliases the generator copies verbatim into the generated file, so that
 * columns keep a readable named type instead of its expanded definition.
 * Each entry must stay in sync with the type of the same name declared above.
 */
export const TYPE_ALIASES_TO_EMIT = {
    Attachments: `export type Attachments = [GristObjCode.List, ...number[]] | null`,
} as const

/**
 * Maps Grist column types to TypeScript types for type-safe schema generation.
 * @see https://github.com/gristlabs/grist-core/blob/main/app/common/gristTypes.ts
 */
export type GristTypeColumnToTypeScriptTypeMapping = {
    Any: unknown
    Attachments: Attachments
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
    Attachments: 'Attachments',
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
