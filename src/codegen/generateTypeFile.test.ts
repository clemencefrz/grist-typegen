import type { ProcessedColumn } from './buildGristTableIdToGristCols'
import { generateTypeFile } from './generateTypeFile'

const gristTableIdToGristCols = new Map<string, ProcessedColumn[]>([
    [
        'Client',
        [
            { colId: 'Name', type: 'Text', isFormula: false },
            { colId: 'Age', type: 'Int', isFormula: false },
            { colId: 'Label', type: 'Text', isFormula: true },
        ],
    ],
    [
        'Order',
        [
            {
                colId: 'Client',
                type: 'Ref',
                referencedTableId: 'Client',
                isFormula: false,
            },
            { colId: 'Total', type: 'Numeric', isFormula: false },
        ],
    ],
])

test('generateTypeFile', () => {
    expect(() =>
        generateTypeFile(gristTableIdToGristCols, 'docId123')
    ).not.toThrow()
})
