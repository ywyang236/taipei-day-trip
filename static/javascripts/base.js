// 頁面載入動畫
window.addEventListener("load", function () {
    let loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.style.display = "none";
});

// 選取「登入」按鈕
let signinButton = document.querySelector('.signin_button');
let dialogSigninPrompt = document.querySelector('.dialog_signin_prompt')

// 選取「註冊」按鈕
let dialogSignupPrompt = document.querySelector('.dialog_signup_prompt');

// 選取「預約行程」按鈕
let bookingButton = document.querySelector('.booking_button');

// 選取「歷史訂單」按鈕
let historicalOrderButton = document.querySelector('.historical_order_button');

// 一般訊息對話框
let dialogSection = document.querySelector('.dialog_section');

// 登入對話框
let dialogSigninSection = document.querySelector('.dialog_signin_section');
let closeSigninButton = document.querySelector('.dialog_close_signin_button');
let closeSignupButton = document.querySelector('.dialog_close_signup_button');

let dialogSignupSection = document.querySelector('.dialog_signup_section');

// 成功或錯誤訊息的對話框
let dialogSigninMessage = document.querySelector('.dialog_signin_message');
let dialogSignupMessage = document.querySelector('.dialog_signup_message');

// 登出
let signoutButton = document.querySelector('.signout_button');

