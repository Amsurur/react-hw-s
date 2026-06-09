import { createSlice } from '@reduxjs/toolkit'

export interface IData{
  id:number,
  name:string,
  job:string,
 
}

export interface TodoState {
  data: IData[],
  name:string,
  surname:string
}

const initialState: TodoState = {
  data: [
    {
      id:1,
      name:"Sadi",
      job:"BOT"
    }
  ],
    name:"",
  surname:""
}

export const TodoSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
 setName:(state,{payload})=>{
  state[payload.key] = payload.value
 },
  deleteUser:(state,{payload})=>{
state.data = state.data.filter((e)=>e.id!= payload)

  }
  },
})

// Action creators are generated for each case reducer function
export const {  deleteUser,setName} = TodoSlice.actions

export default TodoSlice.reducer