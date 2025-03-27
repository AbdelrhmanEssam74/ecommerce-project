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

    // Call function on page load
    updateDashboard();
});
