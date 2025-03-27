function getCookie(name) {
    let cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        let [key, value] = cookie.split('=');
        if (key === name) return value;
    }
    return null;
}

function updateAuthButtons() {
    const authContainer = document.getElementById("auth-container");
    const user = getCookie("login");
    const isAdmin = getCookie("Admin") === "1"

    if (user) {
        authContainer.innerHTML = `
            <div class="user-menu">
                <i class="fas fa-user user-icon" onclick="toggleDropdown()"></i>
                <div class="dropdown" id="user-dropdown">
                    <a href="#">Profile</a>
                    <a href="orders.html" id="view-orders">My Orders</a></li>
                    ${isAdmin ? '<a href="admin/index.html">Admin</a>' : ""} <!-- Show only if admin -->
                    <a href="#" onclick="logout()">Logout</a>
                </div>
            </div>
        `;
    }
}


function toggleDropdown() {
    document.getElementById("user-dropdown").classList.toggle("show");
}

function logout() {
    document.cookie = "login=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "Admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    location.reload();
}

document.addEventListener("click", function(event) {
    if (!event.target.matches(".user-icon")) {
        document.getElementById("user-dropdown")?.classList.remove("show");
    }
});

updateAuthButtons();