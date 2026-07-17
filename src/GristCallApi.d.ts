//api call https://grist.numerique.gouv.fr/api/docs/{docId}/tables/_grist_Tables_column/records'
//generated with https://quicktype.io/
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
