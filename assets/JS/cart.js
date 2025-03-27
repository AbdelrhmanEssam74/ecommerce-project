// Database
const firebaseConfig = {

    databaseURL: "https://e-commerce-iti-74-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// console.log(db)
const addCartBtn = document.querySelectorAll(".add-to-cart")

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
    button.addEventListener("click", function () {
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
        showCartAlert(name, image, "Added to Cart!", "has been added to your cart.");
    }).catch(error => {
        console.error("Error adding item to cart:", error);
    });
}

document.addEventListener("click", function (event) {
    if (event.target.classList.contains("remove-item")) {
        const button = event.target;
        const productName = button.getAttribute("data-name");
        const productImage = button.getAttribute("data-image");
        showCartAlert(productName, productImage, "Removed from Cart!", "has been removed from your cart.");
    }
});

function showCartAlert(productName, productImage, title, text) {
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

function getUserCart(userId) {
    firebase.database().ref("cart/" + userId).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                // console.log("User Cart Data:", snapshot.val());
            } else {
                console.log("Cart is empty for this user.");
            }
        })
        .catch(error => {
            console.error("Error fetching cart data:", error);
        });
}

getUserCart(userId);


function loadCartItems(userId) {
    const cartContainer = document.querySelector(".cart-items");
    cartContainer.innerHTML = ""; // Clear previous data

    firebase.database().ref("cart/" + userId).once("value")
        .then(snapshot => {
            if (!snapshot.exists()) {
                cartContainer.innerHTML = "<p>Your cart is empty.</p>";
                return;
            }

            let cartItems = snapshot.val();
            let subtotal = 0;

            Object.keys(cartItems).forEach(productId => {
                let item = cartItems[productId];
                subtotal += item.price * item.quantity;

                let cartItemHTML = `
                    <div class="cart-item" data-id="${productId}">
                        <div class="item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="item-details">
                            <h3 class="item-title">${item.name}</h3>
                            <p class="item-price">$${item.price}</p>
                            <div class="item-quantity">
                                <button class="quantity-btn" data-action="decrease">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1">
                                <button class="quantity-btn" data-action="increase">+</button>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="remove-item" data-id="${productId}" data-name="${item.name}" data-image="${item.image}"><i class="fas fa-trash"></i> Remove</button>
                        </div>
                    </div>
                `;

                cartContainer.innerHTML += cartItemHTML;
            });

            updateCartSummary(subtotal);
        })
        .catch(error => {
            console.error("Error fetching cart data:", error);
        });
}

function updateCartSummary(subtotal) {
    const shipping = 10.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.querySelector(".subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector(".shipping").textContent = `$${shipping.toFixed(2)}`;
    document.querySelector(".tax").textContent = `$${tax.toFixed(2)}`;
    document.querySelector(".total-amount").textContent = `$${total.toFixed(2)}`;
}

document.addEventListener("click", function (event) {
    const target = event.target;
    const cartItem = target.closest(".cart-item");

    if (!cartItem) return;

    const productId = cartItem.getAttribute("data-id");
    const cartRef = firebase.database().ref("cart/" + userId + "/" + productId);

    if (target.classList.contains("quantity-btn")) {
        let quantityInput = cartItem.querySelector(".quantity-input");
        let newQuantity = parseInt(quantityInput.value);

        if (target.getAttribute("data-action") === "increase") {
            newQuantity++;
        } else if (target.getAttribute("data-action") === "decrease" && newQuantity > 1) {
            newQuantity--;
        }

        quantityInput.value = newQuantity;
        cartRef.update({quantity: newQuantity});
        loadCartItems(userId); // Refresh cart
    }

    if (target.classList.contains("remove-item")) {
        cartRef.remove().then(() => {
            cartItem.remove();
            loadCartItems(userId); // Refresh cart
        });
    }
});
document.addEventListener("DOMContentLoaded", function () {
    loadCartItems(userId);
});

document.querySelector(".checkout-btn").addEventListener("click", function () {
    checkoutOrder(userId);
});

function checkoutOrder(userId) {
    const cartRef = firebase.database().ref("cart/" + userId);
    const ordersRef = firebase.database().ref("orders/" + userId);

    cartRef.once("value")
        .then(snapshot => {
            if (!snapshot.exists()) {
                Swal.fire("Cart is empty", "Please add items to your cart before checkout.", "warning");
                return;
            }

            let cartItems = snapshot.val();
            let subtotal = 0;

            Object.keys(cartItems).forEach(productId => {
                subtotal += cartItems[productId].price * cartItems[productId].quantity;
            });

            const shipping = 10.00;
            const tax = subtotal * 0.08;
            const totalAmount = subtotal + shipping + tax;

            const orderData = {
                items: cartItems,
                subtotal: subtotal,
                shipping: shipping,
                tax: tax,
                total: totalAmount,
                status: "pending",
                timestamp: new Date().toISOString()
            };

            return ordersRef.push(orderData);
        })
        .then(() => {
            return cartRef.remove();
        })
        .then(() => {
            updateCartCount(userId);
            Swal.fire("Order Placed!", "Your order has been successfully placed.", "success");
        })
        .catch(error => {
            console.error("Error processing order:", error);
            Swal.fire("Error", "Something went wrong. Please try again.", "error");
        });
}


function initPayPalButton() {
    paypal.Buttons({
        style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'paypal',

        },
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{"amount":{"currency_code":"USD","value":1}}]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(orderData) {
                console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
                const element = document.getElementById('paypal-button-container');
                element.innerHTML = '';
                element.innerHTML = '<h3>Thank you for your payment!</h3>';


            });
        },

        onError: function(err) {
            console.log(err);
        }
    }).render('#paypal-button-container');
}
initPayPalButton();