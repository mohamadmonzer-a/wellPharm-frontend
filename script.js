fetch('https://wellpharm-backend.onrender.com/api/products')
  .then(response => response.json())
  .then(data => {
    console.log('Products from backend:', data);
    // Use data to update your HTML page dynamically
  })
  .catch(error => console.error('Error fetching products:', error));



function addToCart(productName) {
  alert(`🛒 Added "${productName}" to cart!`);
}


async function loadMedicines() {
  try {
    const response = await fetch('http://localhost:3000/api/medicines');
    if (!response.ok) throw new Error('Failed to fetch');

    const medicines = await response.json();

    const container = document.getElementById('products-container');
    container.innerHTML = '';

    medicines.forEach(med => {
      const card = document.createElement('div');
      card.className = 'product-card';

      card.innerHTML = `
        <img src="${med.image || 'placeholder.jpg'}" alt="${med.name}" />
        <h3>${med.name}</h3>
        <p>${med.description}</p>
        <p class="price">$${med.price.toFixed(2)}</p>
        <button>Add to Cart</button>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    document.getElementById('products-container').textContent = 'Error loading products.';
    console.error(error);
  }
}

window.onload = loadMedicines;
