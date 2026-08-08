import React, { useContext } from 'react'
import { CountContext } from '../Home'

const CompD = () => {
  const {count,handleClick} = useContext(CountContext)
  return (
    <div>CompD:{count}
    <button onClick={()=>handleClick()}>click</button></div>
  )
}

export default CompD