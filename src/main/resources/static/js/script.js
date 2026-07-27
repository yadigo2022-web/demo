window.onload = async function(){


    // ==========================
    // Canvas
    // ==========================
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // 入力欄を取得
    const floorInput = document.getElementById("floor");
    const floorParameters = document.getElementById("floorParameters");

    // ==========================
    // Canvas描画
    // ==========================

    function draw(n,x) {

        ctx.clearRect(0,0,canvas.width,canvas.height);


        // ==========================
        // 自動縮尺
        // ==========================

        const margin = 50;
        const floorHeight = 80;


        const buildingHeight =
            Math.max(n * floorHeight, floorHeight);


        const scale =
            (canvas.height - margin * 2)
            / buildingHeight;


        const h =
            floorHeight * scale;


        // 地盤位置
        const yGround =
            canvas.height - margin;



        function getY(i){
            return yGround - (i+1)*h;
        }



        // ==========================
        // 柱（階間）
        // ==========================

        for(let i=0;i<n;i++){

            ctx.beginPath();

            ctx.moveTo(
                x[i+1],   // 1階以上
                getY(i)
            );

            ctx.lineTo(
                x[i+2],
                getY(i+1)
            );

            ctx.stroke();

        }



        // ==========================
        // 質点
        // ==========================

        for(let i=0;i<n;i++){

            ctx.beginPath();

            ctx.arc(
                x[i+1],   // 1階質点はx[2]
                getY(i),
                15*scale,
                0,
                Math.PI*2
            );

            ctx.fill();

        }



        // ==========================
        // 地盤から1階質点まで
        // ==========================

        ctx.beginPath();

        ctx.moveTo(
            x[1],
            getY(0)+15*scale
        );

        ctx.lineTo(
            x[0],
            yGround
        );

        ctx.stroke();



        // ==========================
        // 地盤線
        // ==========================

        ctx.beginPath();

        ctx.moveTo(
            x[0]-40,
            yGround
        );

        ctx.lineTo(
            x[0]+40,
            yGround
        );

        ctx.stroke();

    }




    // ==========================
    // ページ切替
    // ==========================

    const page1 = document.getElementById("page1");
    const page2 = document.getElementById("page2");
    const page3 = document.getElementById("page3");


    const inputPage = document.getElementById("toc3");
    const sec2 = document.getElementById("sec2");
    const sec3 = document.getElementById("sec3");


    const pages = [
        inputPage,
        sec2,
        sec3
    ];


// 非表示関数
    function hidePages(){

        pages.forEach(page => {

            page.style.display = "none";

        });

    }


// ① 諸元
    page1.onclick=function(){

        hidePages();

        inputPage.style.display="flex";

    };


// ② 地震波
    page2.onclick=function(){

        hidePages();

        sec2.style.display="flex";

    };


// ③ 解析
    page3.onclick=function(){

        hidePages();

        sec3.style.display="flex";

    };

    const buttons = document.querySelectorAll(
        "#page1,#page2,#page3"
    );


    buttons.forEach(button => {

        button.addEventListener("click", function(){

            // 全部解除
            buttons.forEach(btn=>{
                btn.classList.remove("active");
            });


            // 押したボタンだけ追加
            this.classList.add("active");

        });

    });



    // ==========================
    // メニュー
    // ==========================

    const menuButton = document.getElementById("menuButton");
    const menu = document.getElementById("menu");


    if(menuButton && menu){

        menuButton.onclick=function(){

            menu.classList.toggle("show");

        };

    }
    // ==========================
    // このサイトについて
    // ==========================

    const about = document.getElementById("about");
    const aboutModal = document.getElementById("aboutModal");
    const aboutClose = document.getElementById("aboutClose");


    if(about && aboutModal){

        about.onclick=function(){

            aboutModal.style.display="block";

        };

    }


    if(aboutClose && aboutModal){

        aboutClose.onclick=function(){

            aboutModal.style.display="none";

        };

    }


    // ==========================
    // CSV読込
    // ==========================

    let data = [];
    let csvText = "";
    let dt = 0.00;


    const select = document.getElementById("inputSeismicWave");


    async function loadCsv(earthquake) {

        let fileName = "";

        switch (earthquake) {

            case "El Centro":
                fileName = "El_centro_NS.csv";
                break;

            case "Taft":
                fileName = "Taft_N021E.csv";
                break;

            case "Hachinohe":
                fileName = "Hachinohe_NS.csv";
                break;

        }


        const response = await fetch("/csv/" + fileName);

        console.log(fileName);

        csvText = await response.text();

        const rows = csvText.trim().split("\n");

        data = [];

        for (let i = 1; i < rows.length; i++) {

            const cols = rows[i].split(",");

            data.push({
                time: Number(cols[0]),
                acc: Number(cols[1])
            });

        }



        dt = data[10].time - data[9].time;
        console.log(dt);

    }


    select.addEventListener("change", async function () {

        await loadCsv(this.value);

    });


    select.value = "El Centro";

    await loadCsv("El Centro");




    // ==========================
    // 階数に応じて入力欄を作成
    // ==========================

    if (floorInput && floorParameters) {

        floorInput.addEventListener("input", function () {

            const n = Number(this.value);

            floorParameters.innerHTML = "";

            if (n <= 0) return;


            // CSSに階数を渡す
            floorParameters.style.setProperty(
                "--floor",
                n
            );


            // ==========================
            // 階数表示
            // ==========================

            floorParameters.innerHTML += `

            <div class="parameterHeader">

                <div></div>

                ${Array.from(
                {length:n},
                (_,i)=>`<div>${i+1}F</div>`
            ).join("")}

            </div>

        `;



            // ==========================
            // 質量
            // ==========================

            floorParameters.innerHTML += `

            <div class="parameterRow">

                <div class="floorLabel">
                    質量
                </div>

                ${Array.from(
                {length:n},
                (_,i)=>
                    `
                    <input
                        class="massInput"
                        type="number"
                        id="mass${i+1}"
                        value="1000">
                    `
            ).join("")}

            </div>

        `;



            // ==========================
            // 剛性
            // ==========================

            floorParameters.innerHTML += `

            <div class="parameterRow">

                <div class="floorLabel">
                    剛性
                </div>

                ${Array.from(
                {length:n},
                (_,i)=>
                    `
                    <input
                        class="stiffnessInput"
                        type="number"
                        id="stiffness${i+1}"
                        value="40">
                    `
            ).join("")}

            </div>

        `;



            // ==========================
            // Canvas更新
            // ==========================

            const storys = Number(floorInput.value);

            const x = new Array(storys + 1)
                .fill(350);


            draw(storys,x);

        });

    }
    let totalDispData = [];

    // ==========================
    // Javaへデータ送信
    // ==========================

    const startButton = document.getElementById("start");

    if (startButton) {

        startButton.addEventListener("click", async function () {
            document.getElementById("errorOk").addEventListener("click",function(){

                document.getElementById("errorModal").style.display = "none";

            });


            const n = Number(floorInput.value);
            const damping = Number(document.getElementById("damping").value);

            let errorMessage = "";

            // 階数
            const floorValue = floorInput.value.trim();

            if (floorValue === "") {
                errorMessage += "・階数を入力してください。<br>";
            } else if (Number(floorValue) <= 0) {
                errorMessage += "・階数は1以上を入力してください。<br>";
            }

            // 減衰比
            const dampingValue = document.getElementById("damping").value.trim();

            if (dampingValue === "") {
                errorMessage += "・減衰比を入力してください。<br>";
            } else if (Number(dampingValue) < 0) {
                errorMessage += "・減衰比は0以上を入力してください。<br>";
            }

            for (let i = 1; i <= n; i++) {

                const massValue = document.getElementById(`mass${i}`).value.trim();
                const stiffnessValue = document.getElementById(`stiffness${i}`).value.trim();

                // 質量
                if (massValue === "") {

                    errorMessage += `・${i}階の質量を入力してください。<br>`;

                } else if (Number(massValue) <= 0) {

                    errorMessage += `・${i}階の質量は0より大きい値を入力してください。<br>`;

                }

                // 剛性
                if (stiffnessValue === "") {

                    errorMessage += `・${i}階の剛性を入力してください。<br>`;

                } else if (Number(stiffnessValue) <= 0) {

                    errorMessage += `・${i}階の剛性は0より大きい値を入力してください。<br>`;

                }
            }

            if (errorMessage !== "") {
                showError(errorMessage);
                return;
            }


            const mass = [];
            const stiffness = [];

            for (let i = 1; i <= n; i++) {
                mass.push(Number(document.getElementById(`mass${i}`).value));
                stiffness.push(Number(document.getElementById(`stiffness${i}`).value));
            }

            const select = document.getElementById("inputSeismicWave");

            let earthquake = "";
            let csvText = "";
            let fileName = "";


            earthquake = select.value;

            csvText = select.value;
            document.getElementById("loading2").style.display = "flex";


            const response = await fetch("/analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    damping: damping,
                    mass: mass,
                    stiffness: stiffness,
                    earthquake: earthquake,
                    fileName: fileName,
                    csvText: csvText
                })
            });
            const result = await response.json();


            console.log(result.totalDispData);
            totalDispData = result.totalDispData

            document.getElementById("loading2").style.display = "none";
            document.getElementById("loading2").style.display = "none";

            document.getElementById("complete").style.display = "flex";
            document.getElementById("okButton").addEventListener("click", function () {

                document.getElementById("complete").style.display = "none";

            });


        });

    }
    // ==========================
    // 解析結果を見る（再生・一時停止）
    // ==========================

    let t = 0;





    let playing = false;
    let timer = null;

    const lookButton = document.getElementById("look");
    const progress = document.getElementById("progress");
    const timeText = document.getElementById("timeText");


// 無効化する対象
    const lockTargets = [
        document.querySelector(".pageButton"),
        document.getElementById("toc3"),
        document.getElementById("sec2"),
        document.getElementById("analysisSection")
    ];


// ロック
    function lockScreen(){

        lockTargets.forEach(el=>{

            if(el){
                el.classList.add("disabled");
            }

        });

    }


    // 解除
    function unlockScreen(){

        lockTargets.forEach(el=>{

            if(el){
                el.classList.remove("disabled");
            }

        });

    }



    lookButton.addEventListener("click", function () {


        const storys = Number(floorInput.value);



        // ==========================
        // 一時停止
        // ==========================

        if(playing){


            playing = false;


            clearTimeout(timer);


            lookButton.innerHTML = "▷";


            // 操作解除
            unlockScreen();


            return;

        }



        // ==========================
        // 再生開始
        // ==========================

        playing = true;


        lookButton.innerHTML = "Ⅱ";


        // 操作制限
        lockScreen();




        function animate(){


            if(!playing){

                return;

            }



            // 終了

            if(t >= totalDispData.length){


                playing = false;


                lookButton.innerHTML = "⟲";


                t = 0;






                unlockScreen();


                return;

            }




            const x = [350];


            for(let i=0; i<totalDispData[t].length; i++){


                x.push(
                    350 + totalDispData[t][i] * 2
                );

            }



            draw(storys,x);
            // バー更新
            progress.value = t / (totalDispData.length - 1) * 100;

            // 時間表示
            const currentTime = (t * dt).toFixed(2);
            const totalTime = ((totalDispData.length - 1) * dt).toFixed(2);

            timeText.textContent = `${currentTime} / ${totalTime} 秒`;

            t++;

            timer = setTimeout(animate,16);


        }



        animate();


    });
    progress.addEventListener("input", function () {

        t = Math.round(
            this.value / 100 * (totalDispData.length - 1)
        );

        // 時間表示を更新
        const currentTime = (t * dt).toFixed(2);
        const totalTime = ((totalDispData.length - 1) * dt).toFixed(2);

        timeText.textContent = `${currentTime} / ${totalTime} 秒`;

    });






    const modal = document.getElementById("modal");



};



function showError(message){

    document.getElementById("errorText").innerHTML = message;

    document.getElementById("errorModal").style.display = "block";

}







