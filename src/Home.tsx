import React from 'react'
import { countAtom, dataAtom, deleteItemDataAtom, doubleCountAtom } from './store/todo.atoms'
import { useAtom } from 'jotai'

const Home = () => {
  const [count,setCount] = useAtom(countAtom)
  const [doubleCount] = useAtom(doubleCountAtom)
  const [data,setData] = useAtom(dataAtom)
  const [,deleteItemData] = useAtom(deleteItemDataAtom)
  const handleDelete =(id)=>{
    deleteItemData(id)
    // setData(data.filter((e)=>e.id !=id))
  }
  return (
    <div>
      <h1>{count}</h1>
      <h2>{doubleCount}</h2>
      <button onClick={()=>setCount(count+1)}>click</button>
      {
        data.map((e)=>{
          return <div>
            <h1>{e.name}</h1>
            <button onClick={()=>handleDelete(e.id)}>delete</button>
          </div>
        })
      }
    </div>
  )
}

export default Home