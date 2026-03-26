import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function Vote() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const token = sessionStorage.getItem("token");
  const email = sessionStorage.getItem("voterEmail");

  // Redirect if not authenticated
  useEffect(() => {
    if (!token || !email) {
      navigate("/login");
      return;
    }
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/voting/getCandidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        sessionStorage.clear();
        navigate("/login");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load candidates.");
        return;
      }
      setCandidates(data);
    } catch (err) {
      setError("Could not reach the server. Check network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCandidate) {
      setError("Please select a candidate.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/voting/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cid: parseInt(selectedCandidate), email }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle already voted case
        if (data.error && data.error.toLowerCase().includes("already voted")) {
          navigate("/already-voted");
          return;
        }
        setError(data.error || data.details || "Vote submission failed.");
        return;
      }

      // Clear session after successful vote
      sessionStorage.clear();
      navigate("/success");
    } catch (err) {
      setError("Could not reach the server. Check network connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: "center" }}>
          <p className="hero-subtitle">Loading candidates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="hero-title">Cast Your Vote</h1>
        <p className="hero-subtitle">Select one candidate from the list below.</p>

        {candidates.length === 0 ? (
          <p style={{ color: "#94a3b8", marginTop: "20px" }}>
            No candidates available at this time.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {candidates.map((candidate) => (
              <label key={candidate.id} className="candidate-option">
                <input
                  type="radio"
                  name="candidate"
                  value={candidate.id}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                />
                {candidate.id} — {candidate.name}
              </label>
            ))}

            {error && (
              <p style={{ color: "#f87171", fontSize: "14px", marginTop: "8px" }}>
                {error}
              </p>
            )}

            <button type="submit" className="primary-btn" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Vote"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Vote;
