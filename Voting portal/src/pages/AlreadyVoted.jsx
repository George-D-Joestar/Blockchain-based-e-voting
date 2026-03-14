import { useNavigate } from "react-router-dom";

function AlreadyVoted() {

  const navigate = useNavigate();

  return (
    <div className="page-container">

      <div>

        <h1 className="hero-title">
          Vote Already Recorded
        </h1>

        <p className="hero-subtitle">
          Our system indicates that you have already cast your vote.
        </p>

        <button className="primary-btn" onClick={() => navigate("/")}>
          Return to Home
        </button>

      </div>

    </div>
  );
}

export default AlreadyVoted;