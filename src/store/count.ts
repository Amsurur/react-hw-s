import axios from 'axios'
import { create } from 'zustand'
export const Api = "https://to-dos-api.softclub.tj/api/to-dos"
export const useData = create((set,get) => ({
  data:[],
  getData: async ()=> {
    try {
      const {data} = await axios.get(Api)
    set(()=>({data:data.data}))
    } catch (error) {
      console.error(error);
      
    }

  },
  editData: async (user)=> {
    try {
       await axios.put(Api,user)
       get().getData()
    } catch (error) {
      console.error(error);
      
    }

  }
  }))