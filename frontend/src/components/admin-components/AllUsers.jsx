import "./AllUsers.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { tokenContext } from "../../contexts/TokenContext";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function AllUsers() {
  const [users, setUsers] = useState([]);
  let [token, setToken] = useContext(tokenContext);

  useEffect(() => {
    async function getUsers() {
      try{
        let config = {
          headers: {
              Authorization: `Bearer ${token}`
          }
        }  
        let res = await axios.get(`${BASE_URL}/admin-api/users`, config);
        if (res.data.users){
          let verifiedUsers = res.data.users.filter(u => u.verifyStatus == true);
          setUsers(verifiedUsers);
        }
      }
      catch(err){
        console.log(err);
      }
    }
    getUsers();
  }, []);

  async function blockUser(userObj){
    try{
      let config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }  
      let res = await axios.put(`${BASE_URL}/admin-api/block-user/${userObj.email}`, {}, config);
      if(userObj.activeStatus == false){
        setUsers(prevUsers => prevUsers.map(u => u.email == userObj.email ? {...u, activeStatus: true} : u));
      }
      else{
        setUsers(prevUsers => prevUsers.map(u => u.email == userObj.email ? {...u, activeStatus: false} : u));
      }
    }
    catch(err){
      console.log(err);
    }
  }

  return (
    <div className="allusers">
      <h1>All Users</h1>
      <div className="tablecontainer">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>Club</th>
              <th>Role</th>
              <th>Block</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, idx) => (
                <tr key={idx} className={user.activeStatus === false ? "blockedRow" : undefined}>
                  <td>{user.email}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.club}</td>
                  <td>{user.role}</td>
                  <td><div className="block" onClick={()=>blockUser(user)}>🚫︎</div></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No Users Available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllUsers;