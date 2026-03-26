import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const mgitsEmailPattern = /^[a-zA-Z0-9._%+-]+@mgits\.ac\.in$/;
    if (!mgitsEmailPattern.test(email)) {
      setError("Only institutional email addresses (@mgits.ac.in) are allowed.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      // Store email for the OTP step
      sessionStorage.setItem("voterEmail", email);
      navigate("/authenticator");
    } catch (err) {
      setError("Could not reach the server. Check network connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h1 className="hero-title">Institutional Voting Portal</h1>
        <p className="hero-subtitle">Enter your credentials to continue.</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Institution Email (@mgits.ac.in)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: "#f87171", fontSize: "14px", marginTop: "8px" }}>{error}</p>}
          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
