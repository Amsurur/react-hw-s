import React from 'react'
import Layout from './Layout';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './Home';

const App = () => {
  const router = createBrowserRouter(
    [
    {
      path:"/",
      element :<Layout/>,
      children:[
        {
          index:true,
          element:<Home/>
        },
    
      ]
    }
    ],
  
  );
  
  return (
    <div><RouterProvider router={router}/></div>
  )
}

export default App