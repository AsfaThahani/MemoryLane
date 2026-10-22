document.addEventListener("DOMContentLoaded", function () {
    const loginButton = document.querySelector(".buttonLogin");
    const signupButton = document.querySelector(".buttonSignup");
    const createMemoriesButton = document.getElementById("create-memories-button");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const backdrop = document.getElementById("backdrop");


    function showForm() {
        backdrop.style.display = "block";
        document.querySelector(".center-container").style.display = "flex";
    }


    backdrop.addEventListener("click", function () {
        loginForm.style.display = "none";
        signupForm.style.display = "none";
        backdrop.style.display = "none";
    });

 
    createMemoriesButton.addEventListener("click", function () {
        loginForm.style.display = "flex";
        signupForm.style.display = "none";
        backdrop.style.display = "block";
    });

    loginButton.addEventListener("click", function () {
        loginForm.style.display = "flex";
        signupForm.style.display = "none";
        backdrop.style.display = "block";
    });

    signupButton.addEventListener("click", function () {
        signupForm.style.display = "flex";
        loginForm.style.display = "none";
        backdrop.style.display = "block";
    });


    document.querySelector(".signup-link").addEventListener("click", function () {
        loginForm.style.display = "none";
        signupForm.style.display = "flex";
    });

    document.querySelector(".login-link").addEventListener("click", function () {
        signupForm.style.display = "none";
        loginForm.style.display = "flex";
    });


    signupForm.addEventListener("submit", function (event) {
        const emailInput = document.querySelector("#signup-form input[name='email']").value.trim();
        const passwordInput = document.querySelector("#signup-form input[name='password']").value.trim();
        const confirmPasswordInput = document.querySelector("#signup-form input[name='confirm_password']").value.trim();


        const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)$/;

        console.log("Email Input: ", emailInput);

        if (!emailPattern.test(emailInput)) {
            event.preventDefault(); 
            alert("Invalid email format! Please enter a valid email.");
            return; 
        }

      
        if (passwordInput !== confirmPasswordInput) {
            event.preventDefault();
            alert("Passwords do not match. Please try again.");
            return;
        }

        if (passwordInput.length < 6) {
            event.preventDefault();
            alert("Password must be at least 6 characters long.");
            return;
        }
    });
});
