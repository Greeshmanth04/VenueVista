import "./Registration.css";
import {useState} from "react";
import {useForm} from "react-hook-form";
import axios from "axios";
import { BASE_URL } from "../config";

function Registration() {

  let [msg, setMsg] = useState("");

  let {register, handleSubmit, formState: {errors}} = useForm();

  async function handleFormSubmit(userData){
    userData.userType = "user";
    userData.verifyStatus = false;
    userData.activeStatus = true;
    let res = await axios.post(`${BASE_URL}/user-api/user`, userData);
    setMsg(res.data.message);
  }

  return (
    <div className="registration">
        <h1>Register</h1>
        <form action="" onSubmit={handleSubmit(handleFormSubmit)}>
            <label htmlFor="firstname">Firstname:</label>
            <input type="text" id="firstname" placeholder="Enter your firstname" {...register("firstname", {required: true})}/>
            {errors.firstname?.type == "required" && <p>*Firstname is required</p>}
            <label htmlFor="lastname">Lastname:</label>
            <input type="text" id="lastname" placeholder="Enter your lastname" {...register("lastname", {required: true})}/>
            {errors.lastname?.type == "required" && <p>*Lastname is required</p>}
            <label htmlFor="role">Role:</label>
            <input type="text" id="role" placeholder="Enter your role" {...register("role", {required: true})}/>
            {errors.role?.type == "required" && <p>*Role is required</p>}
            <label htmlFor="club">Club:</label>
            <input type="text" id="club" placeholder="Enter your club name" {...register("club", {required: true})}/>
            {errors.club?.type == "required" && <p>*Club is required</p>}
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

export default Registration;