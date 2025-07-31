import "./ViewHalls.css";
import HallCard from "./HallCard";
import img from "../../assets/auditorium.jpg";
import {useState, useEffect} from "react";
import {useNavigate, useOutletContext} from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../config";

function ViewHalls() {

  let [halls, setHalls] = useState([]);
  let [selectedCard, setSelectedCard] = useState(null);
  let { setSelected, selectedDate, setSelectedDate, selectedHall, setSelectedHall } = useOutletContext();

  let navigate = useNavigate();

  useEffect(()=>{
    async function getHalls(){
      let res = await axios.get(`${BASE_URL}/user-api/halls`);
      setHalls(res.data.halls);
    }
    getHalls();
  },[]);

  function goToBookHall(){
    setSelectedHall(selectedCard.name);
    setSelectedDate(null);
    setSelected("bookhall"); 
    navigate("/userprofile/bookhall");
  }

  return (
    <div className="viewhalls">
      <h1>View Available Halls</h1>
      <div className="cards">
        {halls.map((hall, idx)=><HallCard onClick={()=>setSelectedCard(hall)} className="card" key={idx} hall={hall}/>)}
      </div>
      {selectedCard && <div className="popup" >
        <div className="closepopup" onClick={()=>setSelectedCard(null)}></div>
        <div className="popupbackground">
          <div className="popupcard">
            <img src={selectedCard.image == "" ? img : selectedCard.image} alt="hall image" />
            <h2>{selectedCard.name}</h2>
            <p><strong>Capacity:</strong> {selectedCard.capacity}</p>
            <p><strong>Location:</strong> {selectedCard.location}</p>
            <p><strong>Description:</strong> {selectedCard.description}</p>
            <div className="buttons">
              <p className="book" onClick={goToBookHall}>Book</p>
              <p className="close" onClick={()=>setSelectedCard(null)}>Close</p>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}

export default ViewHalls;