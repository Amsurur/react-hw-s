import React from 'react'
import Layout from './Layout';
import Home from './Home';
import About from './About';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

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
        {
          path:"/about",
          element:<About/>
        }
      ]
    }
    ],
  
  );
  
  return (
    <div><RouterProvider router={router}/></div>
  )
}

export default App