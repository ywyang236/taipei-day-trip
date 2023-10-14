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
        // 使用 orderNumber 取得訂單詳細資訊
        fetch(`/api/order/${orderNumber}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                // 使用取得的訂單詳細資訊更新頁面
                displayOrderDetails(data);
            })
            .catch(error => {
                console.error("There was a problem with the fetch operation:", error.message);
            });
    }
});

function displayOrderDetails(data) {
    const orderDetails = document.querySelector(".thankyou__order-details");

    // 清空整個主容器
    orderDetails.innerHTML = "";

    // 建立總覽容器
    const overviewContainer = document.createElement("div");
    overviewContainer.classList.add("thankyou__overview-container");

    // 建立訂單編號容器
    const orderNumberContainer = document.createElement("div");
    orderNumberContainer.classList.add("thankyou__order-number-container");
    overviewContainer.appendChild(orderNumberContainer);

    // 建立訂單編號標題
    const orderNumberTitle = document.createElement("span");
    orderNumberTitle.classList.add("thankyou__order-number-title");
    orderNumberTitle.innerText = "訂單編號：";
    orderNumberContainer.appendChild(orderNumberTitle);

    // 建立訂單編號
    const orderNumber = document.createElement("span");
    orderNumber.classList.add("thankyou__order-number");
    orderNumber.innerText = `${data.data.order_number}`;
    orderNumberContainer.appendChild(orderNumber);

    // 建立訂單日期容器
    const orderDateContainer = document.createElement("div");
    orderDateContainer.classList.add("thankyou__order-date-container");
    overviewContainer.appendChild(orderDateContainer);

    // 建立訂單日期標題
    const orderDateTitle = document.createElement("span");
    orderDateTitle.classList.add("thankyou__order-date-title");
    orderDateTitle.innerText = "付款日期：";
    orderDateContainer.appendChild(orderDateTitle);

    // 建立訂單日期
    const orderDate = document.createElement("span");
    orderDate.classList.add("thankyou__order-date");
    orderDate.innerText = `${data.data.created_at}`;
    orderDateContainer.appendChild(orderDate);

    // 建立金額容器
    const orderAmountContainer = document.createElement("div");
    orderAmountContainer.classList.add("thankyou__order-amount-container");
    overviewContainer.appendChild(orderAmountContainer);

    // 建立消費金額標題
    const orderAmountTitle = document.createElement("span");
    orderAmountTitle.classList.add("thankyou__order-amount-title");
    orderAmountTitle.innerText = "消費金額：";
    orderAmountContainer.appendChild(orderAmountTitle);

    // 建立消費金額
    const orderAmount = document.createElement("span");
    orderAmount.classList.add("thankyou__order-amount");
    orderAmount.innerText = `新台幣 ${data.data.total_price} 元`;
    orderAmountContainer.appendChild(orderAmount);

    // 建立景點數量容器
    const orderQuantityContainer = document.createElement("div");
    orderQuantityContainer.classList.add("thankyou__order-quantity-container");
    overviewContainer.appendChild(orderQuantityContainer);

    // 建立景點數量標題
    const orderQuantityTitle = document.createElement("span");
    orderQuantityTitle.classList.add("thankyou__order-quantity-title");
    orderQuantityTitle.innerText = "景點數量：";
    orderQuantityContainer.appendChild(orderQuantityTitle);

    // 建立景點數量
    const orderQuantity = document.createElement("span");
    orderQuantity.classList.add("thankyou__order-quantity");
    orderQuantity.innerText = `${data.data.trip.length}個景點`;
    orderQuantityContainer.appendChild(orderQuantity);

    orderDetails.appendChild(overviewContainer);


    for (let i = 0; i < data.data.trip.length; i++) {
        // 建立景點容器
        const spotContainer = document.createElement("div");
        spotContainer.classList.add("thankyou__spot");

        // 建立景點左側容器
        const spotLeftContainer = document.createElement("div");
        spotLeftContainer.classList.add("thankyou__spot-left-container");
        spotContainer.appendChild(spotLeftContainer);

        // 建立景點照片
        const spotPhoto = document.createElement("img");
        spotPhoto.classList.add("thankyou__spot-photo");
        spotPhoto.src = `${data.data.trip[i].attraction.image}`;
        spotLeftContainer.appendChild(spotPhoto);

        // 建立景點右側容器
        const spotRightContainer = document.createElement("div");
        spotRightContainer.classList.add("thankyou__spot-right-container");
        spotContainer.appendChild(spotRightContainer);

        // 建立景點名稱容器
        const spotNameContainer = document.createElement("div");
        spotNameContainer.classList.add("thankyou__spot-name-container");
        spotRightContainer.appendChild(spotNameContainer);

        // 建立景點名稱標題
        const spotNameTitle = document.createElement("span");
        spotNameTitle.classList.add("thankyou__spot-name-title");
        spotNameTitle.innerText = "景點名稱：";
        spotNameContainer.appendChild(spotNameTitle);

        // 建立景點名稱
        const spotName = document.createElement("span");
        spotName.classList.add("thankyou__spot-name");
        spotName.innerText = `${data.data.trip[i].attraction.name}`;
        spotNameContainer.appendChild(spotName);

        // 建立預約日期容器
        const spotDateContainer = document.createElement("div");
        spotDateContainer.classList.add("thankyou__spot-date-container");
        spotRightContainer.appendChild(spotDateContainer);

        // 建立預約日期標題
        const spotDateTitle = document.createElement("span");
        spotDateTitle.classList.add("thankyou__spot-date-title");
        spotDateTitle.innerText = "預約日期：";
        spotDateContainer.appendChild(spotDateTitle);

        // 建立預約日期
        const spotDate = document.createElement("span");
        spotDate.classList.add("thankyou__spot-date");
        const parsedDate = new Date(data.data.trip[i].date);
        const formattedDate = `${parsedDate.getFullYear()}年${(parsedDate.getMonth() + 1).toString().padStart(2, '0')}月${parsedDate.getDate().toString().padStart(2, '0')}日`;
        spotDate.innerText = formattedDate;
        spotDateContainer.appendChild(spotDate);

        // 建立預約時段容器
        const spotTimeContainer = document.createElement("div");
        spotTimeContainer.classList.add("thankyou__spot-time-container");
        spotRightContainer.appendChild(spotTimeContainer);

        // 建立預約時段標題
        const spotTimeTitle = document.createElement("span");
        spotTimeTitle.classList.add("thankyou__spot-time-title");
        spotTimeTitle.innerText = "預約時段：";
        spotTimeContainer.appendChild(spotTimeTitle);

        // 建立預約時段
        const spotTime = document.createElement("span");
        spotTime.classList.add("thankyou__spot-time");
        const timeValue = data.data.trip[i].time;
        spotTime.innerText = timeValue === 'morning' ? '上半天' : (timeValue === 'afternoon' ? '下半天' : timeValue);
        spotTimeContainer.appendChild(spotTime);

        // 建立行程費用容器
        const spotPriceContainer = document.createElement("div");
        spotPriceContainer.classList.add("thankyou__spot-price-container");
        spotRightContainer.appendChild(spotPriceContainer);

        // 建立行程費用標題
        const spotPriceTitle = document.createElement("span");
        spotPriceTitle.classList.add("thankyou__spot-price-title");
        spotPriceTitle.innerText = "行程費用：";
        spotPriceContainer.appendChild(spotPriceTitle);

        // 建立行程費用
        const spotPrice = document.createElement("span");
        spotPrice.classList.add("thankyou__spot-price");
        spotPrice.innerText = `新台幣 ${data.data.trip[i].price} 元`;
        spotPriceContainer.appendChild(spotPrice);

        // 建立預約地點容器
        const spotAddressContainer = document.createElement("div");
        spotAddressContainer.classList.add("thankyou__spot-address-container");
        spotRightContainer.appendChild(spotAddressContainer);

        // 建立預約地點標題
        const spotAddressTitle = document.createElement("span");
        spotAddressTitle.classList.add("thankyou__spot-address-title");
        spotAddressTitle.innerText = "預約地點：";
        spotAddressContainer.appendChild(spotAddressTitle);

        // 建立預約地點
        const spotAddress = document.createElement("span");
        spotAddress.classList.add("thankyou__spot-address");
        spotAddress.innerText = `${data.data.trip[i].attraction.address}`;
        spotAddressContainer.appendChild(spotAddress);

        orderDetails.appendChild(spotContainer);
    }
}