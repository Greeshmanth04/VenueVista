import "./Home.css";
import img from "../assets/auditorium.jpg";

function Home() {

  return (
    <div className="home">
        <div className="content">
            <h1>Campus Hall</h1>
            <h2>Booking</h2>
            <p>Your perfect venue is just a few clicks away – explore a wide selection of halls tailored to your needs, check real-time availability, book instantly, and effortlessly manage your reservations all in one user-friendly platform.</p>
        </div>
        <img src={img} alt="" />
    </div>
  );
}

export default Home;