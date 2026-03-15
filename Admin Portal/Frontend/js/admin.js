// ── CONFIG ──
    const BACKEND = "http://localhost:3000";
    const ADMIN_USER = "user";
    const ADMIN_PASS = "admin123"; // change this to whatever you want

    // ── LOGIN ──
    document.getElementById("loginPass").addEventListener("keydown", e => {
        if (e.key === "Enter") doLogin();
    });

    function doLogin() {
        const u = document.getElementById("loginUser").value.trim();
        const p = document.getElementById("loginPass").value;
        const err = document.getElementById("loginError");

        if (u === ADMIN_USER && p === ADMIN_PASS) {
            document.getElementById("loginScreen").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            checkVotingStatus();
        } else {
            err.style.display = "block";
            document.getElementById("loginPass").value = "";
        }
    }

    function doLogout() {
        document.getElementById("loginScreen").style.display = "flex";
        document.getElementById("dashboard").style.display = "none";
        document.getElementById("loginUser").value = "";
        document.getElementById("loginPass").value = "";
    }

    // ── SHOW MESSAGE ──
    function showMsg(id, text, isError) {
        const el = document.getElementById(id);
        el.className = "response-msg " + (isError ? "msg-error" : "msg-success");
        el.innerHTML = text;
        el.style.display = "block";
        setTimeout(() => { el.style.display = "none"; }, 4000);
    }

    // ── ADD CANDIDATE ──
    async function addCandidate() {
        const name = document.getElementById("addName").value.trim();
        if (!name) { showMsg("addMsg", "⚠ Enter a candidate name", true); return; }

        try {
            const res = await fetch(`${BACKEND}/addCandidate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            const data = await res.json();
            if (data.success) {
                showMsg("addMsg", "✓ " + data.message, false);
                document.getElementById("addName").value = "";
                loadCandidates();
            } else {
                showMsg("addMsg", "⚠ " + data.message, true);
            }
        } catch (e) {
            showMsg("addMsg", "⚠ Could not reach backend", true);
        }
    }

    // ── REMOVE CANDIDATE ──
    async function removeCandidate() {
        const cid = document.getElementById("removeId").value.trim();
        if (!cid) { showMsg("removeMsg", "⚠ Enter a candidate ID", true); return; }

        try {
            const res = await fetch(`${BACKEND}/removeCandidate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cid: parseInt(cid) })
            });
            const data = await res.json();
            if (data.success) {
                showMsg("removeMsg", "✓ " + data.message, false);
                document.getElementById("removeId").value = "";
                loadCandidates();
            } else {
                showMsg("removeMsg", "⚠ " + data.message, true);
            }
        } catch (e) {
            showMsg("removeMsg", "⚠ Could not reach backend", true);
        }
    }

    // ── START VOTING ──
    async function startVoting() {
        try {
            const res = await fetch(`${BACKEND}/startVoting`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                showMsg("votingMsg", "✓ " + data.message, false);
                checkVotingStatus();
            } else {
                showMsg("votingMsg", "⚠ " + data.message, true);
            }
        } catch (e) {
            showMsg("votingMsg", "⚠ Could not reach backend", true);
        }
    }

    // ── END VOTING ──
    async function endVoting() {
        try {
            const res = await fetch(`${BACKEND}/endVoting`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                showMsg("votingMsg", "✓ " + data.message, false);
                checkVotingStatus();
            } else {
                showMsg("votingMsg", "⚠ " + data.message, true);
            }
        } catch (e) {
            showMsg("votingMsg", "⚠ Could not reach backend", true);
        }
    }

    // ── CHECK VOTING STATUS ──
    async function checkVotingStatus() {
        try {
            const res = await fetch(`${BACKEND}/votingStatus`);
            const data = await res.json();
            const badge = document.getElementById("headerBadge");
            const statusText = document.getElementById("statusText");

            if (data.active) {
                badge.className = "voting-badge badge-active";
                badge.textContent = "● VOTING ACTIVE";
                statusText.textContent = "Status: Voting is currently ACTIVE";
            } else {
                badge.className = "voting-badge badge-inactive";
                badge.textContent = "● VOTING INACTIVE";
                statusText.textContent = "Status: Voting is currently INACTIVE";
            }
        } catch (e) {
            document.getElementById("statusText").textContent = "Status: Could not reach backend";
        }
    }

    // ── LOAD CANDIDATES ──
    async function loadCandidates() {
        const tbody = document.getElementById("candidateTableBody");
        tbody.innerHTML = `<tr><td colspan="4" class="empty-table"><span class="spinner"></span>Loading...</td></tr>`;

        try {
            const countRes = await fetch(`${BACKEND}/getCandidateCount`);
            const { count } = await countRes.json();

            if (parseInt(count) === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="empty-table">No candidates added yet</td></tr>`;
                return;
            }

            let rows = "";
            for (let i = 1; i <= parseInt(count); i++) {
                const res = await fetch(`${BACKEND}/viewCandidate/${i}`);
                const c = await res.json();
                const dot = c.active ? "dot-active" : "dot-inactive";
                const statusLabel = c.active ? "Active" : "Inactive";
                rows += `
                    <tr>
                        <td style="font-family:'Share Tech Mono',monospace; color:var(--muted)">${i}</td>
                        <td style="color:#fff; font-weight:600">${c.name}</td>
                        <td style="font-family:'Share Tech Mono',monospace; color:var(--accent)">${c.votes}</td>
                        <td><span class="status-dot ${dot}"></span>${statusLabel}</td>
                    </tr>`;
            }
            tbody.innerHTML = rows;
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="4" class="empty-table" style="color:var(--accent2)">⚠ Could not reach backend</td></tr>`;
        }
    }