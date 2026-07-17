import { CellValue, GristObjCode } from "./GristData";

//created based on isRightType
//@see https://github.com/gristlabs/grist-core/blob/main/app/common/gristTypes.ts (2026/07/17)
export type gristTypeToTypeScript = {
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
  ManualSortPos: number | boolean;
  Ref: number | boolean;
  RefList: [GristObjCode.List, ...CellValue[]] | null;
  Choice: string;
  ChoiceList: [GristObjCode.List, ...CellValue[]] | null;
};
