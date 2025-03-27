// Database
const firebaseConfig = {

    databaseURL: "https://e-commerce-iti-74-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
// Get User ID from Cookies
const cookies = document.cookie.split(";");
let userId = "";
cookies.forEach(cookie => {
    let [key, value] = cookie.trim().split("=");
    if (key === "uid") userId = value;
});


function loadWishlist(userId) {
    const wishlistContainer = document.querySelector(".wishlist-items");
    wishlistContainer.innerHTML = ""; // Clear previous content

    db.ref("wishlist/" + userId).once("value")
        .then(snapshot => {
            if (!snapshot.exists()) {
                wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
                return;
            }

            let wishlistItems = snapshot.val();
            Object.keys(wishlistItems).forEach(productId => {
                let item = wishlistItems[productId];

                let wishlistItemHTML = `
                    <div class="wishlist-item" data-id="${productId}">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="item-details">
                            <h3 class="item-title">${item.name}</h3>
                            <p class="item-price">$${item.price}</p>
                        </div>
                        <div class="item-actions">
                            <button class="remove-wishlist" data-id="${productId}" data-name="${item.name}" data-image="${item.image}">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                `;

                wishlistContainer.innerHTML += wishlistItemHTML;
            });
        })
        .catch(error => {
            console.error("Error fetching wishlist data:", error);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    if (userId) {
        loadWishlist(userId);
    }
});

// Remove from Wishlist Button Event
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-wishlist")) {
        const productId = event.target.getAttribute("data-id");
        const wishlistRef = db.ref("wishlist/" + userId + "/" + productId);

        wishlistRef.remove().then(() => {
            loadWishlist(userId);
        });
    }
});

function updateCartCount(userId) {
    const cartRef = firebase.database().ref("cart/" + userId);
    let totalItems = 0;
    cartRef.once("value").then(snapshot => {
        snapshot.forEach(item => {
            totalItems += item.val().quantity;
        });
        document.querySelector(".cart-count").textContent = totalItems;
    }).catch(error => {
        console.error("Error updating cart count:", error);
    });
}

if (userId) {
    updateCartCount(userId)
} else {
    document.getElementById("navbar-cart").removeChild(document.querySelector(".cart-count"))
}