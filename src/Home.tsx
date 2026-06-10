
import { useDispatch, useSelector } from 'react-redux'
import { addUser, deleteUser, editUser, setName } from './reducer/todo.slice'
import { useState } from 'react'

const Home = () => {
  const {data,name,job} = useSelector((store)=>store.todo)
  const [isEdit,setIsEdit] = useState(false)
  const [idx,setIdx] = useState(null)
  const dispatch = useDispatch()
  const handleEdit =(e)=>{
    setIdx(e.id)
    dispatch(setName({value:e.name,key:"name"}))
    dispatch(setName({value:e.job,key:"job"}))
    setIsEdit(true)
  }
  

  return (
    <div>
   <input type="text" value={name} onChange={(e)=>dispatch(setName({value:e.target.value,key:"name"}))} />
   <input type="text" value={job} onChange={(e)=>dispatch(setName({value:e.target.value,key:"job"}))} />
   <button onClick={()=>{dispatch((isEdit?editUser(idx):addUser())),  setIsEdit(false)}}>{isEdit?"save":"add"}</button>




      {data.map(e=>{
        return <div>
          <h1>{e.name} Job: <span>{e.job}</span>
           <button onClick={()=>dispatch(deleteUser(e.id))}>delete</button>
           </h1>
           <button onClick={()=>handleEdit(e)}>edit</button>
        </div>
      })}
   
    </div>
  )
}

export default Home