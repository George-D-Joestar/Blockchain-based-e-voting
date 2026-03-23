import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPasswordOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  if (!/^\d{6}$/.test(otp)) { setError("OTP must be 6 digits."); return; }
  sessionStorage.setItem("fpOtp", otp);
  navigate("/reset-password");
};

  return (
    <div className="page-container">
      <div>
        <h1 className="hero-title">Verify Email</h1>

        <form onSubmit={handleSubmit} className="form-box">
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
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

export default ForgotPasswordOtp;
