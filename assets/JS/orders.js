// Firebase Configuration
const firebaseConfig = {
    databaseURL: "https://e-commerce-iti-74-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Get user ID from cookies
function getUserId() {
    const cookies = document.cookie.split(";").map(cookie => cookie.trim());
    let userId = "";
    cookies.forEach(cookie => {
        if (cookie.startsWith("uid=")) {
            userId = cookie.split("=")[1];
        }
    });
    return userId;
}

function loadUserOrders() {
    const userId = getUserId();
    if (!userId) {
        document.getElementById("orders-list").innerHTML = "<p>Please log in to view your orders.</p>";
        return;
    }

    const ordersContainer = document.getElementById("orders-list");
    ordersContainer.innerHTML = "<p>Loading orders...</p>";

    firebase.database().ref("orders/" + userId).once("value")
        .then(snapshot => {
            if (!snapshot.exists()) {
                ordersContainer.innerHTML = "<p>You have no past orders.</p>";
                return;
            }

            let orders = snapshot.val();
            ordersContainer.innerHTML = "";

            Object.keys(orders).forEach(orderId => {
                let order = orders[orderId];

                let orderHTML = `
                            <div class="order-card">
                                <div class="order-header">
                                    <p><strong>Order ID:</strong> ${orderId}</p>
                                    <p><strong>Status:</strong> <span class="order-status">${order.status}</span></p>
                                    <p><strong>Total:</strong> EG ${order.total.toFixed(2)}</p>
                                    <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleDateString()}</p>
                                    <button class="view-details" data-id="${orderId}">View Details</button>
                                </div>
                                <div class="order-details" id="details-${orderId}" style="display: none;">
                                    ${Object.keys(order.items).map(productId => {
                    let item = order.items[productId];
                    return `
                                            <div class="order-item">
                                                <img src="${item.image}" alt="${item.name}" class="order-img">
                                                <p><strong>${item.name}</strong></p>
                                                <p>Quantity: ${item.quantity}</p>
                                                <p>Price: EG ${item.price}</p>
                                            </div>
                                        `;
                }).join('')}
                                </div>
                            </div>
                        `;
                ordersContainer.innerHTML += orderHTML;
            });

            // Attach event listeners to "View Details" buttons
            document.querySelectorAll(".view-details").forEach(button => {
                button.addEventListener("click", function () {
                    const orderId = this.getAttribute("data-id");
                    const detailsDiv = document.getElementById("details-" + orderId);
                    detailsDiv.style.display = detailsDiv.style.display === "none" ? "block" : "none";
                });
            });
        })
        .catch(error => {
            console.error("Error fetching orders:", error);
            ordersContainer.innerHTML = "<p>Error loading orders. Please try again.</p>";
        });
}

document.addEventListener("DOMContentLoaded", loadUserOrders);