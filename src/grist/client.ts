import type { GristTablesResponse } from './types'
import { GRIST_BASE_URL } from '../config'

function handleFetchError(response: Response, apiKey?: string): Error {
    const statusMessage = `${response.status} ${response.statusText}`

    if (response.status === 401) {
        return new Error(
            `Authentication failed (${statusMessage}). ${apiKey ? 'Check that your GRIST_API_KEY is valid.' : 'The document is private. Please provide a GRIST_API_KEY.'}`
        )
    }

    if (response.status === 403) {
        return new Error(
            `Access denied (${statusMessage}). Check that GRIST_DOC_ID is correct and your API key has permission to access it.`
        )
    }

    if (response.status === 404) {
        return new Error(
            `Document not found (${statusMessage}). Check that GRIST_DOC_ID is correct.`
        )
    }

    return new Error(
        `Failed to fetch Grist tables (${statusMessage}). Check your network connection and Grist server status.`
    )
}

export async function fetchTables(
    docId: string,
    apiKey?: string
): Promise<GristTablesResponse> {
    const url = `${GRIST_BASE_URL}/${docId}/tables?expand=column`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            ...(apiKey && { authorization: `Bearer ${apiKey}` }),
        },
    })

    if (!response.ok) {
        throw handleFetchError(response, apiKey)
    }

    return (await response.json()) as GristTablesResponse
}
