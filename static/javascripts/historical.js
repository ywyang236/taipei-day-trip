
// 取得 token
const token = localStorage.getItem('token');

// 取得使用者姓名，並顯示在畫面上
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector(".historical-order__order-details").innerHTML = "";

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

// 取得歷史訂單資料
function fetchOrderData() {
    // 取得訂單編號
    fetch(`/api/user/orders`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            console.log(data);
            if (data && data.data && data.data.length > 0) {
                // 顯示訂單明細
                displayOrderDetails();
            }
        })

        .catch(error => {
            console.error("Error fetching order data:", error);
        });
}


function displayOrderDetails(data) {
    const orderDetails = document.querySelector(".historical-order__order-details");

    // 建立總覽容器
    const overviewContainer = document.createElement("div");
    overviewContainer.classList.add("historical-order__overview-container");

    // 建立訂單編號容器
    const orderNumberContainer = document.createElement("div");
    orderNumberContainer.classList.add("historical-order__order-number-container");
    overviewContainer.appendChild(orderNumberContainer);

    // 建立訂單編號標題
    const orderNumberTitle = document.createElement("span");
    orderNumberTitle.classList.add("historical-order__order-number-title");
    orderNumberTitle.innerText = "訂單編號：";
    orderNumberContainer.appendChild(orderNumberTitle);

    // 建立訂單編號
    const orderNumber = document.createElement("span");
    orderNumber.classList.add("historical-order__order-number");
    orderNumber.innerText = `${data.order_number}`;
    orderNumberContainer.appendChild(orderNumber);

    // 建立訂單日期容器
    const orderDateContainer = document.createElement("div");
    orderDateContainer.classList.add("historical-order__order-date-container");
    overviewContainer.appendChild(orderDateContainer);

    // 建立訂單日期標題
    const orderDateTitle = document.createElement("span");
    orderDateTitle.classList.add("historical-order__order-date-title");
    orderDateTitle.innerText = "訂單日期：";
    orderDateContainer.appendChild(orderDateTitle);

    // 建立訂單日期
    const orderDate = document.createElement("span");
    orderDate.classList.add("historical-order__order-date");
    orderDate.innerText = `${data.payment_date}`;
    orderDateContainer.appendChild(orderDate);

    // 建立金額容器
    const orderAmountContainer = document.createElement("div");
    orderAmountContainer.classList.add("historical-order__order-amount-container");
    overviewContainer.appendChild(orderAmountContainer);

    // 建立消費金額標題
    const orderAmountTitle = document.createElement("span");
    orderAmountTitle.classList.add("historical-order__order-amount-title");
    orderAmountTitle.innerText = "消費金額：";
    orderAmountContainer.appendChild(orderAmountTitle);

    // 建立消費金額
    const orderAmount = document.createElement("span");
    orderAmount.classList.add("historical-order__order-amount");
    orderAmount.innerText = `${data.total_price}`;
    orderAmountContainer.appendChild(orderAmount);

    // 建立預約數量容器
    const orderQuantityContainer = document.createElement("div");
    orderQuantityContainer.classList.add("historical-order__order-quantity-container");
    overviewContainer.appendChild(orderQuantityContainer);

    // 建立預約數量標題
    const orderQuantityTitle = document.createElement("span");
    orderQuantityTitle.classList.add("historical-order__order-quantity-title");
    orderQuantityTitle.innerText = "預約數量：";
    orderQuantityContainer.appendChild(orderQuantityTitle);

    // 建立預約數量
    const orderQuantity = document.createElement("span");
    orderQuantity.classList.add("historical-order__order-quantity");
    orderQuantity.innerText = `${data.attraction_count}`;
    orderQuantityContainer.appendChild(orderQuantity);

    orderDetails.appendChild(overviewContainer);

}

const footerElement = document.querySelector("footer");
footerElement.style.height = "100vh";
footerElement.style.alignItems = "flex-start";
footerElement.style.paddingTop = "40px";

