import { AppType } from '../../types'
import { hc } from 'hono/client'
import { adminToken } from './signals'

export const api = hc<AppType>("/").api

export const adminAPI = hc<AppType>("/", {
  fetch: (input: RequestInfo | URL, requestInit?: RequestInit) => {
    return fetch(input, {
      method: requestInit?.method,
      headers: {
        Authorization: adminToken(),
        "content-type": "application/json",
        ...requestInit?.headers,
      },
      body: requestInit?.body,
    });
  },
}).api.admin