// 檢查會員登入狀態
// 頁面載入時，檢查使用者是否已登入
const checkUserLoginStatus = function () {
    // 如果 local storage 有 token，代表使用者已登入
    if (localStorage.getItem('token')) {
        fetch('/api/user/auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(result => {
                if (!result.error) {
                    // 顯示登出按鈕，隱藏登入、註冊按鈕
                    signoutButton.style.display = 'flex';
                    signinButton.style.display = 'none';
                } else {
                    // Token 無效，清除 localStorage 中的 Token
                    localStorage.removeItem('token');
                    signinButton.style.display = 'flex';
                    signoutButton.style.display = 'none';
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
    } else {
        // 沒有 Token，顯示登入按鈕
        signinButton.style.display = 'flex';
        signoutButton.style.display = 'none';
    }
};

document.addEventListener('DOMContentLoaded', function () {
    checkUserLoginStatus();
});

// 如果使用者在「預約行程」，則隱藏「預約行程」按鈕，顯示「歷史訂單」按鈕
const isBookingPage = function () {
    if (window.location.pathname === '/booking') {
        bookingButton.style.display = 'none';
        historicalOrderButton.style.display = 'flex';
    }
    if (window.location.pathname === '/thankyou') {
        bookingButton.style.display = 'none';
        historicalOrderButton.style.display = 'flex';
    }
}

window.addEventListener('DOMContentLoaded', isBookingPage);


// 「登入」按鈕的點擊事件
signinButton.addEventListener('click', function () {
    dialogSection.style.display = 'flex';
    dialogSigninSection.style.display = 'flex';

    // 清空 input 欄位
    document.getElementById("signup-name").value = '';
    document.getElementById("signup-email").value = '';
});

// 登入時，「關閉」按鈕的點擊事件
closeSigninButton.addEventListener('click', function () {
    dialogSection.style.display = 'none';
    dialogSigninSection.style.display = 'none';

    // 清空成功或錯誤訊息的對話框
    dialogSigninMessage.innerText = '';
    dialogSignupMessage.innerText = '';

    // 清空 input 欄位
    document.getElementById("signin-email").value = '';
    document.getElementById("signin-password").value = '';
});

// 「註冊」按鈕的點擊事件
dialogSignupPrompt.addEventListener('click', function () {
    // 關閉登入對話框，開啟註冊對話框
    dialogSection.style.display = 'flex';
    dialogSigninSection.style.display = 'none';
    dialogSignupSection.style.display = 'flex';

    // 清空 input 欄位
    document.getElementById("signin-email").value = '';
    document.getElementById("signin-password").value = '';

    // 清空成功或錯誤訊息的對話框
    dialogSigninMessage.innerText = '';
    dialogSignupMessage.innerText = '';
});

// 註冊時，「關閉」按鈕的點擊事件
closeSignupButton.addEventListener('click', function () {
    dialogSection.style.display = 'none';
    dialogSignupSection.style.display = 'none';

    // 清空成功或錯誤訊息的對話框
    dialogSigninMessage.innerText = '';
    dialogSignupMessage.innerText = '';
})

// 註冊時，「登入」按鈕的點擊事件
dialogSigninPrompt.addEventListener('click', function () {
    // 關閉註冊對話框
    dialogSignupSection.style.display = 'none';
    dialogSignupSection.style.display = 'none';

    // 清空成功或錯誤訊息的對話框，關閉訊息對話框
    dialogSignupMessage.innerText = '';
    dialogSignupMessage.style.display = 'none';

    // 清空 input 欄位
    document.getElementById("signup-name").value = '';
    document.getElementById("signup-email").value = '';
    document.getElementById("signup-password").value = '';

    // 開啟登入對話框
    dialogSection.style.display = 'flex';
    dialogSigninSection.style.display = 'flex';
});

// 註冊系統
// 點擊「註冊」時，檢查是否有未輸入的資訊若有，阻止表單送出
document.getElementById("signup-submit").addEventListener("click", function (event) {
    event.preventDefault();

    // 取得使用者輸入的資訊
    let name = document.getElementById("signup-name").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;

    // 檢查是否有未輸入的資訊
    if (name == "" || email == "" || password == "") {
        dialogSignupMessage.style.display = 'flex';
        dialogSignupMessage.innerText = '請輸入完整資訊';
        return;
    }

    if (password.length < 8) {
        dialogSignupMessage.style.display = 'flex';
        dialogSignupMessage.innerText = '密碼長度至少 8 個字元';
        return;
    }

    if (email.indexOf('@') == -1) {
        dialogSignupMessage.style.display = 'flex';
        dialogSignupMessage.innerText = '請輸入正確的 email 格式';
        return;
    }

    // 建立要傳送給伺服器的資料
    let signupData = {
        name: name,
        email: email,
        password: password
    };

    // 發送 POST 請求至註冊功能端點
    fetch('/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(signupData)
    })
        .then(response => response.json())
        .then(result => {
            if (result.ok) {
                // 註冊成功，dialogMessage 顯示文字訊息「註冊成功」
                dialogSignupMessage.style.display = 'flex';
                dialogSignupMessage.innerText = '註冊成功';
            } else {
                // 註冊失敗，dialogMessage 顯示文字訊息「註冊失敗」
                dialogSignupMessage.style.display = 'flex';
                // dialogSignupMessage.innerText = '註冊失敗';
                // 從後端接收 error 訊息，並顯示在畫面上
                let error = result.message || '註冊失敗';
                dialogSignupMessage.innerText = error;
            }
        })
        .catch(error => {
            console.error("Error:", error);
        });
});

// 登入系統
// 點擊「登入」時，檢查是否有未輸入的資訊若有，阻止表單送出
document.getElementById("signin-submit").addEventListener("click", function (event) {
    event.preventDefault();

    // 檢查使用者是否已登入，若已登入，阻止表單送出
    if (localStorage.getItem('token')) {
        return;
    }

    // 取得使用者輸入的資訊
    let email = document.getElementById("signin-email").value;
    let password = document.getElementById("signin-password").value;

    // 檢查是否有未輸入的資訊
    if (email == "" || password == "") {
        dialogSigninMessage.style.display = 'flex';
        dialogSigninMessage.innerText = '請輸入完整資訊';
        return;
    }

    // 建立要傳送給伺服器的資料
    let signinData = {
        email: email,
        password: password
    };

    // 發送 PUT 請求至登入功能端點
    fetch('/api/user/auth', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(signinData)
    })
        .then(response => response.json())
        .then(result => {
            // 如果成功，將 token 存入 localStorage
            if (result.token) {
                // 將 token 存入 localStorage
                localStorage.setItem('token', result.token);

                // 登入成功，dialogSigninMessage 顯示文字訊息「登入成功」
                dialogSigninMessage.style.display = 'flex';
                dialogSigninMessage.innerText = '登入成功';

                // 檢查使用者是否已登入，若已登入，隱藏登入按鈕，顯示登出按鈕
                if (localStorage.getItem('token')) {
                    signinButton.style.display = 'none';
                    signoutButton.style.display = 'flex';
                }

                // 重新載入相同頁面，讓頁面反應最新的狀態
                location.reload();
            } else {
                // 登入失敗，dialogSigninMessage 顯示文字訊息「登入失敗」
                dialogSigninMessage.style.display = 'flex';
                dialogSigninMessage.innerText = '登入失敗';
            }
        })
        .catch(error => {
            console.error("Error:", error);
            dialogSigninMessage.style.display = 'flex';
            dialogSigninMessage.innerText = '系統異常，請稍後再試。';
        });
});

// 點擊「登出」按鈕時，清空 localStorage，重新載入頁面
signoutButton.addEventListener('click', function () {
    // 清空 localStorage
    localStorage.clear();

    // 檢查當前頁面的路徑
    if (window.location.pathname === '/booking') {
        // 如果在 /booking 的頁面，重定向到首頁
        window.location.href = '/';
    } else {
        // 在其他頁面，只需重新載入當前頁面或進行其他操作
        location.reload();
    }
});

// 點擊「預約行程」按鈕時，頁面跳轉到 booking.html
bookingButton.addEventListener('click', function () {
    // 如果使用者未登入，跳出登入視窗
    if (!localStorage.getItem('token')) {
        dialogSection.style.display = 'flex';
        dialogSigninSection.style.display = 'flex';
        return;
    } else {
        window.location.href = '/booking';
    }
});

// 點擊「歷史訂單」按鈕時，頁面跳轉到 historical.html
historicalOrderButton.addEventListener('click', function () {
    window.location.href = '/historical';
});

