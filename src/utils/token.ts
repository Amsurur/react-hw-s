import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface CounterState {
  name: number
  surname: number
}

const initialState: CounterState = {
  name: 0,
  surname: 0,
}

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setfunction :(state,action)=>{
       state.name=action.payload.name;
       state.surname=action.payload.surname
    }
  },
})

// Action creators are generated for each case reducer function
export const { setfunction } = counterSlice.actions

export default counterSlice.reducer