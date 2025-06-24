import "./VerifyBookings.css";
import axios from "axios";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { tokenContext } from "../../contexts/TokenContext";
import BookingDetails from "../BookingDetails";

function VerifyBookings() {
  const [bookings, setBookings] = useState([]);
  let [token, setToken] = useContext(tokenContext);
  let [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    async function getBookings() {
      let res = await axios.get("http://localhost:4000/admin-api/bookings");
      let nonVerifiedBookings = res.data.bookings.filter(b => b.verifyStatus == false && b.activeStatus == true);
      setBookings(nonVerifiedBookings);
    }
    getBookings();
  }, []);

  async function verifyBooking(bookingObj){
    let config = {
      headers: {
          Authorization: `Bearer ${token}`
      }
    }   
    let tokenRes = await axios.get("http://localhost:4000/admin-api/protectedLogin", config);
    if(tokenRes.data.message == "token verified successfully"){
      let res = await axios.put(`http://localhost:4000/admin-api/verify-booking/${bookingObj.bookingID}`);
      setBookings(prevBookings => prevBookings.filter(b => b.bookingID != bookingObj.bookingID));
      console.log(res.data.message);
    }
    else{
      console.log(tokenRes.data.message);
    }
  }

  async function rejectBooking(bookingObj){
    let config = {
      headers: {
          Authorization: `Bearer ${token}`
      }
    }   
    let tokenRes = await axios.get("http://localhost:4000/admin-api/protectedLogin", config);
    if(tokenRes.data.message == "token verified successfully"){
      let res = await axios.put(`http://localhost:4000/admin-api/block-booking/${bookingObj.bookingID}`);
      setBookings(prevBookings => prevBookings.filter(b => b.bookingID != bookingObj.bookingID));
      console.log(res.data.message);
    }
    else{
      console.log(tokenRes.data.message);
    }
  }

  function showDetails(bookingData){
    setSelectedRow(bookingData)
  }

  return (
    <div className="verifybookings">
      <h1>Verify Bookings</h1>
      <div className="tablecontainer">
        <table>
          <thead>
            <tr>
              <th>Booking Email</th>
              <th>Hall</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Verify</th>
              <th>Reject</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking, idx) => (
                <tr key={idx} className="row">
                  <td onClick={()=>showDetails(booking)}>{booking.bookingEmail}</td>
                  <td onClick={()=>showDetails(booking)}>{booking.hallname}</td>
                  <td onClick={()=>showDetails(booking)}>{booking.date}</td>
                  <td style={{textTransform: "uppercase"}} onClick={()=>showDetails(booking)}>{booking.slot}</td>
                  <td><div className="verify" onClick={()=>verifyBooking(booking)}>✔</div></td>
                  <td><div className="reject" onClick={()=>rejectBooking(booking)}>X</div></td>
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

export default VerifyBookings;