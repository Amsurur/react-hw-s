import { useContext } from "react"
import { ValueContext } from "./Home"

const Button = () => {
  const {value,theme} = useContext(ValueContext)
  return (
    <div>
      <p style={{color:theme=="dark"?"white":"black"}}>
      button
    </p>  
      
      {value}</div>
  )
}

export default Button