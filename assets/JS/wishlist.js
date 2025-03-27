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

// Wishlist Button Click Event
let wishlist = document.querySelectorAll(".wishlist");
wishlist.forEach(button => {
    button.addEventListener("click", function () {
        const user_id = userId
        const productId = this.dataset.id;
        const productName = this.dataset.name;
        const productPrice = this.dataset.price;
        const productImage = this.dataset.image;
        toggleWishlist(user_id, productId, productName, productPrice, productImage);
        button.textContent="Remove from Wishlist";
    });
});

// Function to Add/Remove Wishlist Items
function toggleWishlist(userId, productId, name, price, image) {
    const wishlistRef = db.ref("wishlist/" + userId + "/" + productId);

    wishlistRef.once("value").then(snapshot => {
        if (snapshot.exists()) {
            wishlistRef.remove().then(() => {
                showWishlistAlert(name, image, "Removed from Wishlist!", "has been removed.");
            });
        } else {
            wishlistRef.set({
                name: name,
                price: parseFloat(price),
                image: image
            }).then(() => {
                showWishlistAlert(name, image, "Added to Wishlist!", "has been saved.");
            });
        }
    }).catch(error => {
        console.error("Error updating wishlist:", error);
    });
}

// Show Alert for Wishlist Actions
function showWishlistAlert(productName, productImage, title, text) {
    Swal.fire({
        title: title,
        text: `${productName} ${text}`,
        imageUrl: productImage,
        imageWidth: 100,
        imageHeight: 100,
        imageAlt: productName,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        position: "top-end",
        toast: true,
        icon: "success"
    });
}
//
// function loadWishlist(userId) {
//     const wishlistContainer = document.querySelector(".wishlist-items");
//     wishlistContainer.innerHTML = ""; // Clear previous content
//
//     db.ref("wishlist/" + userId).once("value")
//         .then(snapshot => {
//             if (!snapshot.exists()) {
//                 wishlistContainer.innerHTML = "<p>Your wishlist is empty.</p>";
//                 return;
//             }
//
//             let wishlistItems = snapshot.val();
//             Object.keys(wishlistItems).forEach(productId => {
//                 let item = wishlistItems[productId];
//
//                 let wishlistItemHTML = `
//                     <div class="wishlist-item" data-id="${productId}">
//                         <div class="item-image">
//                             <img src="${item.image}" alt="${item.name}">
//                         </div>
//                         <div class="item-details">
//                             <h3 class="item-title">${item.name}</h3>
//                             <p class="item-price">$${item.price}</p>
//                         </div>
//                         <div class="item-actions">
//                             <button class="remove-wishlist" data-id="${productId}" data-name="${item.name}" data-image="${item.image}">
//                                 <i class="fas fa-trash"></i> Remove
//                             </button>
//                         </div>
//                     </div>
//                 `;
//
//                 wishlistContainer.innerHTML += wishlistItemHTML;
//             });
//         })
//         .catch(error => {
//             console.error("Error fetching wishlist data:", error);
//         });
// }
//
// document.addEventListener("DOMContentLoaded", function () {
//     if (userId) {
//         loadWishlist(userId);
//     }
// });
//
// // Remove from Wishlist Button Event
// document.addEventListener("click", function (event) {
//     if (event.target.classList.contains("remove-wishlist")) {
//         const productId = event.target.getAttribute("data-id");
//         const wishlistRef = db.ref("wishlist/" + userId + "/" + productId);
//
//         wishlistRef.remove().then(() => {
//             loadWishlist(userId);
//         });
//     }
// });
