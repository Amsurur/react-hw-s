import { useBear } from "./store/count"


const Home = () => {
    const {count1,increaseCount1} = useBear()
  return (
    <div>
        <button onClick={()=>increaseCount1()}>+</button>
        <h1>{count1}</h1>
    </div>
  )
}

export default Home