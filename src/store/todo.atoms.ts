import { atom } from "jotai";
export const dataAtom = atom([{
    id:1,
    name:"Idris",
    job:"BOT"
}])
export const deleteItemDataAtom = atom(null,(get,set,id)=>{
set(dataAtom,get(dataAtom).filter((e)=>e.id != id))
})
export const countAtom = atom(1)
export const doubleCountAtom = atom((get) => {
   const value = get(countAtom)
    return value*2
  })