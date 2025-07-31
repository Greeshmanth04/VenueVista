import "./BookHall.css";
import {useForm} from "react-hook-form";
import axios from "axios";
import { useState, useEffect } from "react";
import { useContext } from "react";
import { tokenContext } from "../../contexts/TokenContext";
import { userContext } from "../../contexts/UserContext";
import { useOutletContext } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;

function BookHall() {

  let {register, handleSubmit, formState: {errors}, setValue} = useForm();

  let [msg, setMsg] = useState("");
  let [token, setToken] = useContext(tokenContext);
  let [user, setUser] = useContext(userContext);
  let [halls, setHalls] = useState([]);
  let {setSelected, selectedDate, setSelectedDate, selectedHall, setSelectedHall} = useOutletContext();
  const [postImage, setPostImage] = useState( { myFile : ""})

  useEffect(()=>{
    async function getHalls(){
      let res = await axios.get(`${BASE_URL}/user-api/halls`);
      setHalls(res.data.halls);
    }
    getHalls();
  }, []);

  useEffect(()=>{
    if (selectedDate) {
      const d = new Date(selectedDate);
      const formattedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      setValue("date", formattedDate);
      console.log("Formatted Date:", formattedDate);
    }
    if (selectedHall) {
      setValue("hallname", selectedHall);
    }
  }, [setValue, selectedHall, selectedDate]);

  const handleHallChange = (e) => {
    setSelectedHall(e.target.value);
  };
  
  async function handleFormSubmit(bookingData){
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxBookingDate = new Date(today);
    maxBookingDate.setDate(maxBookingDate.getDate() + 30);
    if (new Date(bookingData.date) < today) {
      setMsg("Booking dates in the past are not allowed.");
      return;
    }
    if (new Date(bookingData.date) > maxBookingDate) {
      setMsg("Booking dates are only allowed within 30 days from today.");
      return;
    }
    try{
      let config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }  
      bookingData.bookingEmail = user.email;
      bookingData.bookingID = Date.now();
      bookingData.dateOfBooking = new Date();
      bookingData.verifyStatus = false;
      bookingData.activeStatus = true;
      bookingData.image = postImage.myFile;
      let res = await axios.post(`${BASE_URL}/user-api/booking`, bookingData, config);
      setMsg(res.data.message);
    }
    catch(err){
      console.log(err);
    }
  }

  async function handleFileUpload(e){
    const file = e.target.files[0];
    if(file == null){
      setMsg("");
      return;
    }
    if(!file.type.startsWith("image/")) {
      setMsg("Invalid file type. Please upload an image.");
      return;
    }
    if(file.size > 120000){
      setMsg("Image size too large");
      return;
    }
    setMsg("");
    const base64 = await convertToBase64(file);
    setPostImage({ ...postImage, myFile : base64 });
  }

  function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        fileReader.onload = () => resolve(fileReader.result);
        fileReader.onerror = (error) => reject(error);
    });
  }

  return (
    <div className="bookhall">
      <h1>Book Hall</h1>
      <form action="" onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="content content1">
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" placeholder={user.email} disabled />
          <label htmlFor="hallname">Hall:</label>
          <select id="hallname" {...register("hallname", {required: true})} value={selectedHall} onChange={handleHallChange}>
            <option value="" disabled>--Select hall--</option>
            {halls.map((hall, idx)=> <option key={idx} value={hall.name}>{hall.name}</option>)}
          </select>
          {errors.hallname?.type == "required" && <p>*Hall is required</p>}
          <label htmlFor="date">Date:</label>
          <input type="date" id="date" placeholder="Enter your date" {...register("date", {required: true})}/>
          {errors.date?.type == "required" && <p>*Date is required</p>}
          <label htmlFor="slot">Slot:</label>
          <div className="slot">
              <div className="radio1 radio">
                  <input type="radio" id="fn" value="fn" {...register("slot", {required: true})}/>
                  <label htmlFor="fn">FN (10:00 - 1:00)</label>
              </div>
              <div className="radio2 radio">
                  <input type="radio" id="an" value="an" {...register("slot", {required: true})}/>
                  <label htmlFor="an">AN (1:40 - 4:40)</label>
              </div>
          </div>
          {errors.slot?.type == "required" && <p>*Slot is required</p>}
        </div>
        <div className="content content2">
          <label htmlFor="eventName">Event Name:</label>
          <input type="text" id="eventName" placeholder={"Enter event name"} {...register("eventName", {required: true})}/>
          {errors.eventName?.type === "required" && <p>*Event name is required</p>}
          <label htmlFor="eventDescription">Event Description:</label>
          <textarea id="eventDescription" placeholder={"Enter event details"} {...register("eventDescription", {required: true})}/>
          {errors.eventDescription?.type === "required" && <p>*Event description is required</p>}
          <div className="eventimage">
            <label htmlFor="image">Event Poster:</label>
            <input type="file" id="image" {...register("image")} onChange={(e) => handleFileUpload(e)}/>
          </div>          
          <p style={{marginTop: "10px"}}>{msg}</p>
          <button type="submit">Make Booking</button>
        </div>
      </form>
    </div>
  );
}

export default BookHall;