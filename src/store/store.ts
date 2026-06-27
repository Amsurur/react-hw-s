import { configureStore } from '@reduxjs/toolkit'
import  TodoSlice  from '../reducer/todo.slice'
import { TodoApi } from '../api/todo.api'

export const store = configureStore({
  reducer: {
    todo:TodoSlice,
    [TodoApi.reducerPath]: TodoApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(TodoApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch