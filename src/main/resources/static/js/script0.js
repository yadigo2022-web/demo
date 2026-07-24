window.addEventListener("load", function () {

    // 最低2秒表示
    setTimeout(function () {
        document.getElementById("loading").style.display = "none";
    }, 300);

});

const button = document.getElementById("menuButton");
const menu = document.getElementById("menu");

button.addEventListener("click", function(){

    menu.classList.toggle("open");

    if(menu.classList.contains("open")){
        button.textContent = "✕";
    }else{
        button.textContent = "☰";
    }

});

