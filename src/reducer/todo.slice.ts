import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

export interface IData{
  id:number,
  name:string,
  job:string,
 
}

export interface TodoState {
  data: IData[],
  isLoading:boolean
  isError:boolean

}

const initialState: TodoState = {
  data: [],
  isLoading:false,
  isError:false

}
const api ="https://to-dos-api.softclub.tj/api/to-dos"

 export const getData = createAsyncThunk("counter/getData",async ()=>{
  try {
    const {data} = await axios.get(api)
    return data.data
  } catch (error) {
    console.error(error);
    
  }
 })
 export const deleteData = createAsyncThunk("counter/deleteData",async (id,{dispatch})=>{
  try {
    const {data} = await axios.delete(`${api}?id=${id}`)
    dispatch(getData())
    return data.errors
  } catch (error) {
    console.error(error);
    
  }
 })



export const TodoSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {

  },
  extraReducers:(builder) =>{
 builder.addCase(getData.pending,(state,{payload})=>{
state.isLoading = true
state.isError=false
 })
 builder.addCase(getData.fulfilled,(state,{payload})=>{
  state.isLoading = false
state.isError=false
state.data = payload
   })
   builder.addCase(getData.rejected,(state,{payload})=>{
    state.isLoading = false
state.isError=true

     })
     builder.addCase(deleteData.fulfilled,(state,{payload})=>{
    
    state.isError = payload
    
       })
       
  }
})

// Action creators are generated for each case reducer function
export const { } = TodoSlice.actions

export default TodoSlice.reducer