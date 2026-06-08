import { create } from 'zustand'

export const useBear = create((set,get) => ({
  data:[{id:1,name:"Ibrohim"}],
  data2:[{id:1,name:"Ibrohim"}],
    deleteData: () => set((state) => ({ count1: state.count1 + 1 })),
  
  }))