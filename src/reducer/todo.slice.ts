import { createSlice } from '@reduxjs/toolkit'

export interface IData{
  id:number,
  name:string,
  job:string,
 
}

export interface TodoState {
  data: IData[],
  name:string,
  job:string
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
  job:""
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

  },
  addUser :(state)=>{
state.data.push({id:Date.now(),name:state.name,job:state.job})
  }
  ,
  editUser :(state,{payload})=>{
    state.data = state.data.map((e)=>{
      if(e.id ==payload){
        e ={id:payload,name:state.name,job:state.job}
      }
      return e
    })
    state.name=""
    state.job=""
  }
  },
})

// Action creators are generated for each case reducer function
export const {  deleteUser,setName,addUser,editUser} = TodoSlice.actions

export default TodoSlice.reducer