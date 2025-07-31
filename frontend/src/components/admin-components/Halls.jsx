import "./Halls.css";
import AdminHallCard from "./AdminHallCard.jsx";
import {useState, useEffect} from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { useContext } from "react";
import { tokenContext } from "../../contexts/TokenContext";
import { BASE_URL } from "../../config.js";

function Halls() {

  let {register, handleSubmit, formState:{errors}, setValue} = useForm();

  let [halls, setHalls] = useState([]);
  let [selectedHall, setSelectedHall] = useState(null);
  let [addHall, setAddHall] = useState(false);
  let [msg, setMsg] = useState("");
  let [token, setToken] = useContext(tokenContext);
  const [postImage, setPostImage] = useState( { myFile : ""})

  useEffect(()=>{
    async function getHalls(){
      let res = await axios.get(`${BASE_URL}/admin-api/halls`);
      setHalls(res.data.halls);
    }
    getHalls();
  },[]);

  useEffect(()=>{
    if(selectedHall){
      setValue("name", selectedHall.name);
      setValue("capacity", selectedHall.capacity);
      setValue("location", selectedHall.location);
      setValue("description", selectedHall.description);
    }
    else{
      setValue("name", "");
      setValue("capacity", "");
      setValue("location", "");
      setValue("description", "");
    }
  },[selectedHall, setValue]);

  useEffect(() => {
  if (errors.name?.type === "required" || 
      errors.capacity?.type === "required" || 
      errors.location?.type === "required" || 
      errors.description?.type === "required") {
    setMsg("*All details are required");
  } else {
    setMsg(""); 
  }
}, [errors]);

  async function handleHallUpdate(hallData){
    try{
      let config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }  
      hallData.id = selectedHall.id;
      hallData.blockStatus = false;
      hallData.image = postImage.myFile;
      let res = await axios.put(`${BASE_URL}/admin-api/hall`, hallData, config);
      setHalls(prevHalls => prevHalls.map(h => h.id === selectedHall.id ? {...h, ...hallData} : h));
      closePopup();
    }
    catch(err){
      console.log(err);
    }
  }

  async function handleAddHall(hallData){
    try{
      let config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }  
      hallData.id = Date.now();
      hallData.blockStatus = false;
      hallData.image = postImage.myFile;
      let res = await axios.post(`${BASE_URL}/admin-api/hall`, hallData, config);
      setHalls(prevHalls => [...prevHalls, res.data.hall]);
      closePopup();
    }
    catch(err){
      console.log(err);
    }
  }

  async function deleteHall(){
    try{
      let config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }  
      let res = await axios.delete(`${BASE_URL}/admin-api/hall/${selectedHall.name}`, config);
      setHalls(prevHalls => prevHalls.filter(h => h.name !== selectedHall.name));
      closePopup();
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

  function closePopup(){
    setValue("name", "");
    setValue("capacity", "");
    setValue("location", "");
    setValue("description", "");
    setMsg("");
    setAddHall(false);
    setSelectedHall(null);
    setPostImage({ myFile: "" });
  }

  return (
    <div className="halls"> 
      <h1>Halls / Auditoriums</h1>
      <div className="cards">
        {halls.map((hall, idx)=><AdminHallCard onClick={()=>setSelectedHall(hall)} className="card" key={idx} hall={hall}/>)}
        <div className="addhallcard" onClick={()=>setAddHall(true)} >
            <div className="details">
                <div className="circle">
                    <div className="bar bar1"></div>
                    <div className="bar bar2"></div>
                    <div className="bar bar3"></div>
                </div>
            </div>
        </div>
      </div>
      {selectedHall && <div className="popup" >
        <div className="closepopup" onClick={closePopup}></div>
        <div className="popupbackground">
          <div className="popupcard">
            <form action="" onSubmit={handleSubmit(handleHallUpdate)}>
                <div className="hallname-delete">
                  <label htmlFor="name">Hallname:</label>
                  <p className="delete" onClick={deleteHall}>delete</p>
                </div>
                <input type="text" id="name" {...register("name", {required: true})}/>
                <label htmlFor="capacity">Capacity:</label>
                <input type="number" id="capacity" min="1" {...register("capacity", {required: true})}/>
                <label htmlFor="location">Location:</label>
                <input type="text" id="location" {...register("location", {required: true})}/>
                <label htmlFor="description">Description:</label>
                <textarea id="description" {...register("description", {required: true})}></textarea>
                <label htmlFor="image">Upload Image:</label>
                <input type="file" id="image" {...register("image")} onChange={(e) => handleFileUpload(e)}/>
                <p>{msg}</p>
                <div className="buttons">
                  <button className="edit" type="submit">Edit</button>
                  <p className="close" onClick={closePopup}>Close</p>
                </div>
            </form>
          </div>
        </div>
      </div>}
      {addHall && <div className="popup" >
        <div className="closepopup" onClick={(closePopup)}></div>
        <div className="popupbackground">
          <div className="popupcard">
            <form action="" onSubmit={handleSubmit(handleAddHall)}>
                <label htmlFor="name">Hallname:</label>
                <input type="text" id="name" {...register("name", {required: true})}/>
                <label htmlFor="capacity">Capacity:</label>
                <input type="number" id="capacity" min="1" {...register("capacity", {required: true})}/>
                <label htmlFor="location">Location:</label>
                <input type="text" id="location" {...register("location", {required: true})}/>
                <label htmlFor="description">Description:</label>
                <textarea id="description" rows="4" cols="60"{...register("description", {required: true})}></textarea>
                <label htmlFor="image">Upload Image:</label>
                <input type="file" id="image" {...register("image")} onChange={(e) => handleFileUpload(e)}/>
                <p>{msg}</p>
                <div className="buttons">
                  <button className="edit" type="submit">Add Hall</button>
                  <p className="close" onClick={closePopup}>Close</p>
                </div>
            </form>
          </div>
        </div>
      </div>}
    </div>
  );
}

export default Halls;