document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".toggle-container");
    if (!toggle) return;

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        toggle.classList.add("dark");
    }

    toggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        toggle.classList.toggle("dark");

        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    });
});