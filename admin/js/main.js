document.addEventListener("DOMContentLoaded", function () {
    // Firebase Configuration
    const firebaseConfig = {
        databaseURL: "https://e-commerce-iti-74-default-rtdb.asia-southeast1.firebasedatabase.app/"
    };

    // Initialize Firebase
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();

    // DOM Elements
    const productCode = document.getElementById('ProductCode');
    const productNameInput = document.getElementById('ProductName');
    const productCategoryInput = document.getElementById('ProductCategory');
    const productPriceInput = document.getElementById('Price');
    const productQuantityInput = document.getElementById('QuantityInStock');
    const productDescriptionInput = document.getElementById('description');
    const addProductBtn = document.getElementById('addProductBtn');
    const showDataTable = document.getElementById('showData');

    // Default image URL
    const defaultImageUrl = "https://placehold.co/600x400";

    // Function to add product
    function addDataToRealtimeDB() {
        if (!productNameInput.value || !productCategoryInput.value || !productPriceInput.value || !productQuantityInput.value || !productDescriptionInput.value) {
            Swal.fire("Error", "Please fill all required fields", "error");
            return;
        }

        const productId = database.ref('products').push().key; // Generate unique ID
        const product = {
            id: productId,
            code: productCode.value,
            name: productNameInput.value,
            category: productCategoryInput.value,
            price: productPriceInput.value,
            stock: productQuantityInput.value,
            description: productDescriptionInput.value,
            image: defaultImageUrl // Default image
        };

        // Update Firebase
        const updates = {};
        updates[`products/${productId}`] = product;
        updates[`categories/${product.category}/count`] = database.ref(`categories/${product.category}/count`).transaction(count => (count || 0) + 1);

        database.ref().update(updates)
            .then(() => {
                Swal.fire("Success", "Product added successfully!", "success");
                clearInputs();
                fetchAndDisplayProducts();
            })
            .catch((error) => {
                console.log(error)
            });
    }

    // Function to fetch and display products
    function fetchAndDisplayProducts() {
        showDataTable.innerHTML = ""; // Clear table

        database.ref("products").once("value", function (snapshot) {
            if (!snapshot.exists()) {
                showDataTable.innerHTML = "<tr><td colspan='8'>No products found.</td></tr>";
                return;
            }

            snapshot.forEach(function (childSnapshot) {
                const product = childSnapshot.val();
                const productId = childSnapshot.key; // Get Firebase product ID

                // Create table row
                const row = `
                <tr>
                    <td><img src="${product.image || 'https://placehold.co/100x100'}" alt="Product Image" width="50"></td>
                    <td>${product.name}</td>
                    <td>${product.code}</td>
                    <td>${product.category}</td>
                    <td>${product.price} EG</td>
                    <td>${product.stock}</td>
                    <td>${product.description}</td>
                    <td>
                        <button class="action-btn btn-primary edit" data-id="${productId}">Edit</button>
                        <button class="action-btn btn-danger delete" data-id="${productId}">Delete</button>
                    </td>
                </tr>
                `;

                showDataTable.innerHTML += row;
            });
        });
    }

    // Event Listener for Edit/Delete Buttons using Event Delegation
    showDataTable.addEventListener("click", function (event) {
        if (event.target.classList.contains("edit")) {
            const productId = event.target.dataset.id;
            editProduct(productId);
        }
        if (event.target.classList.contains("delete")) {
            const productId = event.target.dataset.id;
            deleteProduct(productId);
        }
    });

    // Function to edit product
    function editProduct(productId) {
        const productRef = database.ref(`products/${productId}`);

        productRef.once("value", (snapshot) => {
            if (snapshot.exists()) {
                const productData = snapshot.val();

                document.getElementById("ProductName").value = productData.name;
                document.getElementById("ProductCode").value = productData.code;
                document.getElementById("ProductCategory").value = productData.category;
                document.getElementById("Price").value = productData.price;
                document.getElementById("QuantityInStock").value = productData.stock;
                document.getElementById("description").value = productData.description;

                addProductBtn.textContent = "Update Product";
                addProductBtn.onclick = function () {
                    updateProduct(productId);
                };
            } else {
                console.error("Product not found.");
            }
        }).catch((error) => {
            console.error("Error fetching product data:", error);
        });
    }

    // Function to delete product
    function deleteProduct(productId) {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to recover this product!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "No, cancel!",
        }).then((result) => {
            if (result.isConfirmed) {
                database.ref(`products/${productId}`).remove()
                    .then(() => {
                        Swal.fire("Deleted!", "Product has been deleted.", "success");
                        fetchAndDisplayProducts();
                    })
                    .catch((error) => {
                        Swal.fire("Error", "Failed to delete product: " + error.message, "error");
                    });
            }
        });
    }

    // Event Listeners
    addProductBtn.addEventListener('click', addDataToRealtimeDB);

    // Fetch and display products on page load
    fetchAndDisplayProducts();

    // Function to Fetch & Update Data
    function updateDashboard() {
        database.ref("products").once("value", (snapshot) => {
            document.getElementById("totalProducts").innerText = snapshot.numChildren();
        });

        database.ref("orders").once("value", (snapshot) => {
            document.getElementById("totalOrders").innerText = snapshot.numChildren();
        });

        database.ref("revenue").once("value", (snapshot) => {
            let totalRevenue = snapshot.val() || 0;
            document.getElementById("totalRevenue").innerText = `EG${totalRevenue.toLocaleString()}`;
        });

        database.ref("customers").once("value", (snapshot) => {
            document.getElementById("newCustomers").innerText = snapshot.numChildren();
        });
    }

    updateDashboard();
});

document.addEventListener("DOMContentLoaded", function () {
    loadAllOrders();
});

