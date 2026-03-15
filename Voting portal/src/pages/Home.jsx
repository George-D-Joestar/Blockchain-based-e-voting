import { useNavigate } from "react-router-dom";

function Home() {

  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="page-container">

      <div style={{ textAlign: "center" }}>

        <h1 className="hero-title" style={{ fontSize: "52px", marginBottom: "20px" }}>
          Institutional Voting Portal
        </h1>

        <p className="hero-subtitle" style={{ marginBottom: "50px" }}>
          Welcome to the secure e-voting system.
        </p>

        <button
          className="primary-btn"
          style={{ width: "220px" }}
          onClick={goToLogin}
        >
          Login to Vote
        </button>

      </div>

    </div>
  );
}

export default Home;