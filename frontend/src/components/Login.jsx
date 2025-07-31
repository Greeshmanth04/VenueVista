import "./Login.css";
import {useState,useContext} from "react";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {tokenContext} from "../contexts/TokenContext";
import {userContext} from "../contexts/UserContext";
import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function Login() {

  let {register, handleSubmit, formState: {errors}} = useForm();

  let [msg, setMsg] = useState("");
  let [token, setToken] = useContext(tokenContext);
  let [user, setUser] = useContext(userContext);

  let navigate = useNavigate();

  async function handleFormSubmit(userData){
    let res = {};
    if(userData.userType == "user"){
        res = await axios.post(`${BASE_URL}/user-api/login`, userData);
    }
    else{
        res = await axios.post(`${BASE_URL}/admin-api/login`, userData);
    }
    if(res.data.message == "user login successful"){
        setToken(res.data.token);
        setUser(res.data.user);
        if(userData.userType == "user"){
            navigate("/userprofile");
        }
        else{
            navigate("/adminprofile");
        }
    }
    else{
        setMsg(res.data.message);
    }
  }

  return (
    <div className="login">
        <h1>Login</h1>
        <form action="" onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="usertype">
                <div className="radio1 radio">
                    <input type="radio" id="user" value="user" {...register("userType", {required: true})}/>
                    <label htmlFor="user">User</label>
                </div>
                <div className="radio2 radio">
                    <input type="radio" id="admin" value="admin" {...register("userType", {required: true})}/>
                    <label htmlFor="admin">Admin</label>
                </div>
            </div>
            {errors.userType?.type == "required" && <p>*Usertype is required</p>}
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" placeholder="Enter your email" {...register("email", {required: true})}/>
            {errors.email?.type == "required" && <p>*Email is required</p>}
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" placeholder="Enter your password" {...register("password", {required: true})}/>
            {errors.password?.type == "required" && <p>*Password is required</p>}
            <p className="para">{msg}</p>
            <button type="submit">Submit</button>
        </form>
    </div>
  );
}

export default Login;