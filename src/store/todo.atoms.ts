import axios from "axios";
import { atom } from "jotai";
import { Api } from "./count";
import { atomWithRefresh, loadable } from "jotai/utils";

export const getDataAtom = atomWithRefresh(async (get)=>{
  try {
    const {data} = await axios.get(Api)
    return data.data
  } catch (error) {
    console.error(error);
    
  }
})

export const deleteDataAtom = atom(null,async (get,set,id)=>{
  try {
     await axios.delete(`${Api}?id=${id}`)
     set(getDataAtom)
  } catch (error) {
    console.error(error);
    
  }
})
export const getLoadableAtom = loadable(getDataAtom)