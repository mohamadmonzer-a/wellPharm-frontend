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
