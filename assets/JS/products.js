const filterButtons = document.querySelectorAll(".filter-button");
const productCards = document.querySelectorAll(".product-card");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const category = button.getAttribute("data-category");
        productCards.forEach((card) => {
            const cardCategory = card.getAttribute("data-category");
            if (category === "all" || cardCategory === category) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});
// Database
const firebaseConfig = {
    // apiKey: "YOUR_API_KEY",
    // authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://e-commerce-iti-74-default-rtdb.asia-southeast1.firebasedatabase.app/",
    // projectId: "YOUR_PROJECT_ID",
    // storageBucket: "YOUR_PROJECT_ID.appspot.com",
    // messagingSenderId: "YOUR_SENDER_ID",
    // appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// console.log(db)
const  addCartBtn = document.querySelectorAll(".add-to-cart")

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
addCartBtn.forEach(button => {
    button.addEventListener("click", function() {
        const user_id = userId
        const productId = this.dataset.id;
        const productName = this.dataset.name;
        const productPrice = this.dataset.price;
        const productImage = this.dataset.image;

        addToCart(user_id, productId, 1, productPrice, productName, productImage);
    });
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
        showCartAlert(name, image);
    }).catch(error => {
        console.error("Error adding item to cart:", error);
    });
}

function showCartAlert(productName, productImage) {
    Swal.fire({
        title: "Added to Cart!",
        text: `${productName} has been added to your cart.`,
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

function updateCartCount(userId) {
    const cartRef = firebase.database().ref("cart/" + userId);

    cartRef.once("value").then(snapshot => {
        let totalItems = 0;
        snapshot.forEach(item => {
            totalItems += item.val().quantity;
        });

        document.querySelector(".cart-count").textContent = totalItems;
    }).catch(error => {
        console.error("Error updating cart count:", error);
    });
}
document.addEventListener("DOMContentLoaded", function() {
    const user_Id = userId
    updateCartCount(userId);
});


function getAllCarts() {
    firebase.database().ref("cart").once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                const allCartItems = snapshot.val();
                window.allCarts = allCartItems;
            } else {
                window.allCarts = {};
            }
        })
        .catch(error => {
            console.error("Error fetching cart data:", error);
        });
}

getAllCarts()

