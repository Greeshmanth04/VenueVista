import "./VerifyUsers.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { tokenContext } from "../../contexts/TokenContext";

function VerifyUsers() {
  const [users, setUsers] = useState([]);
  let [token, setToken] = useContext(tokenContext);

  useEffect(() => {
    async function getUsers() {
      let res = await axios.get("http://localhost:4000/admin-api/users");
      let nonVerifiedUsers = res.data.users.filter(u => u.verifyStatus == false && u.activeStatus == true);
      setUsers(nonVerifiedUsers);
    }
    getUsers();
  }, []);

  async function verifyUser(userObj){
    let config = {
      headers: {
          Authorization: `Bearer ${token}`
      }
    }   
    let tokenRes = await axios.get("http://localhost:4000/admin-api/protectedLogin", config);
    if(tokenRes.data.message == "token verified successfully"){
      let res = await axios.put(`http://localhost:4000/admin-api/verify-user/${userObj.email}`);
      setUsers(prevUsers => prevUsers.filter(u => u.email != userObj.email));
      console.log(res.data.message);
    }
    else{
      console.log(tokenRes.data.message);
    }
  }

  async function rejectUser(userObj){
    let config = {
      headers: {
          Authorization: `Bearer ${token}`
      }
    }   
    let tokenRes = await axios.get("http://localhost:4000/admin-api/protectedLogin", config);
    if(tokenRes.data.message == "token verified successfully"){
      let res = await axios.put(`http://localhost:4000/admin-api/block-user/${userObj.email}`);
      setUsers(prevUsers => prevUsers.filter(b => b.email != userObj.email));
      console.log(res.data.message);
    }
    else{
      console.log(tokenRes.data.message);
    }
  }

  return (
    <div className="verifyusers">
      <h1>Verify Users</h1>
      <div className="tablecontainer">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>Club</th>
              <th>Role</th>
              <th>Verify</th>
              <th>Reject</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user, idx) => (
                <tr key={idx}>
                  <td>{user.email}</td>
                  <td>{user.firstname}</td>
                  <td>{user.lastname}</td>
                  <td>{user.club}</td>
                  <td>{user.role}</td>
                  <td><div className="verify" onClick={()=>verifyUser(user)}>✔</div></td>
                  <td><div className="reject" onClick={()=>rejectUser(user)}>X</div></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No Users Available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VerifyUsers;