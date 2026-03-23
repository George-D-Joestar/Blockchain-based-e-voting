import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Authenticator() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [qr, setQr] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const email = sessionStorage.getItem("registerEmail");

  useEffect(() => {
    fetch("/api/setup-totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    })
      .then(r => r.json())
      .then(data => setQr(data.qr));
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Code must be 6 digits.");
      return;
    }
    const res = await fetch("/api/verify-totp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code })
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
        <h1 className="hero-title">Set Up Authenticator</h1>
        <p className="hero-subtitle">Scan the QR code using Microsoft Authenticator.</p>
        <div style={{ marginTop: "30px" }}>
          {qr
            ? <img src={qr} alt="QR Code" style={{ width: 160, borderRadius: 8 }} />
            : <p style={{ color: "#94a3b8" }}>Loading QR...</p>
          }
        </div>
        <form onSubmit={handleSubmit} className="form-box">
          <input type="text" placeholder="Enter 6-digit code" maxLength="6"
            value={code} onChange={(e) => setCode(e.target.value)} />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="primary-btn">Confirm</button>
        </form>
        {showSuccess && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>Registration Complete!</h3>
              <button onClick={handleSuccess} className="primary-btn">OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Authenticator;
