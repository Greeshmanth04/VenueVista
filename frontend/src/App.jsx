import "./App.css";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import RootLayout from "./components/RootLayout";
import Login from "./components/Login";
import Registration from "./components/Registration";
import Home from "./components/Home";
import UserProfile from "./components/user-components/UserProfile.jsx";
import AdminProfile from "./components/admin-components/AdminProfile";
import MyBookings from "./components/user-components/MyBookings.jsx";
import AllBookings from "./components/user-components/AllBookings.jsx";
import ViewHalls from "./components/user-components/ViewHalls.jsx";
import BookHall from "./components/user-components/BookHall.jsx";
import Halls from "./components/admin-components/Halls.jsx";
import ActiveBookings from "./components/admin-components/ActiveBookings.jsx";
import VerifyBookings from "./components/admin-components/VerifyBookings.jsx";
import AllUsers from "./components/admin-components/AllUsers.jsx";
import VerifyUsers from "./components/admin-components/VerifyUsers.jsx";

function App() {

  let browserRouter = createBrowserRouter([
    {
      path: "",
      element: <RootLayout/>,
      children: [
        {
          path: "",
          element: <Home/>
        },
        {
          path: "register",
          element: <Registration/>
        },
        {
          path: "login",
          element: <Login/>
        },
        {
          path: "userprofile",
          element: <UserProfile/>,
          children: [
            {
              path: "viewhalls",
              element: <ViewHalls/>
            },
            {
              path: "bookhall",
              element: <BookHall/>
            },
            {
              path: "allbookings",
              element: <AllBookings/>
            },
            {
              path: "mybookings",
              element: <MyBookings/>
            },
            {
              path: "",
              element: <Navigate to="viewhalls" />
            }
          ]
        },
        {
          path: "adminprofile",
          element: <AdminProfile/>,
          children: [
            {
              path: "halls",
              element: <Halls/>
            },
            {
              path: "activebookings",
              element: <ActiveBookings/>
            },
            {
              path: "verifybookings",
              element: <VerifyBookings/>
            },
            {
              path: "allusers",
              element: <AllUsers/>
            },
            {
              path: "verifyusers",
              element: <VerifyUsers/>
            },
            {
              path: "",
              element: <Navigate to="halls" />
            }
          ]
        }
      ]
    }
  ]);
  return (
    <RouterProvider router={browserRouter} />
  );
}

export default App;