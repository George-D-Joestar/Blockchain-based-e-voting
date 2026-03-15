import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Authenticator() {

  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Please enter the verification code.");
      return;
    }

    navigate("/welcome");
  };

  return (
    <div className="page-container">

      <div className="card">

        <h1 className="hero-title" style={{ fontSize: "34px" }}>
          Authenticator Verification
        </h1>

        <p className="hero-subtitle">
          Enter the 6-digit code from your authenticator app.
        </p>

        <form onSubmit={handleVerify}>

          <input
            type="text"
            placeholder="6-digit verification code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button type="submit" className="primary-btn">
            Verify
          </button>

        </form>

      </div>

    </div>
  );
}

export default Authenticator;