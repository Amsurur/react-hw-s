import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const Home = () => {
  const [data,setData] = useState([])
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()
  
  const onSubmit =(value)=>{
    setData((prev)=>[...prev,value])

  }
  return (
    <div>
       <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />

      <input  {...register("email", { required: true })} />
      {errors.email && <span>This field is required</span>}

      <input type="submit" />
    </form>

    <div>
      {data.map((e)=>{
        return (
          <div>
            <h1>{e.name}</h1>
          </div>
        )
      })}
    </div>
    </div>
  )
}

export default Home