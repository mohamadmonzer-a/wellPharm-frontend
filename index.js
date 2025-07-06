document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("product-list");

  try {
    const res = await fetch("https://wellpharm-backend.onrender.com/api/products");
    const products = await res.json();

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p><strong>$${product.price}</strong></p>
        <button>Add to Cart</button>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("❌ Error loading products:", error);
    container.innerHTML = "<p>⚠️ Could not load products.</p>";
  }
});














// Existing DOMContentLoaded code remains the same...

// Google Sign-In callback function
async function handleGoogleCredentialResponse(response) {
  try {
    const res = await fetch("https://wellpharm-backend.onrender.com/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_token: response.credential }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.access_token);
      alert("Google login successful!");
    } else {
      alert("Google login error: " + data.detail);
    }
  } catch (err) {
    alert("Network error during Google login");
  }
}

// Your existing login form handler remains
document.getElementById("login-form").addEventListener("submit", async e => {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;
  
  const res = await fetch("https://wellpharm-backend.onrender.com/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.access_token);
    alert("Login successful!");
  } else {
    alert("Error: " + data.detail);
  }
});
