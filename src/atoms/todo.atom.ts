import axios from "axios"
import { atom } from "jotai"
import { loadable } from "jotai/utils"

const Api = "http://37.27.29.18:8001/api/to-dos"
export const ApiImage = "http://37.27.29.18:8001/images"
const triggerAtom = atom(false)
const getToDos =atom(async (get,set)=>{
    get(triggerAtom)
    try {
        const {data} = await axios.get(Api)
return data.data
    } catch (error) {
        console.error(error);
        
    }
})
export const deleteToDos =atom(null,async (get,set,id)=>{
    try {
       await axios.delete(Api+"?id="+id)
set(triggerAtom,!get(triggerAtom))
    } catch (error) {
        console.error(error);
        
    }
})

export const getAsyncTodos= loadable(getToDos)