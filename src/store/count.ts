import axios from 'axios'
import { create } from 'zustand'
export const api = "https://6788f5c12c874e66b7d708f0.mockapi.io/users"
export const useTodo = create((set,get) => ({
  todoData:[],
  getTodo: async ()=> {
    try {
      const {data} = await axios.get(api)
      set(()=>({todoData:data}))
    } catch (error) {
      console.error(error);
      
    }
  },
  deleteTodo:async(id:number)=>{
    try {
      await axios.delete(api+"/"+id)
      get().getTodo()
    } catch (error) {
      console.error(error);
      
    }
  },
  editTodo:async (obj)=>{
    try {
     await axios.put(api+"/"+obj.id,obj)
     get().getTodo()
    } catch (error) {
      console.error(error);
      
    }
  }
}))