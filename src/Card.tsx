import { useEffect, useRef, useState } from "react"

const Card = () => {
    // const [count,setCount] = useState(0)
    const count2 = useRef(null)
    console.log(count2);
    
    console.log("RENDER");
    useEffect(()=>{

    },[])
  return (
    <div>
        <button onClick={()=>count2.current.innerHTML = +count2.current.innerHTML+1}>click-1</button>
        <h1 ref={count2}>{count2?.current?.innerHTML}</h1>
    </div>
  )
}

export default Card