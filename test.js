let next_page = test();

function test() {
    return fetch(url)
        .then(res => res.json())
        .then(data => { data.nextPage })
}

test().then(next_page => {
    console.log(next_page);
});