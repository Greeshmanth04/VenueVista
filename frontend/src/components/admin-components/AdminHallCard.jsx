import "./AdminHallCard.css";
import img from "../../assets/auditorium.jpg";
import { useState } from "react";
import { tokenContext } from "../../contexts/TokenContext";
import { useContext } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";

function AdminHallCard(props) {

  let [blockStatus, setBlockStatus] = useState(props.hall.blockStatus);
  let [token, setToken] = useContext(tokenContext);

  async function toggleblock(){
    try{
      let config = {
        headers: {
            Authorization: `Bearer ${token}`
        }
      }  
      if(blockStatus == false){
        setBlockStatus(true);
      }
      else{
        setBlockStatus(false);
      }
      let res = await axios.put(`${BASE_URL}/admin-api/block-hall/${props.hall.name}`, {}, config);
    }
    catch(err){
      console.log(err);
    }
  }

  let str = props.hall.name + " | " + props.hall.location + " | " + props.hall.capacity; 

  return (
    <div className="adminhallcard">
        <div className={blockStatus==false ? "details": "details blocked"} onClick={blockStatus === false ? props.onClick : undefined}>
            <img src={props.hall.image == "" ? img : props.hall.image} alt="hall image" />
            <div className="details1">
                <p>{str.length > 27 ? `${str.substring(0, 27)}...` : `${str.substring(0, 30)}`}</p>
            </div>
            <div className="details2">
                <p>{props.hall.description.substring(0, 68)}...</p>
            </div>  
            <p className="viewmore">View More</p>
        </div>
        <div className={blockStatus==false ? "blockbutton": "blockbuttonblocked"}>
          <p>Block: </p>
          <div className={blockStatus==false ? "toggle": "toggleblocked"} onClick={toggleblock}>
            <div className={blockStatus==false ? "circle": "circleblocked"}></div>
          </div>
        </div>
    </div>  
  );
}

export default AdminHallCard;