function loadAllOrders() {
    const ordersTableBody = document.querySelector("#orders .table tbody");
    ordersTableBody.innerHTML = ""; // Clear previous data

    firebase.database().ref("orders").once("value")
        .then(snapshot => {
            if (!snapshot.exists()) {
                ordersTableBody.innerHTML = "<tr><td colspan='7'>No orders found.</td></tr>";
                return;
            }

            snapshot.forEach(userSnapshot => {
                userSnapshot.forEach(orderSnapshot => {
                    let orderId = orderSnapshot.key;
                    let orderData = orderSnapshot.val();
                    let customerId = userSnapshot.key;
                    let orderDate = new Date(orderData.timestamp).toLocaleDateString();
                    let totalItems = Object.keys(orderData.items).length;
                    let totalAmount = orderData.total;
                    let orderStatus = orderData.status;
                    let customerName = "Unknown"; // Fetch from user data if available

                    // Create order row
                    let orderRow = `
                        <tr>
                            <td>${orderId}</td>
                            <td>${customerName}</td>
                            <td>${orderDate}</td>
                            <td>${totalItems}</td>
                            <td>${totalAmount} EGP</td>
                            <td><span class="badge bg-${getStatusColor(orderStatus)}">${capitalize(orderStatus)}</span></td>
                            <td>
                                <button class="action-btn btn-primary" onclick="viewOrder('${customerId}', '${orderId}')"><i class="fas fa-eye"></i> View</button>
                                ${orderStatus === "pending" ? `<button class="action-btn btn-success" onclick="updateOrderStatus('${customerId}', '${orderId}', 'completed')"><i class="fas fa-check"></i> Complete</button>` : ""}
                                ${orderStatus !== "cancelled" ? `<button class="action-btn btn-danger" onclick="updateOrderStatus('${customerId}', '${orderId}', 'cancelled')"><i class="fas fa-times"></i> Cancel</button>` : ""}
                            </td>
                        </tr>
                    `;

                    ordersTableBody.innerHTML += orderRow;
                });
            });
        })
        .catch(error => {
            console.error("Error fetching orders:", error);
        });
}

function getStatusColor(status) {
    switch (status) {
        case "pending": return "primary";
        case "completed": return "success";
        case "cancelled": return "danger";
        default: return "secondary";
    }
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function updateOrderStatus(userId, orderId, newStatus) {
    firebase.database().ref(`orders/${userId}/${orderId}`).update({ status: newStatus })
        .then(() => {
            Swal.fire("Updated!", `Order marked as ${newStatus}.`, "success");
            loadAllOrders(); // Refresh orders
        })
        .catch(error => {
            console.error("Error updating order status:", error);
        });
}

function viewOrder(userId, orderId) {
    firebase.database().ref(`orders/${userId}/${orderId}`).once("value")
        .then(snapshot => {
            if (snapshot.exists()) {
                let orderData = snapshot.val();
                let itemsHtml = "";

                Object.values(orderData.items).forEach(item => {
                    itemsHtml += `<p><strong>${item.name}</strong> (x${item.quantity}) - ${item.price} EGP</p>`;
                });

                Swal.fire({
                    title: `Order ID: ${orderId}`,
                    html: `<strong>Customer:</strong> Unknown<br>
                           <strong>Date:</strong> ${new Date(orderData.timestamp).toLocaleDateString()}<br>
                           <strong>Status:</strong> ${capitalize(orderData.status)}<br>
                           <strong>Items:</strong> ${itemsHtml}<br>
                           <strong>Total:</strong> ${orderData.total} EGP`,
                    icon: "info"
                });
            } else {
                Swal.fire("Error", "Order details not found.", "error");
            }
        })
        .catch(error => {
            console.error("Error fetching order details:", error);
        });
}
function displayOrders(orders) {
    const ordersTableBody = document.querySelector("#orders .table tbody");
    ordersTableBody.innerHTML = ""; // Clear existing orders

    if (orders.length === 0) {
        ordersTableBody.innerHTML = "<tr><td colspan='7'>No orders found.</td></tr>";
        return;
    }

    orders.forEach(order => {
        let orderRow = `
            <tr>
                <td>${order.orderId}</td>
                <td>${order.customer || "Unknown"}</td>
                <td>${new Date(order.timestamp).toLocaleDateString()}</td>
                <td>${Object.keys(order.items || {}).length}</td>
                <td>${order.total} EGP</td>
                <td><span class="badge bg-${getStatusColor(order.status)}">${capitalize(order.status)}</span></td>
                <td>
                    <button class="action-btn btn-primary" onclick="viewOrder('${order.userId}', '${order.orderId}')"><i class="fas fa-eye"></i> View</button>
                    ${order.status === "pending" ? `<button class="action-btn btn-success" onclick="updateOrderStatus('${order.userId}', '${order.orderId}', 'completed')"><i class="fas fa-check"></i> Complete</button>` : ""}
                    ${order.status !== "cancelled" ? `<button class="action-btn btn-danger" onclick="updateOrderStatus('${order.userId}', '${order.orderId}', 'cancelled')"><i class="fas fa-times"></i> Cancel</button>` : ""}
                </td>
            </tr>
        `;

        ordersTableBody.innerHTML += orderRow;
    });
}
const ordersRef = firebase.database().ref("orders");

function filterOrders(status) {
    ordersRef.once("value")
        .then(snapshot => {
            let filteredOrders = [];
            snapshot.forEach(userSnapshot => {
                userSnapshot.forEach(orderSnapshot => {
                    let orderData = orderSnapshot.val();
                    if (orderData.status === status) {
                        filteredOrders.push({ orderId: orderSnapshot.key, ...orderData });
                    }
                });
            });

            displayOrders(filteredOrders);
        })
        .catch(error => console.error("Error filtering orders:", error));
}