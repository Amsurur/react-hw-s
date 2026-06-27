import React from 'react'
import { useGetTodoQuery } from './api/todo.api'

const Home = () => {
  const {data,isLoading} = useGetTodoQuery("")
  console.log(data);
  if(isLoading){
    return <div>loading...</div>
  }
  return (
    <div>
      {data.data.map((e)=>{
        return <div>
          <h1>
            {e.name}
          </h1>
        </div>
      })}
    </div>
  )
}

export default Home