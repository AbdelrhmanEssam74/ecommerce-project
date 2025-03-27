// Firebase Configuration
const firebaseConfig = {
    databaseURL: "https://e-commerce-iti-74-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Function to Load All Products
function loadProducts() {
    const productsGrid = document.getElementById("products-grid");

    db.ref("products").once("value")
        .then((snapshot) => {
            if (snapshot.exists()) {
                productsGrid.innerHTML = ""; // Clear existing content
                snapshot.forEach((childSnapshot) => {
                    const product = childSnapshot.val();
                    const productId = childSnapshot.key;

                    // Create product card
                    const productCard = document.createElement("div");
                    productCard.classList.add("product-card");
                    productCard.setAttribute("data-category", product.category || "uncategorized");

                    productCard.innerHTML = `
                                <div class="product-image">
                                    <a href="product_details.html?id=${productId}">
                                        <img src="${product.image || 'assets/images/default-product.jpg'}" alt="${product.name}">
                                    </a>
                                    <div class="product-actions">
                                        <button class="add-to-cart" 
                                                data-id="${productId}" 
                                                data-name="${product.name}" 
                                                data-price="${product.price}" 
                                                data-image="${product.image}">
                                            <i class="fas fa-shopping-cart"></i> Add to Cart
                                        </button>
                                        <button class="wishlist" 
                                                data-id="${productId}" 
                                                data-name="${product.name}" 
                                                data-price="${product.price}" 
                                                data-image="${product.image}">
                                            <i class="fas fa-heart"></i> Wishlist
                                        </button>
                                    </div>
                                </div>
                                <div class="product-details">
                                    <h3 class="product-title">${product.name || "Unknown Product"}</h3>
                                    <p class="product-price">EG ${product.price || "N/A"}</p>
                                </div>
                            `;

                    // Append product card to grid
                    productsGrid.appendChild(productCard);
                });
            } else {
                productsGrid.innerHTML = "<p>No products found.</p>";
            }
        })
        .catch((error) => {
            console.error("Error loading products:", error);
            Swal.fire("Error!", "Failed to load products.", "error");
        });
}

// Load products when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

// get userid from cookies
const cookies = document.cookie;
const cookiesArr = cookies.split(";");
let userId = "";
cookiesArr.forEach((cookie) => {
    const cookieArr = cookie.split("=");
    if (cookieArr[0].trim() === "uid") {
        userId = cookieArr[1];
    }
});
// Event Delegation for Add to Cart Button
document.querySelector("#products-grid").addEventListener("click", function (event) {
    if (event.target.classList.contains("add-to-cart")) {
        const button = event.target;
        const productId = button.dataset.id;
        const productName = button.dataset.name;
        const productPrice = button.dataset.price;
        const productImage = button.dataset.image;

        addToCart(userId, productId, 1, productPrice, productName, productImage);
    }
});

function addToCart(userId, productId, quantity, price, name, image) {
    const cartRef = firebase.database().ref("cart/" + userId + "/" + productId);

    cartRef.once("value").then(snapshot => {
        let currentQuantity = snapshot.exists() ? snapshot.val().quantity : 0;
        let newQuantity = currentQuantity + quantity;

        return cartRef.set({
            quantity: newQuantity,
            price: price,
            name: name,
            image: image
        });
    }).then(() => {
        updateCartCount(userId);
        showCartAlert(name, image, "Added to Cart!", "has been added to your cart.");
    }).catch(error => {
        console.error("Error adding item to cart:", error);
    });
}

function updateCartCount(userId) {
    const cartRef = firebase.database().ref("cart/" + userId);
    cartRef.once("value", snapshot => {
        let count = 0;
        snapshot.forEach(childSnapshot => {
            count += childSnapshot.val().quantity;
        });

        document.getElementById("cart-count").innerText = count;
    });
}

function showCartAlert(productName, productImage, title, message) {
    Swal.fire({
        title: title,
        text: `${productName} ${message}`,
        imageUrl: productImage || "assets/images/default-product.jpg",
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: "Product Image",
        confirmButtonText: "OK"
    });
}

// Filter Products by Category
const filterButtons = document.querySelectorAll(".filter-button");
document.querySelector(".filter-buttons").addEventListener("click", function (event) {
    if (event.target.classList.contains("filter-button")) {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        event.target.classList.add("active");

        const category = event.target.getAttribute("data-category");
        document.querySelectorAll(".product-card").forEach((card) => {
            const cardCategory = card.getAttribute("data-category");
            if (category === "all" || cardCategory === category) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    }
});