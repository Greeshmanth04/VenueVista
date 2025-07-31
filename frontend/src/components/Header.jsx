import "./Header.css";
import {useState, useContext} from "react";
import {Link, useNavigate} from "react-router-dom";
import {tokenContext} from "../contexts/TokenContext.jsx";
import {userContext} from "../contexts/UserContext.jsx";

function Header() {

  let [selected, setSelected] = useState("home");
  let [token, setToken] = useContext(tokenContext);
  let [user, setUser] = useContext(userContext);

  let navigate = useNavigate();

  function handleLogout(){
    setSelected("home");
    setToken("");
    setUser({});
    navigate("");
  }

  return (
    <>{token == "" ? 
      <div className="header1">
        <div className="websiteName">
          VenueVista
        </div>
        <ul>
          <Link to="" className={selected == "home" ? "selected" : "notSelected"} onClick={()=>setSelected("home")}>
            <li>Home</li>
          </Link>
          <Link to="register" className={selected == "register" ? "selected" : "notSelected"} onClick={()=>setSelected("register")}>
            <li>Register</li>
          </Link>
          <Link to="login" className={selected == "login" ? "selected" : "notSelected"} onClick={()=>setSelected("login")}>
            <li>Login</li>
          </Link>
        </ul>
      </div> 
      :
      <div className="header2">
        <div className="websiteName">
          VenueVista
        </div>
        <div className="user">
          {user.userType == "user" ? 
            <h2>Hi, {user.firstname}!</h2> :
            <h2>Hi, Admin!</h2>
          }
        </div>
        <div className="logout" onClick={handleLogout}>
          Logout
        </div>
      </div>
    }</>
  );
}

export default Header;