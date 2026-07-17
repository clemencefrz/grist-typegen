interface Field {
  colId: string;
  type: string;
}

export function generateTypeFile(fields: Field[]): string {
  const fieldLines = fields.map(
    ({ colId, type }) =>
      `  ${colId}: GristTypeColumnToTypeScriptTypeMapping["${type}"],`,
  );

  return [
    `import type { GristTypeColumnToTypeScriptTypeMapping } from "../GristMapping";`,
    ``,
    `export type Table = {`,
    ...fieldLines,
    `};`,
  ].join("\n");
}
