import type { GristObjCode, CellValue } from "./GristData";
/**
 * Maps Grist column types to TypeScript types for type-safe schema generation.
 * Based on: https://github.com/gristlabs/grist-core/blob/main/app/common/gristTypes.ts
 */
export type GristTypeColumnToTypeScriptTypeMapping = {
    Any: any;
    Attachments: [GristObjCode.List, ...CellValue[]] | null;
    Text: string;
    Blob: string;
    Int: number | boolean | null;
    Bool: boolean | 1 | 0 | null;
    Date: number | boolean | null;
    DateTime: number | boolean | null;
    Numeric: number | boolean | null;
    Id: number | boolean;
    PositionNumber: number | boolean;
    Ref: number | boolean;
    RefList: [GristObjCode.List, ...CellValue[]] | null;
    Choice: string;
    ChoiceList: [GristObjCode.List, ...CellValue[]] | null;
};
export declare const MANUALSORT = "manualSort";
export declare function isHiddenColType(type: string): boolean;
export declare function isGristCellType(type: string): type is keyof GristTypeColumnToTypeScriptTypeMapping;
export declare function formateGristCellTypeForTypescript(type: string): GristTypeColumnToTypeScriptTypeMapping[keyof GristTypeColumnToTypeScriptTypeMapping];
//# sourceMappingURL=GristMapping.d.ts.map