// Firebase Configuration
const firebaseConfig = {
    databaseURL: "https://e-commerce-iti-74-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Function to get URL parameters
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); // Get 'id' from URL
}

// Function to create product details dynamically
function createProductHTML(product) {
    // Select container
    const container = document.querySelector(".product-details-page .container");
    if (!container) {
        console.error("Product container not found!");
        return;
    }

    // Clear existing content
    container.innerHTML = "";

    // Create product details dynamically
    container.innerHTML = `
        <div class="product-image">
            <img src="${product.image || 'assets/images/default-product.jpg'}" alt="${product.name || 'Product Image'}">
        </div>
        <div class="product-info">
            <h1 class="product-title">${product.name || "Unknown Product"}</h1>
            <p class="product-price">${product.price ? `$${product.price}` : "Price Not Available"}</p>
            <p class="product-description">${product.description || "No description available."}</p>

            <div class="product-actions">
                <button class="add-to-cart"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
                <button class="wishlist"><i class="fas fa-heart"></i> Add to Wishlist</button>
            </div>

            <div class="product-specs">
                <h3>Specifications</h3>
                <ul>
                    <li><strong>Category:</strong> ${product.category || "N/A"}</li>
                    <li><strong>Brand:</strong> ${product.brand || "N/A"}</li>
                    <li><strong>Stock:</strong> ${product.stock ? product.stock + " available" : "Out of stock"}</li>
                </ul>
            </div>
        </div>
    `;
}

// Fetch product details from Firebase
function loadProductDetails() {
    const productId = getProductIdFromURL();

    if (!productId) {
        Swal.fire("Error!", "Product ID not found in the URL!", "error");
        return;
    }

    db.ref("products/" + productId).once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                const product = snapshot.val();
                console.log("Fetched product:", product);
                createProductHTML(product);
            } else {
                Swal.fire("Error!", "Product details not found!", "error");
            }
        })
        .catch((error) => {
            Swal.fire("Error!", "Failed to fetch product details.", "error");
            console.error("Firebase Error:", error);
        });
}

// Load product details when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", loadProductDetails);
