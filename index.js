document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("product-list");
  const logoutBtn = document.getElementById("logout-btn");
  const loginError = document.getElementById("login-error");

  // Load products
  async function loadProducts() {
    try {
      const res = await fetch("https://wellpharm-backend.onrender.com/api/products");
      const products = await res.json();

      container.innerHTML = "";
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
    } catch (err) {
      container.innerHTML = "<p>⚠️ Could not load products.</p>";
    }
  }

  loadProducts();

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

  function setLoggedIn(token, profilePictureUrl = null) {
    const userData = decodeJwt(token);
    if (!userData) return;

    document.getElementById("auth-buttons").style.display = "none";
    const dropdownToggle = document.getElementById("user-dropdown-toggle");
    const userPic = document.getElementById("user-pic");
    const userEmail = document.getElementById("user-email");

    userEmail.textContent = userData.email || userData.sub;
    dropdownToggle.style.display = "block";
    userPic.src = profilePictureUrl || "assets/default-user.png";

    localStorage.setItem("token", token);
    localStorage.setItem("userPic", userPic.src);
  }

  function setLoggedOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("userPic");
    document.getElementById("auth-buttons").style.display = "block";
    document.getElementById("user-dropdown-toggle").style.display = "none";
    document.getElementById("user-dropdown").style.display = "none";
  }

  const savedToken = localStorage.getItem("token");
  const savedUserPic = localStorage.getItem("userPic");
  savedToken ? setLoggedIn(savedToken, savedUserPic) : setLoggedOut();

  logoutBtn.addEventListener("click", () => {
    setLoggedOut();
  });

  document.getElementById("user-dropdown-toggle").addEventListener("click", () => {
    const dropdown = document.getElementById("user-dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  });
});

async function handleGoogleCredentialResponse(response) {
  const loginError = document.getElementById("login-error");
  loginError.textContent = "";

  try {
    const res = await fetch("https://wellpharm-backend.onrender.com/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: response.credential }),
    });
    const data = await res.json();

    if (res.ok) {
      const googlePayload = JSON.parse(atob(response.credential.split('.')[1]));
      const pictureUrl = googlePayload.picture || "assets/default-user.png";
      setLoggedIn(data.access_token, pictureUrl);
    } else {
      loginError.textContent = data.detail || "Google login failed";
    }
  } catch (err) {
    loginError.textContent = "Network error during Google login";
  }
}