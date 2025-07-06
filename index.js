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
