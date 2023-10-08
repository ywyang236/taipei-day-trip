
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


function fetchOrderData() {
    // 從輸入框取得訂單編號
    const orderNumber = document.getElementById('orderNumberInput').value;

    // 如果訂單編號不存在，提示使用者
    if (!orderNumber) {
        alert('請輸入訂單編號！');
        return;
    }

    // 呼叫API
    fetch(`/api/order/${orderNumber}`, {
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
        .then(orderData => {
            displayOrderDetails(orderData);
        })
        .catch(error => {
            console.error("Error fetching order data:", error);
        });
}


function displayOrderDetails(data) {
    const orderDetails = document.querySelector(".historical-order__order-details");

    // 清空整個主容器
    orderDetails.innerHTML = "";

    // 建立總覽容器
    const overviewContainer = document.createElement("div");
    overviewContainer.classList.add("historical-order__overview-container");


    // 建立訂單編號容器
    const orderNumberContainer = document.createElement("div");
    orderNumberContainer.classList.add("historical-order__order-number-container");


    // 建立訂單編號標題
    const orderNumberTitle = document.createElement("span");
    orderNumberTitle.classList.add("historical-order__order-number-title");
    orderNumberTitle.innerText = "訂單編號：";


    // 建立訂單編號
    const orderNumber = document.createElement("span");
    orderNumber.classList.add("historical-order__order-number");
    orderNumber.innerText = `${data.data.order_number}`;


    // 建立訂單日期容器
    const orderDateContainer = document.createElement("div");
    orderDateContainer.classList.add("historical-order__order-date-container");


    // 建立訂單日期標題
    const orderDateTitle = document.createElement("span");
    orderDateTitle.classList.add("historical-order__order-date-title");
    orderDateTitle.innerText = "訂單日期：";


    // 建立訂單日期
    const orderDate = document.createElement("span");
    orderDate.classList.add("historical-order__order-date");
    orderDate.innerText = `${data.data.created_at}`;


    // 建立金額容器
    const orderAmountContainer = document.createElement("div");
    orderAmountContainer.classList.add("historical-order__order-amount-container");


    // 建立消費金額標題
    const orderAmountTitle = document.createElement("span");
    orderAmountTitle.classList.add("historical-order__order-amount-title");
    orderAmountTitle.innerText = "消費金額：";

    // 建立消費金額
    const orderAmount = document.createElement("span");
    orderAmount.classList.add("historical-order__order-amount");
    orderAmount.innerText = `${data.data.total_price}`;


    // 建立預約數量容器
    const orderQuantityContainer = document.createElement("div");
    orderQuantityContainer.classList.add("historical-order__order-quantity-container");

    // 建立預約數量標題
    const orderQuantityTitle = document.createElement("span");
    orderQuantityTitle.classList.add("historical-order__order-quantity-title");
    orderQuantityTitle.innerText = "預約數量：";

    // 建立預約數量
    const orderQuantity = document.createElement("span");
    orderQuantity.classList.add("historical-order__order-quantity");
    orderQuantity.innerText = `${data.order_quantity}`;


    // 建立景點容器
    const spotContainer = document.createElement("div");
    spotContainer.classList.add("historical-order__spot");


    // 建立景點左側容器
    const spotLeftContainer = document.createElement("div");
    spotLeftContainer.classList.add("historical-order__spot-left-container");


    // 建立景點照片
    const spotPhoto = document.createElement("img");
    spotPhoto.classList.add("historical-order__spot-photo");
    spotPhoto.src = `${data.data.trip[0].attraction.image}`;


    // 建立景點右側容器
    const spotRightContainer = document.createElement("div");
    spotRightContainer.classList.add("historical-order__spot-right-container");


    // 建立景點名稱容器
    const spotNameContainer = document.createElement("div");
    spotNameContainer.classList.add("historical-order__spot-name-container");

    // 建立景點名稱標題
    const spotNameTitle = document.createElement("span");
    spotNameTitle.classList.add("historical-order__spot-name-title");
    spotNameTitle.innerText = "景點名稱：";


    // 建立景點名稱
    const spotName = document.createElement("span");
    spotName.classList.add("historical-order__spot-name");
    spotName.innerText = `${data.data.trip[0].attraction.name}`;


    // 建立景點日期容器
    const spotDateContainer = document.createElement("div");
    spotDateContainer.classList.add("historical-order__spot-date-container");

    // 建立景點日期標題
    const spotDateTitle = document.createElement("span");
    spotDateTitle.classList.add("historical-order__spot-date-title");
    spotDateTitle.innerText = "景點日期：";


    // 建立景點日期
    const spotDate = document.createElement("span");
    spotDate.classList.add("historical-order__spot-date");
    spotDate.innerText = `${data.data.trip[0].date}`;


    // 建立預約時段容器
    const spotTimeContainer = document.createElement("div");
    spotTimeContainer.classList.add("historical-order__spot-time-container");

    // 建立預約時段標題
    const spotTimeTitle = document.createElement("span");
    spotTimeTitle.classList.add("historical-order__spot-time-title");
    spotTimeTitle.innerText = "預約時段：";


    // 建立預約時段
    const spotTime = document.createElement("span");
    spotTime.classList.add("historical-order__spot-time");
    spotTime.innerText = `${data.data.trip[0].time}`;


    // 建立行程費用容器
    const spotPriceContainer = document.createElement("div");
    spotPriceContainer.classList.add("historical-order__spot-price-container");

    // 建立行程費用標題
    const spotPriceTitle = document.createElement("span");
    spotPriceTitle.classList.add("historical-order__spot-price-title");
    spotPriceTitle.innerText = "行程費用：";

    // 建立行程費用
    const spotPrice = document.createElement("span");
    spotPrice.classList.add("historical-order__spot-price");
    spotPrice.innerText = `${data.data.trip[0].price}`;

    // 建立預約地點容器
    const spotAddressContainer = document.createElement("div");
    spotAddressContainer.classList.add("historical-order__spot-address-container");

    // 建立預約地點標題
    const spotAddressTitle = document.createElement("span");
    spotAddressTitle.classList.add("historical-order__spot-address-title");
    spotAddressTitle.innerText = "預約地點：";

    // 建立預約地點
    const spotAddress = document.createElement("span");
    spotAddress.classList.add("historical-order__spot-address");
    spotAddress.innerText = `${data.data.trip[0].attraction.address}`;

    // Appending elements to the main container
    orderNumberContainer.appendChild(orderNumberTitle);
    orderNumberContainer.appendChild(orderNumber);
    overviewContainer.appendChild(orderNumberContainer);

    orderDateContainer.appendChild(orderDateTitle);
    orderDateContainer.appendChild(orderDate);
    overviewContainer.appendChild(orderDateContainer);

    orderAmountContainer.appendChild(orderAmountTitle);
    orderAmountContainer.appendChild(orderAmount);
    overviewContainer.appendChild(orderAmountContainer);

    orderQuantityContainer.appendChild(orderQuantityTitle);
    orderQuantityContainer.appendChild(orderQuantity);
    overviewContainer.appendChild(orderQuantityContainer);

    orderDetails.appendChild(overviewContainer);

    spotLeftContainer.appendChild(spotPhoto);
    spotContainer.appendChild(spotLeftContainer);

    spotNameContainer.appendChild(spotNameTitle);
    spotNameContainer.appendChild(spotName);
    spotRightContainer.appendChild(spotNameContainer);

    spotDateContainer.appendChild(spotDateTitle);
    spotDateContainer.appendChild(spotDate);
    spotRightContainer.appendChild(spotDateContainer);

    spotTimeContainer.appendChild(spotTimeTitle);
    spotTimeContainer.appendChild(spotTime);
    spotRightContainer.appendChild(spotTimeContainer);

    spotPriceContainer.appendChild(spotPriceTitle);
    spotPriceContainer.appendChild(spotPrice);
    spotRightContainer.appendChild(spotPriceContainer);

    spotAddressContainer.appendChild(spotAddressTitle);
    spotAddressContainer.appendChild(spotAddress);
    spotRightContainer.appendChild(spotAddressContainer);

    spotContainer.appendChild(spotRightContainer);

    orderDetails.appendChild(spotContainer);
}

const footerElement = document.querySelector("footer");
footerElement.style.height = "100vh";
footerElement.style.alignItems = "flex-start";
footerElement.style.paddingTop = "40px";

