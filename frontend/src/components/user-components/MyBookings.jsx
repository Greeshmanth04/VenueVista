import "./MyBookings.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { userContext } from "../../contexts/UserContext";
import { tokenContext } from "../../contexts/TokenContext";
import BookingDetails from "../BookingDetails";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function MyBookings() {
  const [halls, setHalls] = useState([]);
  let [user, setUser] = useContext(userContext);
  const [bookings, setBookings] = useState([]);
  let [token, setToken] = useContext(tokenContext);
  let [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    async function getBookings() {
      try{
        let config = {
          headers: {
              Authorization: `Bearer ${token}`
          }
        }  
        let res = await axios.get(`${BASE_URL}/user-api/user-bookings/${user.email}`, config);
        if(res.data.userBookings){
          let sortedBookings = res.data.userBookings.sort((a, b) => {
            let dateA = new Date(a.date);
            let dateB = new Date(b.date);
            return dateB - dateA;
          });
          setBookings(sortedBookings);
        }
      }
      catch(err){
        console.log(err);
      }
    }
    getBookings();
  }, []);

  useEffect(() => {
    async function getHalls() {
      let res = await axios.get(`${BASE_URL}/user-api/halls`);
      setHalls(res.data.halls);
    }
    getHalls();
  }, []);

  async function cancelBooking(bookingObj){
    try{
      let config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }  
      let res = await axios.put(`${BASE_URL}/user-api/cancel-booking/${bookingObj.bookingID}`, {}, config);
      setBookings(prevBookings => prevBookings.map(b => b.bookingID == bookingObj.bookingID ? {...b, activeStatus: false, verifyStatus: false} : b));
    }
    catch(err){
      console.log(err);
    }
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  return (
    <div className="mybookings">
      <h1>My Bookings</h1>
      <div className="tablecontainer">
        <table>
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Hall</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Verify Status</th>
              <th>Cancel</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking, idx) => (
                <tr key={idx} className="row">
                  <td onClick={()=>setSelectedRow(booking)}>{idx + 1}</td>
                  <td onClick={()=>setSelectedRow(booking)}>{booking.hallname}</td>
                  <td onClick={()=>setSelectedRow(booking)}>{booking.date}</td>
                  <td style={{textTransform: "uppercase"}} onClick={()=>setSelectedRow(booking)}>{booking.slot}</td>
                  <td onClick={()=>setSelectedRow(booking)}>
                    {!halls.find(hall => hall.name == booking.hallname) ? (<p className="blocked">Hall Blocked / Removed</p>) 
                      : booking.verifyStatus === false && booking.activeStatus === true ? (<p className="pending">Pending...</p>) 
                      : booking.verifyStatus === true && booking.activeStatus === true ? (<p className="approved">Approved</p>) 
                      : booking.verifyStatus === false && booking.activeStatus === false ? (<p className="canceled">Canceled</p>) 
                      : booking.verifyStatus === true && booking.activeStatus === false ? (<p className="blocked">Blocked</p>) 
                      : null}
                  </td>
                  <td>
                    {booking.activeStatus == true 
                      && halls.find(hall => hall.name == booking.hallname) 
                      && new Date(booking.date) >= today 
                      ? <p className="cancel" onClick={()=>cancelBooking(booking)}>Cancel</p> 
                      : <p className="none">---</p>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No bookings available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {selectedRow && <BookingDetails selectedRow={selectedRow} setSelectedRow={setSelectedRow}/>}
    </div>
  );
}

export default MyBookings;