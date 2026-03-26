import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function Authenticator() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = sessionStorage.getItem("voterEmail");

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "OTP verification failed.");
        return;
      }

      // Store JWT token for use in the vote step
      sessionStorage.setItem("token", data.token);
      navigate("/welcome");
    } catch (err) {
      setError("Could not reach the server. Check network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: "34px" }}>
          Authenticator Verification
        </h1>
        <p className="hero-subtitle">
          Enter the 6-digit OTP sent to your registered email.
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            placeholder="6-digit verification code"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          {error && <p style={{ color: "#f87171", fontSize: "14px", marginTop: "8px" }}>{error}</p>}
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Authenticator;
