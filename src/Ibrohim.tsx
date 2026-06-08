import React, { useEffect, useState } from 'react'
import Card from './Card';

const Ibrohim = () => {
  const [state,setState]=useState(true)

  

  return (
    
    <div>
      <button onClick={()=>setState((prev)=>!prev)}>click</button>
<Card/>
        Ibrohim</div>
  )
}

export default Ibrohim