document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-list");
  const loginForm = document.getElementById("login-form");
  const authSection = document.getElementById("auth-section");
  const logoutBtn = document.getElementById("logout-btn");
  const welcomeMsg = document.getElementById("welcome-msg");
  const loginError = document.getElementById("login-error");
  const googleSigninBtn = document.querySelector(".g_id_signin");
  const userInfo = document.getElementById("user-info");
  const userPic = document.getElementById("user-pic");

  // Load products from backend
  async function loadProducts() {
    try {
      const res = await fetch("https://wellpharm-backend.onrender.com/api/products");
      const products = await res.json();

      container.innerHTML = ""; // Clear container
      products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>${product.description || ""}</p>
          <p><strong>$${product.price.toFixed(2)}</strong></p>
          <button>Add to Cart</button>
        `;

        container.appendChild(card);
      });
    } catch (error) {
      console.error("❌ Error loading products:", error);
      container.innerHTML = "<p>⚠️ Could not load products.</p>";
    }
  }

  loadProducts();

  // Decode JWT helper
  function decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  // Show logged in UI
  function setLoggedIn(token, profilePictureUrl = null) {
    const userData = decodeJwt(token);
    if (!userData) return;

    welcomeMsg.textContent = `Welcome, ${userData.sub}`;
    loginError.textContent = "";

    authSection.style.display = "none";
    googleSigninBtn.style.display = "none";

    userInfo.style.display = "flex";
    logoutBtn.style.display = "inline-block";

    // Show user picture or fallback
    if (profilePictureUrl) {
      userPic.src = profilePictureUrl;
    } else {
      // Use a placeholder image or gravatar if you want
      userPic.src = "assets/default-user.png"; 
    }
  }

  // Show logged out UI
  function setLoggedOut() {
    welcomeMsg.textContent = "";
    loginError.textContent = "";

    authSection.style.display = "block";
    googleSigninBtn.style.display = "block";

    userInfo.style.display = "none";
    logoutBtn.style.display = "none";

    userPic.src = "";
  }

  // On page load, check token and user info in localStorage
  const savedToken = localStorage.getItem("token");
  const savedUserPic = localStorage.getItem("userPic"); // we'll save pic on login
  if (savedToken) {
    setLoggedIn(savedToken, savedUserPic);
  } else {
    setLoggedOut();
  }

  // Logout button click
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userPic");
    setLoggedOut();
  });

  // Handle login form submit
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    loginError.textContent = "";

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch("https://wellpharm-backend.onrender.com/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.removeItem("userPic"); // no pic for password login
        setLoggedIn(data.access_token);
      } else {
        loginError.textContent = data.detail || "Login failed";
      }
    } catch (err) {
      loginError.textContent = "Network error during login";
    }
  });
});

// Google Sign-In callback (global)
async function handleGoogleCredentialResponse(response) {
  const loginError = document.getElementById("login-error");
  const welcomeMsg = document.getElementById("welcome-msg");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const googleSigninBtn = document.querySelector(".g_id_signin");
  const userInfo = document.getElementById("user-info");
  const userPic = document.getElementById("user-pic");

  loginError.textContent = "";

  try {
    const res = await fetch("https://wellpharm-backend.onrender.com/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential }),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.access_token);

      // Decode token for user email and picture (if your backend adds picture URL in token)
      const base64Url = data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userData = JSON.parse(jsonPayload);

      // If your backend does NOT include picture URL, 
      // you can get picture from the Google ID token's payload:
      // (response contains raw JWT id token in response.credential)
      // Let's decode the raw Google id token for picture:
      const googlePayload = JSON.parse(atob(response.credential.split('.')[1]));
      const pictureUrl = googlePayload.picture || "assets/default-user.png";

      localStorage.setItem("userPic", pictureUrl);

      welcomeMsg.textContent = `Welcome, ${userData.sub}`;

      loginForm.style.display = "none";
      googleSigninBtn.style.display = "none";

      userInfo.style.display = "flex";
      logoutBtn.style.display = "inline-block";
      userPic.src = pictureUrl;

    } else {
      loginError.textContent = data.detail || "Google login failed";
    }
  } catch (err) {
    loginError.textContent = "Network error during Google login";
  }
}
