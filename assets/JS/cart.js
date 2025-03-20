
const quantityInputs = document.querySelectorAll(".quantity-input");
const quantityButtons = document.querySelectorAll(".quantity-btn");

quantityButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const input = button.parentElement.querySelector(".quantity-input");
        let value = parseInt(input.value);

        if (button.getAttribute("data-action") === "increase") {
            value++;
        } else if (button.getAttribute("data-action") === "decrease" && value > 1) {
            value--;
        }

        input.value = value;
        updateCartTotal();
    });
});

const removeButtons = document.querySelectorAll(".remove-item");

removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const cartItem = button.closest(".cart-item");
        cartItem.remove();
        updateCartTotal();
    });
});

function updateCartTotal() {
    let subtotal = 0;
    const cartItems = document.querySelectorAll(".cart-item");

    cartItems.forEach((item) => {
        const price = parseFloat(item.querySelector(".item-price").textContent.replace("$", ""));
        const quantity = parseInt(item.querySelector(".quantity-input").value);
        subtotal += price * quantity;
    });

    const shipping = 10.0;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    document.querySelector(".subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.querySelector(".shipping").textContent = `$${shipping.toFixed(2)}`;
    document.querySelector(".tax").textContent = `$${tax.toFixed(2)}`;
    document.querySelector(".total-amount").textContent = `$${total.toFixed(2)}`;
}

updateCartTotal();