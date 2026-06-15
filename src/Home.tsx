import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteData, getData } from './reducer/todo.slice'

const Home = () => {
const dispatch = useDispatch()
const {data} = useSelector((store)=>store.todo)
console.log(data);

  useEffect(()=>{
dispatch(getData())
// getData()
  },[])
  return (
    <div>
      {data.map((e)=>{
        return <div>
          <h1>{e.name}</h1>
          <button onClick={()=>dispatch(deleteData(e.id))}>delete</button>
        </div>
      })}
    </div>
  )
}

export default Home