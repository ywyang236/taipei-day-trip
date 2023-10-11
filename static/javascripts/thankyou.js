const token = localStorage.getItem('token');

// 取得使用者姓名，並顯示在畫面上
document.addEventListener('DOMContentLoaded', function () {
    if (!token) {
        window.location.href = "/";
        return;
    }

    fetch("/api/user/auth", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                window.location.href = "/";
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            if (data && data.data && data.data.name) {
                document.getElementById("user_name_display").innerText = data.data.name;
            }
        })
        .catch(error => {
            console.error("There was a problem with the fetch operation:", error.message);
        });
});

// 取得 order_number，並顯示在畫面上
document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const orderNumber = urlParams.get('number');

    if (orderNumber) {
        document.getElementById('order_number').textContent = orderNumber;
    }
});

// 改變 footer 的樣式
const footerElement = document.querySelector("footer");
footerElement.style.height = "100vh";
footerElement.style.alignItems = "flex-start";
footerElement.style.paddingTop = "40px";