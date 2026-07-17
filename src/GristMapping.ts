//created based on isRightType

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

const mappingGristTypeColumnToTypeScriptTypeMapping = {
  Any: "any",
  Attachments: "[GristObjCode.List, ...CellValue[]] | null",
  Text: "string",
  Blob: "string",
  Int: "number | boolean | null",
  Bool: "boolean | 1 | 0 | null",
  Date: "number | boolean | null",
  DateTime: "number | boolean | null",
  Numeric: "number | boolean | null",
  Id: "number | boolean",
  PositionNumber: "number | boolean",
  Ref: "number | boolean",
  RefList: "[GristObjCode.List, ...CellValue[]] | null",
  Choice: "string",
  ChoiceList: "[GristObjCode.List, ...CellValue[]] | null",
} as const;

function isDateLikeType(type: string) {
  return type === "Date" || type.startsWith("DateTime");
}

function isRefListType(type: string) {
  return type === "Attachments" || type?.startsWith("RefList:");
}

function isRefType(type: string) {
  return type.startsWith("Ref:");
}

export const MANUALSORT = "manualSort";

// Whether a column is internal and should be hidden.
export function isHiddenColType(type: string): boolean {
  return type === "ManualSortPos";
}

export function isGristCellType(
  type: string,
): type is keyof GristTypeColumnToTypeScriptTypeMapping {
  if (isHiddenColType(type)) {
    return true;
  }

  //type Datetime is always linked with timezone
  // example : 'DateTime:Europe/Paris'
  if (isDateLikeType(type)) {
    return true;
  }
  //type Ref and Reflist is always linked with Table of the ref column
  //example: Ref:Client
  if (isRefType(type) || isRefListType(type)) {
    return true;
  }
  // gérer les ref
  return type in mappingGristTypeColumnToTypeScriptTypeMapping;
}

export function formateGristCellTypeForTypescript(
  type: string,
): GristTypeColumnToTypeScriptTypeMapping[keyof GristTypeColumnToTypeScriptTypeMapping] {
  if (!isGristCellType) {
    throw new Error("Not a Grist Cell Type");
  }
  if (isDateLikeType(type)) {
    return "DateTime";
  }

  if (isRefType(type)) {
    return "Ref";
  }

  if (isRefListType(type)) {
    return "RefList";
  }

  return type;
}
