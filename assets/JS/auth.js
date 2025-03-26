const firebaseConfig = {
    apiKey: "AIzaSyBaUDiGyr4vCX3YJsRomvuKt7L7o55aZZE",
    authDomain: "e-commerce-869ee.firebaseapp.com",
    projectId: "e-commerce-869ee",
    storageBucket: "e-commerce-869ee.firebasestorage.app",
    messagingSenderId: "420577117401",
    appId: "1:420577117401:web:3d11117d5409db8db9eac8",
};
const app = firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// //validateForm register
const functions = firebase.functions();
function validateRegister(event) {
    event.preventDefault();
    // errors
    var nameError = document.getElementById("nameError");
    var usernameError = document.getElementById("usernameError");
    var emailError = document.getElementById("emailError");
    var passwordError = document.getElementById("passwordError");
    var confirmPasswordError = document.getElementById("confirmPasswordError");
    var userTypeError = document.getElementById("userTypeError");

    //  error messages
    nameError.textContent = "";
    usernameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    confirmPasswordError.textContent = "";
    userTypeError.textContent = "";

    const name = document.getElementById("name");
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const userType = document.querySelector('input[name="check"]:checked');
    // Validate Name
    let isValid = true;
    if (!/^[A-Za-z\s]+$/.test(name.value)) {
        nameError.textContent = "Name must contain only letters.";
        isValid = false;
    }

    // Validate Username

    if (!/^[A-Za-z0-9.]+$/.test(username.value)) {
        usernameError.textContent =
            "Username must contain only letters and numbers.";
        isValid = false;
    }

    // Validate Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        emailError.textContent = "Invalid email address.";
        isValid = false;
    }

    // Validate Password
    if (password.value.length < 8) {
        passwordError.textContent = "Password must be at least 8 characters long.";
        isValid = false;
    }

    // Validate Confirm Password
    if (password.value !== confirmPassword.value) {
        confirmPasswordError.textContent = "Passwords do not match.";
        isValid = false;
    }

    // Validate User Type
    if (!userType.checked) {
        userTypeError.textContent = "Please select a user type.";
        isValid = false;
    }

    if (isValid) {
        callCreateUserFunction();
    }
}

async function callCreateUserFunction() {
    const name = document.getElementById("name").value;
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const userType = document.querySelector('input[name="check"]:checked').value;

    try {
        // تسجيل البيانات
        const userCredential = await auth.createUserWithEmailAndPassword(
            email,
            password
        );
        const user = userCredential.user;

        // حفظ البيانات
        await db.collection("users").doc(user.uid).set({
            name: name,
            username: username,
            email: email,
            password: password,
            userType: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

        console.log("User registered and saved to Firestore successfully!");
        alert("User created successfully!");
    } catch (error) {
        console.error("Error creating user:", error);
        alert(error.message);
    }
}

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function validateLogin(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");

    emailError.textContent = "";
    passwordError.textContent = "";

    let isValid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailError.textContent = "Invalid email address.";
        isValid = false;
    }

    if (password.length < 8) {
        passwordError.textContent = "Password must be at least 8 characters long.";
        isValid = false;
    }

    if (!isValid) {
        return;
    }

    auth
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Set cookie for login status
            setCookie("login", 1, 365); // Expires in 1 day

            window.location.href = "index.html";
        })
        .catch((error) => {
            console.log("Full Error Object:", error);

            try {
                const errorObj = JSON.parse(error.message);
                console.log("Parsed Error Object:", errorObj);

                if (
                    errorObj.error &&
                    errorObj.error.message === "INVALID_LOGIN_CREDENTIALS"
                ) {
                    passwordError.textContent =
                        "Invalid email or password. Please try again.";
                }
            } catch (parseError) {
                console.error("Error parsing error message:", parseError);
            }
        });
}

