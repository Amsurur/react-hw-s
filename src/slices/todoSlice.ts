import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios';

export interface IData {
  id:number;
  name:string;
  age:number;
  status:boolean
}

export interface CounterState {
  data: IData[];
  nameInp:string
  nameInp1:string
  nameInp2:string
  isLoading:boolean
}

const initialState: CounterState = {
  data: [{
    id:1,
    name:"Bilol",
    age:17,
    status:false
  }],
  nameInp:"",
  nameInp1:"",
  nameInp2:"",
  isLoading:false
}
const Api = "https://to-dos-api.softclub.tj/api/to-dos"
export const getTodos =createAsyncThunk("todo/getTodos",async ()=>{
  try {
    const {data} = await axios.get(Api)
    return data.data
  } catch (error) {
    console.error(error);
  }
})

export const TodoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
  deleteUser :(state,action)=>{
    state.data = state.data.filter((e)=>e.id != action.payload)
  },
  setInp :(state,{payload})=>{
    state[payload.key] =payload.value
  }
  },
  extraReducers: (builder) => {
    builder.addCase(getTodos.pending, (state, action) => {
      state.isLoading = true
    })
    builder.addCase(getTodos.fulfilled, (state, action) => {
      state.data = action.payload
      state.isLoading = false
    })
    // Add reducers for additional action types here, and handle loading state as needed
    builder.addCase(getTodos.rejected, (state, action) => {
      state.isLoading = false
    })
  },
})

export const { deleteUser,setInp} = TodoSlice.actions

export default TodoSlice.reducer