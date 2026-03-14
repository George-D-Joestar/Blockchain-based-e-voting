import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Vote() {

  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState("");

  const candidates = [
    { id: 1, name: "Candidate A" },
    { id: 2, name: "Candidate B" },
    { id: 3, name: "Candidate C" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedCandidate) {
      alert("Please select a candidate.");
      return;
    }

    localStorage.setItem("voted", "true");

    navigate("/success");
  };

  return (
    <div className="page-container">

      <div className="card">

        <h1 className="hero-title">
          Cast Your Vote
        </h1>

        <p className="hero-subtitle">
          Select one candidate from the list below.
        </p>

        <form onSubmit={handleSubmit}>

          {candidates.map((candidate) => (
            <label key={candidate.id} className="candidate-option">

              <input
                type="radio"
                name="candidate"
                value={candidate.id}
                onChange={(e) => setSelectedCandidate(e.target.value)}
              />

              {candidate.id} - {candidate.name}

            </label>
          ))}

          <button type="submit" className="primary-btn">
            Submit Vote
          </button>

        </form>

      </div>

    </div>
  );
}

export default Vote;