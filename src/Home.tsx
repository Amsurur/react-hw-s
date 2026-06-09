
import { useDispatch, useSelector } from 'react-redux'
import { deleteUser, setName } from './reducer/todo.slice'

const Home = () => {
  const {data,name,surname} = useSelector((store)=>store.todo)
  const dispatch = useDispatch()
  
  return (
    <div>
   <input type="text" value={name} onChange={(e)=>dispatch(setName({value:e.target.value,key:"name"}))} />
   <input type="text" value={surname} onChange={(e)=>dispatch(setName({value:e.target.value,key:"surname"}))} />
   {/* <input type="text" value={name} onChange={(e)=>dispatch(setName(e.target.value))} />
   <input type="text" value={name} onChange={(e)=>dispatch(setName(e.target.value))} />
   <input type="text" value={name} onChange={(e)=>dispatch(setName(e.target.value))} /> */}




      {data.map(e=>{
        return <div>
          <h1>{e.name} Job: <span>{e.job}</span> <button onClick={()=>dispatch(deleteUser(e.id))}>delete</button></h1>
        </div>
      })}
      <h1>{name}</h1>
      <h3>{surname}</h3>
    </div>
  )
}

export default Home