let nextPage = null; // 存儲下一頁的資料
let isLoading = false; // 檢查是否正在載入資料
let currentKeyword = ''; // 存儲目前搜尋的關鍵字
let results = []; // 存儲所有搜尋到的資料


document.addEventListener('DOMContentLoaded', function () {
    // 輸入時，改變輸入框內文字的顏色
    const inputArea = document.getElementById('input_area');

    inputArea.addEventListener('input', function () {
        if (this.value) {
            this.style.color = 'black';
        } else {
            this.style.color = '#757575';
        }
    });

    // 當頁面滾動到最底部時，載入更多資料
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const attractionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && nextPage !== null) {
                fetchAttractions(nextPage);
            }
        });
    }, observerOptions);

    const loadMoreDiv = document.createElement('div');
    loadMoreDiv.className = 'load-more-div';
    document.body.appendChild(loadMoreDiv);
    attractionObserver.observe(loadMoreDiv);
});

// 取得捷運站資料
async function getMrtData() {
    try {
        const response = await fetch('/api/mrts');
        const data = await response.json();

        return data.data;
    } catch (error) {
        console.log(error);
        return [];
    }
}

// 顯示捷運站資料
async function displayMrtData() {
    const listContainer = document.querySelector('#mrt-list-content');

    // listContainer.innerHTML = '';

    try {
        const mrtNames = await getMrtData();

        if (mrtNames) {
            mrtNames.forEach(station => {
                if (station) {
                    const stationDiv = document.createElement('div');
                    stationDiv.className = 'mrt_list_content_station';
                    stationDiv.textContent = station;
                    stationDiv.onclick = function () {
                        searchMrtStation(station);
                    };
                    listContainer.appendChild(stationDiv);
                }
            });
        }
    } catch (error) {
        console.log(error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    displayMrtData();
});


// 搜尋捷運站
function searchMrtStation(station) {
    const inputArea = document.getElementById('input_area');
    inputArea.value = station;
    inputArea.style.color = 'black';

    let url = `/api/attractions?page=0&keyword=${encodeURIComponent(station)}`;

    document.querySelector('.attraction_container').innerHTML = '';
    results = [];
    nextPage = null;
    isLoading = false;

    fetchAttractionsByKeyword(url);
}

// 搜尋關鍵字
async function search() {
    const inputArea = document.getElementById('input_area').value;
    let url;
    if (inputArea.trim()) {
        url = `/api/attractions?page=0&keyword=${encodeURIComponent(inputArea)}`;
        currentKeyword = encodeURIComponent(inputArea);
    } else {
        url = '/api/attractions?page=0';
        currentKeyword = '';
    }

    document.querySelector('.attraction_container').innerHTML = '';
    results = [];
    nextPage = null;
    isLoading = false;

    fetchAttractionsByKeyword(url);
}

// 擷取與關鍵字相關的資料
function fetchAttractionsByKeyword(url) {
    if (isLoading) return;
    isLoading = true;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            isLoading = false;

            if (data.error) {
                alert(data.message);
                return;
            }

            if (data.data && data.data.length > 0) {
                renderAttractions(data.data);
            } else {
                // 如果沒有找到結果，顯示相應的提示
                const noResultsDiv = document.createElement('div');
                noResultsDiv.innerHTML = '沒有找到相關景點';
                document.querySelector('.attraction_container').appendChild(noResultsDiv);
            }

            nextPage = data.nextPage;
        })
        .catch(error => {
            console.error('Error fetching attractions by keyword:', error);
            alert('伺服器取得資料時發生錯誤，請稍後再試');
        });
}

// 搜尋表單的事件監聽器
document.getElementById('search-bar').addEventListener('submit', function (e) {
    e.preventDefault();  // 防止表單的默認提交行為
    search();
});




// 按鈕左右移動
let listContent = document.getElementById('mrt-list-content');
let scrollAmount = 300;

function moveLeft() {
    listContent.scrollLeft -= scrollAmount;
}

function moveRight() {
    listContent.scrollLeft += scrollAmount;
}


// 渲染景點到前端
document.addEventListener('DOMContentLoaded', function () {
    fetchAttractions(0);  // 預設從第0頁開始載入
});

function fetchAttractions(page) {
    if (isLoading) return; // 如果當前正在載入，則直接返回
    isLoading = true;

    // 依照是否有關鍵字來建構不同的URL
    let url = `/api/attractions?page=${page}`;
    if (currentKeyword.trim()) {
        url += `&keyword=${currentKeyword}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            isLoading = false;  // 重置載入狀態

            if (data.error) {
                alert(data.message);
                return;
            }

            renderAttractions(data.data);

            nextPage = data.nextPage; // 儲存下一頁的資訊
        })
        .catch(error => {
            console.error('Error fetching attractions:', error);
            alert('伺服器取得資料時發生錯誤，請稍後再試');
        });
}

function renderAttractions(attractions) {
    const attractionContainer = document.getElementById('attraction-container');

    attractions.forEach(attraction => {
        const attractionGrid = document.createElement('div');
        attractionGrid.className = 'attraction_per_grid';

        // 點擊景點卡片時，跳轉到景點頁面
        attractionGrid.addEventListener('click', function () {
            window.location.href = `/attraction/${attraction.id}`;
        });

        const attractionImageArea = document.createElement('div');
        attractionImageArea.className = 'attraction_image_area';
        attractionGrid.appendChild(attractionImageArea);

        const attractionImage = document.createElement('img');
        attractionImage.className = 'attraction_image';
        attractionImage.src = attraction.images[0];  // 用第一張圖片
        attractionImageArea.appendChild(attractionImage);

        const attractionName = document.createElement('div');
        attractionName.className = 'attraction_name';
        attractionImageArea.appendChild(attractionName);

        const attractionNameText = document.createElement('div');
        attractionNameText.className = 'attraction_name_text';
        attractionNameText.textContent = attraction.name;
        attractionName.appendChild(attractionNameText);

        const attractionInformation = document.createElement('div');
        attractionInformation.className = 'attraction_information';
        attractionGrid.appendChild(attractionInformation);

        const attractionMRT = document.createElement('div');
        attractionMRT.className = 'attraction_mrt';
        attractionMRT.textContent = attraction.mrt;
        attractionInformation.appendChild(attractionMRT);

        const attractionCategory = document.createElement('div');
        attractionCategory.className = 'attraction_category';
        attractionCategory.textContent = attraction.category;
        attractionInformation.appendChild(attractionCategory);

        attractionContainer.appendChild(attractionGrid);
    });
}
