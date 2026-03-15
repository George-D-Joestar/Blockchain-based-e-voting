import { useNavigate } from "react-router-dom";

function VoteSuccess() {

  const navigate = useNavigate();

  return (
    <div className="page-container">

      <div>

        <h1 className="hero-title">
          Voting Completed
        </h1>

        <p className="hero-subtitle">
          Your vote has been successfully recorded.
        </p>

        <button className="primary-btn" onClick={() => navigate("/")}>
          Return to Home
        </button>

      </div>

    </div>
  );
}

export default VoteSuccess;