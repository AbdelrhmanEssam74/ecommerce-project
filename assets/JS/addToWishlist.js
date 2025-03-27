
firebase.initializeApp(firebaseConfig);

// Get User ID from Cookies
setInterval(() => {
    document.querySelectorAll(".wishlist").forEach(button => {
        button.addEventListener("click", function () {
            if (!userId) {
                alert("Please log in to use the wishlist.");
                return;
            }
            const productId = this.dataset.id;
            const productName = this.dataset.name;
            const productPrice = this.dataset.price;
            const productImage = this.dataset.image;

            toggleWishlist(userId, productId, productName, productPrice, productImage, this);
        });
    });
}, 3000);


// Function to Add/Remove Wishlist Items
function toggleWishlist(userId, productId, name, price, image, button) {
    const wishlistRef = db.ref(`wishlist/${userId}/${productId}`);

    wishlistRef.once("value").then(snapshot => {
        if (snapshot.exists()) {
            wishlistRef.remove().then(() => {
                showCartAlert(name, image, "Removed from Wishlist!", "has been removed.");
                button.textContent = "Add to Wishlist";
            });
        } else {
            wishlistRef.set({
                name: name,
                price: parseFloat(price),
                image: image
            }).then(() => {
                showCartAlert(name, image, "Added to Wishlist!", "has been saved.");
                button.textContent = "Remove from Wishlist";
            });
        }
    }).catch(error => {
        console.error("Error updating wishlist:", error);
    });
}
