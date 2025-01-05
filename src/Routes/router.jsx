import {createBrowserRouter} from "react-router-dom";
import Main from "../Layout/Main";
import Home2 from "../Pages/Home/Home2";
  
export const router = createBrowserRouter([
    {
      path: "/",
        element: <Main />,
        children: [
            {
                path: '/',
                element: <Home2/>
          }
      ]
    },
  ]);