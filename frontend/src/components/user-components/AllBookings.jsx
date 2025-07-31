import "./AllBookings.css";
import "react-calendar/dist/Calendar.css"; 
import axios from "axios";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useContext } from "react";
import { tokenContext } from "../../contexts/TokenContext";
import { useOutletContext , useNavigate} from "react-router-dom";
import BookingDetails from "../BookingDetails";
import { BASE_URL } from "../../config";

function AllBookings() {
  const [halls, setHalls] = useState([]);
  const [bookings, setBookings] = useState([]);
  let [token, setToken] = useContext(tokenContext);
  let { setSelected, selectedDate, setSelectedDate, selectedHall, setSelectedHall } = useOutletContext();
  let navigate = useNavigate();
  let [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    async function getHalls() {
      let res = await axios.get(`${BASE_URL}/user-api/halls`);
      setHalls(res.data.halls);
    }
    getHalls();
  }, []);

  async function handleSelection(hallname) {
    let res = await axios.get(`${BASE_URL}/user-api/hall-bookings/${hallname}`);  
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let sortedBookings = res.data.bookings
    .filter((b) => new Date(b.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
    setBookings(sortedBookings);
    setSelectedHall(hallname);
  }

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dateBookings = bookings.filter(
        (b) => new Date(b.date).toDateString() === date.toDateString()
      );
      const hasFN = dateBookings.some((b) => b.slot === "fn");
      const hasAN = dateBookings.some((b) => b.slot === "an");

      if (hasFN && hasAN) {
        return <><div className="semicircle fn">FN</div><div className="semicircle an">AN</div></>; 
      } else if (hasFN) {
        return <div className="semicircle fn">FN</div>;
      } else if (hasAN) {
        return <div className="semicircle an">AN</div>; 
      }
    }
    return null;
  };

  function goToBookHall(date){
    setSelectedDate(date);
    setSelected("bookhall");
    navigate("/userprofile/bookhall");
  }

  return (
    <div className="allbookings">
      <h1>All Bookings</h1>
      <div className="content">
        <div className="select-calendar">
          <div className="selecthall">
            <select id="hallname" onChange={(e) => handleSelection(e.target.value)} name="hallname">
              <option value="" selected disabled>--Select hall--</option>
              {halls.map((hall, idx) => (
                <option key={idx} value={hall.name}>{hall.name}</option>
              ))}
            </select>
          </div>
          <div className="calendar-container">
            <Calendar
              minDate={new Date()}
              maxDate={new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)}
              minDetail="year"
              tileContent={tileContent}
              onClickDay={goToBookHall}
            />
          </div>
        </div>
        <div className="tablecontainer">
          <table>
            <thead>
              <tr>
                <th>Booking Email</th>
                <th>Hall</th>
                <th>Date</th>
                <th>Slot</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking, idx) => (
                  <tr key={idx} onClick={()=>setSelectedRow(booking)} className="row">
                    <td>{booking.bookingEmail}</td>
                    <td>{booking.hallname}</td>
                    <td>{booking.date}</td>
                    <td style={{textTransform: "uppercase"}}>{booking.slot}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">No bookings available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {selectedRow && <BookingDetails selectedRow={selectedRow} setSelectedRow={setSelectedRow}/>}
      </div>
    </div>
  );
}

export default AllBookings;