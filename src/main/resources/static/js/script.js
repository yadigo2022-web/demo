window.onload = async function(){
    // ==========================
    // Canvas
    // ==========================
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const floorInput = document.getElementById("floor");
    const floorParameters = document.getElementById("floorParameters");

    // Canvas描画
    function draw(n,x) {
        ctx.clearRect(0,0,canvas.width,canvas.height);

        const margin = 2;
        const floorHeight = 80;
        const radius = 15;
        const buildingHeight =
            Math.max((n + 0.2) * floorHeight, 1 * floorHeight);
        const scale =
            (canvas.height - margin * 2 - radius * 2)
            / buildingHeight;
        const h = floorHeight * scale;

        // 質点のY座標
        function getY(i){
            return canvas.height
                - margin
                - radius
                - (i + 1) * h;
        }

        // 地盤位置
        const yGround = getY(0) + h;

        // 柱（階間）
        for(let i = 0; i < n - 1; i++){
            ctx.beginPath();
            ctx.moveTo(
                x[i + 1],
                getY(i)
            );
            ctx.lineTo(
                x[i + 2],
                getY(i + 1)
            );

            ctx.stroke();

        }

        // 質点
        for(let i = 0; i < n; i++){

            ctx.beginPath();

            ctx.arc(
                x[i + 1],
                getY(i),
                radius * scale,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // ==========================
        // 地盤から1階質点まで
        // ==========================

        ctx.beginPath();

        ctx.moveTo(
            x[0],
            yGround
        );

        ctx.lineTo(
            x[1],
            getY(0)
        );

        ctx.stroke();


        // ==========================
        // 地盤線
        // ==========================

        ctx.beginPath();

        ctx.moveTo(
            x[0] - 15 * scale,
            yGround
        );

        ctx.lineTo(
            x[0] + 15 * scale,
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


    // ② 解析
    page2.onclick=function(){

        hidePages();

        sec2.style.display="flex";

    };


    // ③ 結果
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

    function setupModal(buttonId, modalId, closeId){

        const button = document.getElementById(buttonId);
        const modal = document.getElementById(modalId);
        const close = document.getElementById(closeId);


        if(button && modal){

            button.onclick = function(){

                modal.style.display = "block";

            };

        }


        if(close && modal){

            close.onclick = function(){

                modal.style.display = "none";

            };

        }

    }


    // このサイトについて
    setupModal(
        "about",
        "aboutModal",
        "aboutClose"
    );


    // 使い方
    setupModal(
        "manual",
        "manualModal",
        "manualClose"
    );

    const helpButton = document.getElementById("help");
    const helpModal = document.getElementById("helpModal");
    const helpClose = document.getElementById("helpClose");


    helpButton.addEventListener("click", function(){

        helpModal.style.display="block";

    });


    helpClose.addEventListener("click", function(){

        helpModal.style.display="none";

    });

    // ==========================
    // 階数
    // ==========================

    const floor = document.getElementById("floor");

    for(let i = 1; i <= 60; i++){
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        floor.appendChild(option);
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

            data.push([
                Number(cols[0]),
                Number(cols[1])
            ]);

        }



        dt = data[10][0] - data[9][0];
        console.log(data);

    }


    select.addEventListener("change", async function () {

        await loadCsv(this.value);

    });


    select.value = "El Centro";

    await loadCsv("El Centro");




    // ==========================
// 現在の質量・剛性を保存
// ==========================

    let savedMass = [];
    let savedStiffness = [];


// ==========================
// 階数に応じて入力欄を作成
// ==========================

    function createFloorInputs() {

        // ==========================
        // 現在の入力値を保存
        // ==========================

        document.querySelectorAll(".massInput").forEach((input, i) => {
            savedMass[i] = input.value;
        });

        document.querySelectorAll(".stiffnessInput").forEach((input, i) => {
            savedStiffness[i] = input.value;
        });


        // ==========================
        // 階数が空欄なら何もしない
        // ==========================

        if (floorInput.value === "") {
            return;
        }


        const n = Number(floorInput.value);


        if (n <= 0) {
            return;
        }


        // ==========================
        // 入力欄を作り直す
        // ==========================

        floorParameters.innerHTML = "";


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
            { length: n },
            (_, i) => `<div>${i + 1}F</div>`
        ).join("")}

        </div>

    `;


        // ==========================
// 質量
// ==========================

        floorParameters.innerHTML += `

    <div class="parameterRow">

        <div class="floorLabel">
            質量<br>(ton)
        </div>

        ${Array.from(
            { length: n },
            (_, i) => `
                <select
                    class="massInput"
                    id="mass${i + 1}">
                    ${[400, 800, 1200, 1600, 2000]
                .map(value => `
                            <option
                                value="${value}"
                                ${Number(savedMass[i] ?? 1000) === value ? "selected" : ""}>
                                ${value}
                            </option>
                        `).join("")}
                </select>
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
            剛性<br>(kN/mm)
        </div>

        ${Array.from(
            { length: n },
            (_, i) => `
                <select
                    class="stiffnessInput"
                    id="stiffness${i + 1}">
                    ${Array.from(
                { length: 14 },
                (_, j) => {
                    const value = 150 * (j + 1);

                    return `
                                <option
                                    value="${value}"
                                    ${Number(savedStiffness[i] ?? 150) === value ? "selected" : ""}>
                                    ${value}
                                </option>
                            `;
                }
            ).join("")}
                </select>
            `
        ).join("")}

    </div>

`;


        // ==========================
        // Canvas更新
        // ==========================

        const x = new Array(n + 1)
            .fill(canvas.width / 2);

        draw(n, x);

    }


// ==========================
// 階数からカーソルが外れたら
// 入力欄とCanvasをまとめて更新
// ==========================

    floorInput.addEventListener(
        "blur",
        createFloorInputs
    );


// ==========================
// 初期表示
// ==========================

    floorInput.value = 1;

    createFloorInputs();


// ==========================
// 解析結果
// ==========================

    let totalDispData = [];




    // ==========================
    // 解析
    // ==========================
    const unlockButton = document.getElementById("unlock");

    if (unlockButton) {

        unlockButton.addEventListener("click", async function () {
            unlock.disabled = true;
            unlock.textContent = "🔓︎";
            page3.disabled = true;
            const targets = document.querySelectorAll(
                "#floor, #damping, #floorParameters, #inputSeismicWave, #start"
            );
            targets.forEach(el => {
                el.disabled = false;

            });
            document.querySelectorAll(".massInput, .stiffnessInput").forEach(input => {
                input.disabled = false;
            });

            const storys = Number(floorInput.value);
            const x = new Array(storys + 1)
                .fill(canvas.width / 2);


            draw(storys,x);

            // 時間を最初に戻す
            t = 0;

            // プログレスバーを0へ
            progress.value = 0;

            // 時間表示を更新
            const totalTime = ((totalDispData.length - 1) * dt).toFixed(2);
            timeText.textContent = `0.00 / ${totalTime} 秒`;

            // 変位倍率
            dipscale.value = 1;
            displacementScale = 1;
            dipscaleText.textContent = "倍率：1倍";

            // 再生ボタン表示を戻す
            lookButton.innerHTML = "▷";

        });
    }


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
                    csvText: csvText,
                    data: data,
                    dt: dt
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
            page3.disabled = false;
            const targets = document.querySelectorAll(
                "#floor, #damping, #floorParameters, #inputSeismicWave, #start"
            );
            targets.forEach(el => {
                 el.disabled = true;

            });
            document.querySelectorAll(".massInput, .stiffnessInput").forEach(input => {
                input.disabled = true;
            });
            unlock.disabled = false;
            unlock.textContent = "🔒︎";


        });

    }

    // ==========================
    // 解析結果を見る（再生・一時停止）
    // ==========================

    let t = 0;
    let playing = false;
    let timer = null;
    let displacementScale = 1;

    const lookButton = document.getElementById("look");
    const progress = document.getElementById("progress");
    const timeText = document.getElementById("timeText");
    const dipscale = document.getElementById("dipscale");
    const dipscaleText = document.getElementById("dipscaleText");

    dipscale.addEventListener("input", function(){

        displacementScale = Number(this.value);

        dipscaleText.textContent = `倍率：${displacementScale}倍`;

    });




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




            const x = [canvas.width / 2];


            for(let i=0; i<totalDispData[t].length; i++){


                x.push(
                    canvas.width / 2 + totalDispData[t][i] * displacementScale
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







