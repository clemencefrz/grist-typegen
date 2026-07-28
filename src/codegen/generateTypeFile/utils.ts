import { TYPE_ALIASES_TO_EMIT } from '../mappingTypes'

// Helper types referenced by the mapping, imported only when actually emitted.
export const HELPER_TYPES = ['GristObjCode', 'CellValue'] as const

export type EmittedAlias = keyof typeof TYPE_ALIASES_TO_EMIT

export const EMITTED_ALIASES = Object.keys(
    TYPE_ALIASES_TO_EMIT
) as EmittedAlias[]

export function isEmittedAlias(tsType: string): tsType is EmittedAlias {
    return tsType in TYPE_ALIASES_TO_EMIT
}

// A formula column can evaluate to Python None, which Grist returns as null.
// For instance, its "Text"/"Choice" type is display-only and does not coerce None to ''.
// So a text-typed formula column is `string | null` at runtime; a plain data
// text column keeps '' for empty values and stays `string`.
//
// This is the single boundary where formula nullability is applied, so every
// emitted type stays honest without callers repeating the widening.
export function applyFormulaNullability(
    tsType: string,
    isFormula: boolean
): string {
    if (!isFormula) {
        return tsType
    }
    // An alias hides what it stands for, so nullability is read on its declaration.
    const declaration = isEmittedAlias(tsType)
        ? TYPE_ALIASES_TO_EMIT[tsType]
        : tsType
    // `unknown` already admits null, and mappings that are already nullable
    // (e.g. `... | null`) need no widening.
    if (declaration === 'unknown' || declaration.includes('null')) {
        return tsType
    }
    return `${tsType} | null`
}
