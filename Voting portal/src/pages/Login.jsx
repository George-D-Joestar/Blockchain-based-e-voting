import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const mgitsEmailPattern = /^[a-zA-Z0-9._%+-]+@mgits\.ac\.in$/;

    if (!mgitsEmailPattern.test(email)) {
      alert("Only institutional email addresses (@mgits.ac.in) are allowed.");
      return;
    }

    if (!password) {
      alert("Please enter your password.");
      return;
    }

    navigate("/authenticator");
  };

  return (
    <div className="page-container">

      <div className="card">

        <h1 className="hero-title">
          Institutional Voting Portal
        </h1>

        <p className="hero-subtitle">
          Enter your credentials to continue.
        </p>

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

          <button type="submit" className="primary-btn">
            Login
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;