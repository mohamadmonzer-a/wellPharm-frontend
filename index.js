document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-list");
  const loginForm = document.getElementById("login-form");
  const logoutBtn = document.getElementById("logout-btn");
  const welcomeMsg = document.getElementById("welcome-msg");
  const loginError = document.getElementById("login-error");
  const googleSigninBtn = document.querySelector(".g_id_signin");
  const authSection = document.getElementById("auth-section");

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
  function setLoggedIn(token) {
    const userData = decodeJwt(token);
    if (!userData) return;

    welcomeMsg.textContent = `Welcome, ${userData.sub}`;
    loginError.textContent = "";
    loginForm.style.display = "none";
    googleSigninBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  }

  // Show logged out UI
  function setLoggedOut() {
    welcomeMsg.textContent = "";
    loginError.textContent = "";
    loginForm.style.display = "block";
    googleSigninBtn.style.display = "block";
    logoutBtn.style.display = "none";
  }

  // On page load, check token
  const savedToken = localStorage.getItem("token");
  if (savedToken) {
    setLoggedIn(savedToken);
  } else {
    setLoggedOut();
  }

  // Logout button click
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
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

      // Decode token for user email
      const base64Url = data.access_token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const userData = JSON.parse(jsonPayload);

      welcomeMsg.textContent = `Welcome, ${userData.sub}`;
      loginForm.style.display = "none";
      googleSigninBtn.style.display = "none";
      logoutBtn.style.display = "inline-block";
    } else {
      loginError.textContent = data.detail || "Google login failed";
    }
  } catch (err) {
    loginError.textContent = "Network error during Google login";
  }
}
