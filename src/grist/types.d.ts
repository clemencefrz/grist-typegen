//api call https://grist.numerique.gouv.fr/api/docs/{docId}/tables/_grist_Tables_column/records'
//generated with https://quicktype.io/
// or copied from https://github.com/gristlabs/grist-core/blob/main/app/plugin/GristData.ts
export interface GristTablesColumn {
  records: GristTablesColumnRecord[];
}

export interface GristTablesColumnRecord {
  id: number;
  fields: GristTablesColumnFields;
}

export interface GristTablesColumnFields {
  /** ID of the parent table (references _grist_Tables.id). */
  parentId: number;

  parentPos: number;

  /** Stable column identifier used by the API and formulas. */
  colId: string;

  /** Grist column type (e.g. "Text", "Numeric", "Bool", "Ref:Table"). */
  type: string;

  widgetOptions: string;
  /** Whether the column is computed from a formula. */
  isFormula: boolean;

  /** Python formula used to compute the column value. */
  formula: string;

  /** Human-readable column label displayed in the UI. */
  label: string;

  /** Optional description/documentation for the column. */
  description: string;
  untieColIdFromLabel: boolean;
  summarySourceCol: number;
  displayCol: number;
  visibleCol: number;
  rules: null;
  reverseCol: number;
  recalcWhen: number;
  recalcDeps: null;
}

export enum Formula {
  Empty = "",
  NombreDEnfant10 = "$Nombre_d_enfant*10",
}

//api call https://grist.numerique.gouv.fr/api/docs/{docId}/tables/_grist_Tables/records'
//generated with:
// - https://quicktype.io/
// - https://github.com/gristlabs/grist-core/blob/main/app/common/schema.ts
export interface GristTables {
  records: GristTablesRecord[];
}

export interface GristTablesRecord {
  id: number;
  fields: GristTablesFields;
}

export interface GristTablesFields {
  tableId: string;
  primaryViewId: number;
  /** "Ref:_grist_Tables" */
  summarySourceTable: number;
  /** A table may be marked as "onDemand", which will keep its data out of the data engine,
   * and only available to the frontend when requested.
   * @see https://github.com/gristlabs/grist-core/blob/main/sandbox/grist/schema.py
   * */
  onDemand: boolean;
  rawViewSectionRef: number;
  recordCardViewSectionRef: number;
}

/**
 * Possible types of cell content.
 *
 * Each `CellValue` may either be a primitive (e.g. `true`, `123`, `"hello"`, `null`)
 * or a tuple (JavaScript Array) representing a Grist object. The first element of the tuple
 * is a string character representing the object code. For example, `["L", "foo", "bar"]`
 * is a `CellValue` of a Choice List column, where `"L"` is the type, and `"foo"` and
 * `"bar"` are the choices.
 *
 * ### Grist Object Types
 *
 * | Code | Type           |
 * | ---- | -------------- |
 * | `L`  | List, e.g. `["L", "foo", "bar"]` or `["L", 1, 2]` |
 * | `l`  | LookUp, as `["l", value, options]` |
 * | `O`  | Dict, as `["O", {key: value, ...}]` |
 * | `D`  | DateTimes, as `["D", timestamp, timezone]`, e.g. `["D", 1704945919, "UTC"]` |
 * | `d`  | Date, as `["d", timestamp]`, e.g. `["d", 1704844800]` |
 * | `C`  | Censored, as `["C"]` |
 * | `R`  | Reference, as `["R", table_id, row_id]`, e.g. `["R", "People", 17]` |
 * | `r`  | ReferenceList, as `["r", table_id, row_id_list]`, e.g. `["r", "People", [1,2]]` |
 * | `E`  | Exception, as `["E", name, ...]`, e.g. `["E", "ValueError"]` |
 * | `P`  | Pending, as `["P"]` |
 * | `U`  | Unmarshallable, as `["U", text_representation]` |
 * | `V`  | Version, as `["V", version_obj]` |
 * @see https://github.com/gristlabs/grist-core/blob/main/app/plugin/GristData.ts
 */
export type CellValue =
  | number
  | string
  | boolean
  | null
  | [GristObjCode, ...unknown[]];

/**
 * Letter codes for {@link CellValue} types encoded as [code, args...] tuples.
 * @see https://github.com/gristlabs/grist-core/blob/main/app/plugin/GristData.ts
 */
export enum GristObjCode {
  List = "L",
  LookUp = "l",
  Dict = "O",
  DateTime = "D",
  Date = "d",
  Skip = "S",
  Censored = "C",
  Reference = "R",
  ReferenceList = "r",
  Exception = "E",
  Pending = "P",
  Unmarshallable = "U",
  Versions = "V",
}
