import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const ALLOWED_DOMAIN = "@mgits.ac.in";

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!email.toLowerCase().endsWith("@mgits.ac.in")) {
    setError("Please use your official MGITS email address.");
    return;
  }
  if (password.length < 8) {
    setError("Password must be at least 8 characters long.");
    return;
  }
  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.message); return; }
    sessionStorage.setItem("registerEmail", email);
    navigate("/verify-email");
  } catch {
    setError("Could not reach the server.");
  }
};

  return (
    <div className="page-container">
      <div>
        <h1 className="hero-title">Register</h1>

        <form onSubmit={handleSubmit} className="form-box">
          <input
            type="email"
            placeholder="College Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

export default Register;
