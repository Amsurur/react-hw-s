import React, { useEffect, useState } from 'react'
import { useTodo } from './store/count'
interface ITodo {
  id:number,
  name:string,
  email:string,
  phone:string,
  status:boolean
}

const Home = () => {
  const {todoData,getTodo,deleteTodo,editTodo} = useTodo()
 const [formState,setFormState] = useState({name:"",email:"",phone:"",id:null})
  useEffect(()=>{
getTodo()
  },[])
  return (
    <div>
      <form onSubmit={(e)=>{
        e.preventDefault()
        let obj ={
          name:e.target["name"].value,email:e.target["email"].value,phone:e.target["phone"].value,id:formState.id
                }
        editTodo(obj)
       setFormState({name:"",email:"",phone:"",id:null})
       e.resetForm()
      }} action=""> 

   
      <input defaultValue={formState.name}  name='name' type="text" />
      <input defaultValue={formState.email} name="email" type="text" />
      <input defaultValue={formState.phone} name="phone" type="text" /> 
      <button type='submit'>submit</button>
        </form>
       <div>
      {
        todoData.map((e:ITodo)=>{
          return <div key={e.id}>
<h1>{e.name}</h1>
<h3>{e.email}</h3>
<h3>{e.phone}</h3>
<button onClick={()=>deleteTodo(e.id)}>delete</button>
<button onClick={()=>setFormState({name:e.name,email:e.email,phone:e.phone,id:e.id})}>edit</button>

          </div>
        })
      }
    </div>
    </div>
   
  )
}

export default Home