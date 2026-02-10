/* =====================================================
   CONFIGURATION
   ===================================================== */

const ALLOWED_DOMAIN = "@mgits.ac.in";


/* =====================================================
   REGISTRATION
   Email + Password → OTP → Authenticator → Success popup
   ===================================================== */

/* Step 1: Register (Email + Password) */
document.getElementById("registerForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const error = document.getElementById("errorMessage");

    error.innerText = "";

    // Email validation
    if (email === "") {
        error.innerText = "Email field cannot be empty.";
        return;
    }

    if (!email.endsWith(ALLOWED_DOMAIN)) {
        error.innerText = "Please use your official MGITS email address.";
        return;
    }

    // Password validation
    if (password === "" || confirmPassword === "") {
        error.innerText = "Password fields cannot be empty.";
        return;
    }

    if (password.length < 8) {
        error.innerText = "Password must be at least 8 characters long.";
        return;
    }

    if (password !== confirmPassword) {
        error.innerText = "Passwords do not match.";
        return;
    }

    // Temporarily store registration data
    sessionStorage.setItem("registerEmail", email);
    sessionStorage.setItem("registerPassword", password);

    /*
      Backend responsibility:
      - Check email exists in voter list
      - Send OTP to email
      - Hash & store password securely
    */

    window.location.href = "verify-email.html";
});


/* Step 2: Email OTP Verification */
document.getElementById("otpForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const otp = document.getElementById("otp").value.trim();
    const error = document.getElementById("otpError");

    error.innerText = "";

    if (!/^\d{6}$/.test(otp)) {
        error.innerText = "OTP must be a 6-digit number.";
        return;
    }

    /*
      Backend responsibility:
      - Verify OTP
    */

    window.location.href = "authenticator.html";
});


/* Step 3: Authenticator Setup */
document.getElementById("authForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const code = document.getElementById("authCode").value.trim();
    const error = document.getElementById("authError");

    error.innerText = "";

    if (!/^\d{6}$/.test(code)) {
        error.innerText = "Authenticator code must be a 6-digit number.";
        return;
    }

    /*
      Backend responsibility:
      - Verify TOTP
      - Complete registration
    */

    // Show success popup
    document.getElementById("authSuccessModal").style.display = "block";

});


/* Success popup OK button */
function goToHome() {
    sessionStorage.clear();
    window.location.href = "index.html";
}


/* =====================================================
   FORGOT PASSWORD FLOW
   ===================================================== */

/* Step 1: Enter registered email */
document.getElementById("forgotPasswordForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("fpEmail").value.trim();
    const error = document.getElementById("fpError");

    error.innerText = "";

    if (email === "") {
        error.innerText = "Email field cannot be empty.";
        return;
    }

    if (!email.endsWith(ALLOWED_DOMAIN)) {
        error.innerText = "Please use your registered MGITS email address.";
        return;
    }

    /*
      Backend responsibility:
      - Check if email exists in database
      - If not exists → return error
    */

    // Temporary frontend simulation
    const emailExistsInDB = true;

    if (!emailExistsInDB) {
        error.innerText = "Enter registered email";
        return;
    }

    sessionStorage.setItem("fpEmail", email);
    window.location.href = "forgot-password-otp.html";
});


/* Step 2: OTP verification for password reset */
document.getElementById("fpOtpForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const otp = document.getElementById("fpOtp").value.trim();
    const error = document.getElementById("fpOtpError");

    error.innerText = "";

    if (!/^\d{6}$/.test(otp)) {
        error.innerText = "OTP must be a 6-digit number.";
        return;
    }

    /*
      Backend responsibility:
      - Verify OTP
    */

    window.location.href = "reset-password.html";
});


/* Step 3: Set new password */
document.getElementById("resetPasswordForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmNewPassword").value;
    const error = document.getElementById("resetError");

    error.innerText = "";

    if (password === "" || confirmPassword === "") {
        error.innerText = "All fields are required.";
        return;
    }

    if (password.length < 8) {
        error.innerText = "Password must be at least 8 characters long.";
        return;
    }

    if (password !== confirmPassword) {
        error.innerText = "Passwords do not match.";
        return;
    }

    /*
      Backend responsibility:
      - Hash new password
      - Update password in database
    */

    // Show password updated popup
document.getElementById("passwordSuccessModal").style.display = "block";

});


/* =====================================================
   COMMON
   Display stored email where required
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const emailDisplay = document.getElementById("emailDisplay");
    const storedEmail =
        sessionStorage.getItem("registerEmail") ||
        sessionStorage.getItem("fpEmail");

    if (emailDisplay && storedEmail) {
        emailDisplay.innerText = "Email: " + storedEmail;
    }
});

/* =====================================================
   LOST AUTHENTICATOR FLOW
   ===================================================== */

/* Step 2 & 3: Email + Password */
document.getElementById("lostAuthForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("laEmail").value.trim();
    const password = document.getElementById("laPassword").value;
    const error = document.getElementById("laError");

    error.innerText = "";

    if (email === "" || password === "") {
        error.innerText = "All fields are required.";
        return;
    }

    if (!email.endsWith("@mgits.ac.in")) {
        error.innerText = "Please use your registered MGITS email address.";
        return;
    }

    /*
      Backend responsibility:
      - Verify email + password
      - Send OTP
    */

    sessionStorage.setItem("laEmail", email);
    window.location.href = "lost-authenticator-otp.html";
});


/* Step 4 & 5: OTP Verification */
document.getElementById("laOtpForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const otp = document.getElementById("laOtp").value.trim();
    const error = document.getElementById("laOtpError");

    error.innerText = "";

    if (!/^\d{6}$/.test(otp)) {
        error.innerText = "OTP must be a 6-digit number.";
        return;
    }

    /*
      Backend responsibility:
      - Verify OTP
    */

    window.location.href = "lost-authenticator-setup.html";
});


/* Step 6 & 7: New Authenticator Setup */
document.getElementById("laAuthForm")?.addEventListener("submit", function (e) {
    e.preventDefault();

    const code = document.getElementById("laAuthCode").value.trim();
    const error = document.getElementById("laAuthError");

    error.innerText = "";

    if (!/^\d{6}$/.test(code)) {
        error.innerText = "Authenticator code must be a 6-digit number.";
        return;
    }

    /*
      Backend responsibility:
      - Verify TOTP
      - Replace old authenticator secret
    */

    sessionStorage.removeItem("laEmail");

    // Reuse existing success popup
    document.getElementById("authSuccessModal").style.display = "block";
});
