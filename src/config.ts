import { join } from 'node:path'

export const GRIST_BASE_URL = 'https://grist.numerique.gouv.fr/api/docs'

export const GENERATED_DIR = join(process.cwd(), 'src', 'generated')
export const OUTPUT_FILE = join(GENERATED_DIR, 'types.ts')

export function getGristCredentials() {
    const docId = process.env.GRIST_DOC_ID
    const apiKey = process.env.GRIST_API_KEY

    if (!docId) {
        throw new Error(
            'Missing GRIST_DOC_ID environment variable. Please set it to your Grist document ID.'
        )
    }

    return { docId, apiKey }
}
