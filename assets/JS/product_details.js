// Firebase Configuration
const firebaseConfig = {
    databaseURL: "https://e-commerce-iti-74-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Function to get product ID from URL
function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
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

                // Select elements safely
                const productImage = document.querySelector(".product-image img");
                const productTitle = document.querySelector(".product-title");
                const productPrice = document.querySelector(".product-price");
                const productDescription = document.querySelector(".product-description");
                const productSpecs = document.querySelector(".product-specs");

                if (productImage) productImage.src = product.image || "assets/images/default-product.jpg";
                if (productTitle) productTitle.textContent = product.name || "Unknown Product";
                if (productPrice) productPrice.textContent = product.price ? `EG ${product.price}` : "Price Not Available";
                if (productDescription) productDescription.textContent = product.description || "No description available.";

                // Update Specifications
                if (productSpecs) {
                    productSpecs.innerHTML = `
                        <h3>Specifications</h3>
                        <ul>
                            <li><strong>Category:</strong> ${product.category || "N/A"}</li>
                            <li><strong>Stock:</strong> ${product.quantity ? product.quantity + " available" : "Out of stock"}</li>
                        </ul>
                    `;
                }
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
