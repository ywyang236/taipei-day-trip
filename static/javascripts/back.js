document.addEventListener('DOMContentLoaded', function () {
    // 初始化第一頁
    fetchAttractionsData(0);
});

function fetchAttractionsData(page) {
    fetch(`/api/attractions?page=${page}`)
        .then(response => response.json())
        .then(data => {
            if (data.data) {
                renderAttractions(data.data);
            } else {
                console.error('Error fetching data:', data.message);
            }
        })
        .catch(error => console.error('Error fetching attractions:', error));
}

function renderAttractions(attractions) {
    let container = document.getElementById('attraction-container');
    container.innerHTML = '';  // 清空原先的內容

    // 使用模板克隆來填充數據
    attractions.forEach(attraction => {
        let template = document.createElement('div');
        template.innerHTML = `
            <div class="attraction_per_grid">
                <div class="attraction_image_area">
                    <img src="${attraction.images[0]}" class="attraction_image">
                    <div class="attraction_name">
                        <div class="attraction_name_text">${attraction.name}</div>
                    </div>
                </div>
                <div class="attraction_information">
                    <div class="attraction_mrt">${attraction.mrt}</div>
                    <div class="attraction_category">${attraction.category}</div>
                </div>
            </div>
        `;

        // 當使用者點擊 attraction_name_text，導向對應的景點詳情頁面
        template.querySelector('.attraction_name_text').addEventListener('click', function () {
            window.location.href = `/attraction/${attraction.id}`;
        });

        container.appendChild(template.firstElementChild);
    });
}
