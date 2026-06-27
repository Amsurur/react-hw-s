import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const TodoApi = createApi({
  reducerPath: 'todo',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://to-dos-api.softclub.tj/api' }),
  endpoints: (builder) => ({
    getTodo: builder.query({
      query: () => `/to-dos`,
    }),
  }),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetTodoQuery } = TodoApi