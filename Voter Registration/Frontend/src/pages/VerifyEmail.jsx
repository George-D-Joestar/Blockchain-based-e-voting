import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function VerifyEmail() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("registerEmail");
    if (!storedEmail) {
      navigate("/register");
    } else {
      setEmail(storedEmail);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!/^\d{6}$/.test(otp)) {
    setError("OTP must be a 6-digit number.");
    return;
  }

  try {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    navigate("/authenticator");
  } catch {
    setError("Could not reach the server.");
  }
};

  return (
    <div className="page-container">
      <div>
        <h1 className="hero-title">Email Verification</h1>

        <p className="hero-subtitle">
          Enter the 6-digit OTP sent to:
        </p>

        <p style={{ marginTop: "10px", fontWeight: "500" }}>
          {email}
        </p>

        <form onSubmit={handleSubmit} className="form-box">
          <input
            type="text"
            placeholder="Enter OTP"
            maxLength="6"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn">
            Verify
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmail;
