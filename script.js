function addToCart(productName) {
  alert(`🛒 Added "${productName}" to cart!`);
}

async function loadMedicines() {
  try {
    const response = await fetch('https://wellpharm-backend.onrender.com/api/products'); // your real backend
    if (!response.ok) throw new Error('Failed to fetch products');

    const medicines = await response.json();

    const container = document.getElementById('products-container');
    container.innerHTML = ''; // clear before adding

    medicines.forEach(med => {
      const card = document.createElement('div');
      card.className = 'product-card';

      card.innerHTML = `
        <img src="${med.image || 'assets/sample-product.jpg'}" alt="${med.name}" />
        <h3>${med.name}</h3>
        <p>${med.description || ''}</p>
        <p class="price">$${med.price.toFixed(2)}</p>
        <button onclick="addToCart('${med.name}')">Add to Cart</button>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    const container = document.getElementById('products-container');
    container.textContent = 'Error loading products.';
    console.error(error);
  }
}

window.onload = loadMedicines;
