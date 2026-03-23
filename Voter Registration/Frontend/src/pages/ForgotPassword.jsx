import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  if (!email.endsWith("@mgits.ac.in")) {
    setError("Please use your registered MGITS email.");
    return;
  }
  const res = await fetch("/api/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) { setError(data.message); return; }
  sessionStorage.setItem("fpEmail", email);
  navigate("/forgot-password-otp");
};

  return (
    <div className="page-container">
      <div>
        <h1 className="hero-title">Forgot Password</h1>

        <form onSubmit={handleSubmit} className="form-box">
          <input
            type="email"
            placeholder="Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn">
            Next
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
