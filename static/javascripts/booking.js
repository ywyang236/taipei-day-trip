// 從localStorage中獲取Token
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
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
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


// 取得預定行程，並顯示在畫面上
document.addEventListener('DOMContentLoaded', function () {
    fetch("/api/booking", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            const itineraryContainer = document.querySelector(".order-process__itinerary");

            // 清空整個主容器
            itineraryContainer.innerHTML = "";

            // 初始計算總金額
            let totalPrice = 0;

            if (data && Array.isArray(data.data) && data.data.length > 0) {
                data.data.forEach(booking => {

                    // 每次加總booking.price
                    totalPrice += booking.price;

                    // 創建預定行程的HTML結構
                    const bookingDiv = document.createElement("div");
                    bookingDiv.classList.add("order-process__itinerary-spot");

                    // 產生刪除按鈕時，同時從後端拿到 data-booking-id
                    const deleteButton = document.createElement("div");
                    deleteButton.classList.add("order-process__itinerary-spot-delete-button");
                    deleteButton.setAttribute("data-booking-id", booking.booking_id);
                    bookingDiv.appendChild(deleteButton);


                    // 當使用者點擊刪除按鈕時，刪除該筆預定行程
                    deleteButton.addEventListener("click", function (event) {
                        event.preventDefault(); // 阻止預設的表單提交行為

                        // 從當前按鈕中取得 booking_id
                        const thisBookingId = this.getAttribute("data-booking-id");

                        // 使用從按鈕中取得的 booking_id
                        fetch(`/api/booking/${thisBookingId}`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            }
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data && data.ok) {
                                    // 刪除成功後，重新整理頁面
                                    window.location.reload();
                                } else {
                                    alert(data.message); // 顯示錯誤信息
                                }
                            })
                            .catch(error => {
                                console.error("There was a problem with the fetch operation:", error.message);
                            });

                    });

                    const leftDiv = document.createElement("div");
                    leftDiv.classList.add("order-process__itinerary-spot-left");

                    const imageDiv = document.createElement("div");
                    imageDiv.classList.add("order-process__itinerary-spot-photo");
                    leftDiv.appendChild(imageDiv);

                    const image = document.createElement("img");
                    image.src = booking.attraction.image;
                    imageDiv.appendChild(image);

                    const rightDiv = document.createElement("div");
                    rightDiv.classList.add("order-process__itinerary-spot-right");

                    const titleDiv = document.createElement("div");
                    titleDiv.classList.add("order-process__itinerary-spot-title");
                    titleDiv.textContent = `台北一日遊：${booking.attraction.name}`;
                    rightDiv.appendChild(titleDiv);

                    const dateDiv = document.createElement("div");
                    dateDiv.classList.add("order-process__itinerary-spot-date-container");
                    rightDiv.appendChild(dateDiv);

                    const dateTitleSpan = document.createElement("span");
                    dateTitleSpan.classList.add("order-process__itinerary-spot-date-title");
                    dateTitleSpan.textContent = `日期：`;
                    dateDiv.appendChild(dateTitleSpan);

                    const dateSpan = document.createElement("span");
                    dateSpan.classList.add("order-process__itinerary-spot-date");
                    dateSpan.textContent = booking.date;
                    dateDiv.appendChild(dateSpan);

                    const timeContainerDiv = document.createElement("div");
                    timeContainerDiv.classList.add("order-process__itinerary-spot-time-container");
                    rightDiv.appendChild(timeContainerDiv);

                    const timeTitleSpan = document.createElement("span");
                    timeTitleSpan.classList.add("order-process__itinerary-spot-time-title");
                    timeTitleSpan.textContent = `時間：`;
                    timeContainerDiv.appendChild(timeTitleSpan);

                    const timeSpan = document.createElement("span");
                    timeSpan.classList.add("order-process__itinerary-spot-time");

                    // 條件判斷
                    if (booking.time === "morning") {
                        timeSpan.textContent = "上半天";
                    } else if (booking.time === "afternoon") {
                        timeSpan.textContent = "下半天";
                    } else {
                        timeSpan.textContent = booking.time;  // 其他情況，或者用預設值
                    }

                    timeContainerDiv.appendChild(timeSpan);

                    const costContainerDiv = document.createElement("div");
                    costContainerDiv.classList.add("order-process__itinerary-spot-cost-container");
                    rightDiv.appendChild(costContainerDiv);

                    const costTitleSpan = document.createElement("span");
                    costTitleSpan.classList.add("order-process__itinerary-spot-cost-title");
                    costTitleSpan.textContent = `費用：`;
                    costContainerDiv.appendChild(costTitleSpan);

                    const costSpan = document.createElement("span");
                    costSpan.classList.add("order-process__itinerary-spot-cost");
                    costSpan.textContent = `${booking.price} 元`;
                    costContainerDiv.appendChild(costSpan);

                    const addressContainerDiv = document.createElement("div");
                    addressContainerDiv.classList.add("order-process__itinerary-spot-address-container");
                    rightDiv.appendChild(addressContainerDiv);

                    const addressTitleSpan = document.createElement("span");
                    addressTitleSpan.classList.add("order-process__itinerary-spot-address-title");
                    addressTitleSpan.textContent = `地點：`;
                    addressContainerDiv.appendChild(addressTitleSpan);

                    const addressSpan = document.createElement("span");
                    addressSpan.classList.add("order-process__itinerary-spot-address");
                    addressSpan.textContent = booking.attraction.address;
                    addressContainerDiv.appendChild(addressSpan);

                    bookingDiv.appendChild(leftDiv);
                    bookingDiv.appendChild(rightDiv);

                    // 將每個預定行程的HTML結構添加到主容器中
                    itineraryContainer.appendChild(bookingDiv);

                    // 創建總價的HTML結構
                    const totalCostContainerDiv = document.createElement("div");
                    totalCostContainerDiv.classList.add("order-process__confirmation-title-container");

                    // 迴圈結束後，將總價顯示在指定的HTML位置
                    const totalCostSpan = document.createElement("span");
                    totalCostSpan.classList.add("order-process__confirmation-money");


                    itineraryContainer.appendChild(bookingDiv);
                });

                const totalCostElement = document.querySelector(".order-process__confirmation-money");
                totalCostElement.textContent = `總價：新台幣 ${totalPrice} 元`;

            } else if (data && Array.isArray(data.data) && data.data.length === 0) {
                // 如果沒有預定行程，顯示提示訊息
                const noBookingMessage = document.createElement("div");
                noBookingMessage.classList.add("order-process__itinerary-no-booking-message");
                noBookingMessage.textContent = "目前沒有任何預定行程";
                itineraryContainer.appendChild(noBookingMessage);

                // 隱藏所有的 class="main__separator"
                const separatorElements = document.querySelectorAll(".main__separator");
                separatorElements.forEach(element => {
                    element.style.display = "none";
                });

                // 隱藏 <div class="order-process__contact">
                const contactElement = document.querySelector(".order-process__contact");
                contactElement.style.display = "none";

                // 隱藏 <div class="order-process__checkout">
                const checkoutElement = document.querySelector(".order-process__checkout");
                checkoutElement.style.display = "none";

                // 隱藏 <div class="order-process__confirmation">
                const confirmationElement = document.querySelector(".order-process__confirmation");
                confirmationElement.style.display = "none";

                // 改變 footer 的樣式
                const footerElement = document.querySelector("footer");
                footerElement.style.height = "100vh";
                footerElement.style.alignItems = "flex-start";
                footerElement.style.paddingTop = "40px";

            } else {
                console.error("Unexpected data format:", data);
            }
        })
        .catch(error => {
            console.error("Error fetching the bookings:", error);
        });

    // 信用卡號輸入框
    const creditCardInput = document.getElementById('creditCardInput');

    creditCardInput.addEventListener('input', function () {
        // 去除非數字字符，並在每4個數字後添加空格
        this.value = this.value.replace(/[^\d]/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    });
});