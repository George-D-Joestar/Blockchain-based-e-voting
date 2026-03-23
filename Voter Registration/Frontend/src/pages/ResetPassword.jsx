import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
  if (password !== confirm) { setError("Passwords do not match."); return; }

  const email = sessionStorage.getItem("fpEmail");
  const otp = sessionStorage.getItem("fpOtp");

  const res = await fetch("/api/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword: password })
  });
  const data = await res.json();
  if (!res.ok) { setError(data.message); return; }
  setShowSuccess(true);
};

  const handleSuccess = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="page-container">
      <div>
        <h1 className="hero-title">Reset Password</h1>

        <form onSubmit={handleSubmit} className="form-box">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="primary-btn">
            Update Password
          </button>
        </form>

        {showSuccess && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Password Updated Successfully</h3>
              <button onClick={handleSuccess} className="primary-btn">
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
