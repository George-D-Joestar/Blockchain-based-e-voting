import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Authenticator from "./pages/Authenticator";
import Welcome from "./pages/Welcome";
import Vote from "./pages/Vote";
import VoteSuccess from "./pages/VoteSuccess";
import AlreadyVoted from "./pages/AlreadyVoted";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/authenticator" element={<Authenticator />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/vote" element={<Vote />} />
        <Route path="/success" element={<VoteSuccess />} />
        <Route path="/already-voted" element={<AlreadyVoted />} />

      </Routes>
    </Router>
  );
}

export default App;