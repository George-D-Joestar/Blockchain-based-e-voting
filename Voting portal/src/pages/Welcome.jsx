import { useNavigate } from "react-router-dom";

function Welcome() {

  const navigate = useNavigate();

  const goToVote = () => {
    navigate("/vote");
  };

  return (
    <div className="page-container">

      <div>

        <h1 className="hero-title">
          Institutional Voting Portal
        </h1>

        <p className="hero-subtitle">
          You have successfully logged in. Proceed to cast your vote.
        </p>

        <button className="primary-btn" onClick={goToVote}>
          Proceed to Vote
        </button>

      </div>

    </div>
  );
}

export default Welcome;