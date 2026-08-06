import { atom } from "jotai";

export const  dataAtom =atom([{
id:1,
name:"Nekruz"
}])


export const deleteDataAtom = atom(null,(get,set,id)=>{
set(dataAtom,get(dataAtom).filter((e)=>e.id != id))
})