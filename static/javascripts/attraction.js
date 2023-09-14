// 取得網址中的景點ID
function getAttractionIdFromUrl() {
    let currentUrl = new URL(window.location.href);
    let paths = currentUrl.pathname.split('/');
    let attractionId = paths[paths.length - 1];
    return attractionId;
}

// 透過fetch()呼叫API取得景點資料
function fetchAttractionData(attractionId) {
    fetch(`/api/attraction/${attractionId}`)
        .then(response => response.json())
        .then(data => {
            if (data.data) {
                renderAttractionData(data.data);
            } else {
                console.error(data.message);
            }
        })
        .catch(error => console.error('Error fetching data:', error));
}

// 渲染景點資訊到 HTML 上
function renderAttractionData(data) {
    document.querySelector('.title').innerText = data.name;
    document.querySelector('.category').innerText = data.category;
    document.querySelector('.information_describe').innerText = data.description;
    document.querySelector('.information_address_text').innerText = data.address;

    let imageContainer = document.getElementById('album_image');
    imageContainer.innerHTML = '';

    // 建立 dot 容器
    let dotContainer = document.getElementById('dot_container');
    dotContainer.innerHTML = '';

    data.images.forEach((imgUrl, index) => {
        // 添加圖片
        let imgElement = document.createElement('img');
        imgElement.src = imgUrl;
        imgElement.classList.add('slide_image');
        imgElement.preload = "auto";
        imageContainer.appendChild(imgElement);

        // 為每張圖片添加 dot
        let dotElement = document.createElement('span');
        dotElement.classList.add('dot');
        dotElement.addEventListener('click', () => currentSlide(index));
        dotContainer.appendChild(dotElement);
    });

    // 初始顯示第一張圖片
    showSlide(slideIndex);
}

document.addEventListener('DOMContentLoaded', () => {
    let attractionId = getAttractionIdFromUrl();
    fetchAttractionData(attractionId);
});

let slideIndex = 0; // 初始索引

function showSlide(n) {
    const slides = document.getElementsByClassName('slide_image');
    const dots = document.getElementsByClassName('dot');

    if (n >= slides.length) {
        slideIndex = 0;
    }
    if (n < 0) {
        slideIndex = slides.length - 1;
    }

    // 隱藏所有圖片
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    // 取消所有 active dots
    for (let i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }

    slides[slideIndex].style.display = "block";
    dots[slideIndex].className += " active";
}

function nextPage(n) {
    showSlide(slideIndex += n);
}

function currentSlide(n) {
    showSlide(slideIndex = n);
}

// 選擇時間
document.addEventListener("DOMContentLoaded", function () {
    // 導覽費用
    let feeElement = document.querySelector('.booking_fee > span:last-child');

    // radio按鈕
    let morningRadio = document.getElementById('morning_radio');
    let afternoonRadio = document.getElementById('afternoon_radio');

    // 上半天的按鈕
    morningRadio.addEventListener('change', function () {
        if (morningRadio.checked) {
            feeElement.textContent = "新台幣 2000 元";
        }
    });

    // 下半天的按鈕
    afternoonRadio.addEventListener('change', function () {
        if (afternoonRadio.checked) {
            feeElement.textContent = "新台幣 2500 元";
        }
    });
});
