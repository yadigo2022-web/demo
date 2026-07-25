window.onload = function () {


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

        // 画面を消す
        ctx.clearRect(0, 0, canvas.width, canvas.height);



        //==========================
        // 縦線を描く
        //==========================
        for (let i = 0; i < n - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(x[i+1], 350 - i * 80);
            ctx.lineTo(x[i+2], 350 - (i + 1) * 80);
            ctx.stroke();
        }

        //==========================
        // 質点を描く
        //==========================

        for (let i = 0; i < n; i++) {
            ctx.beginPath();
            ctx.arc(x[i+1], 350 - i * 80, 15, 0, Math.PI * 2);
            ctx.fill();
        }

        // 一番下の質点のy座標
        const yBase = 390 ;

        // 縦線
        ctx.beginPath();
        ctx.moveTo(x[1], yBase - 40);
        ctx.lineTo(x[0], yBase);
        ctx.stroke();

        // 横線
        ctx.beginPath();
        ctx.moveTo(x[0]-30, yBase);
        ctx.lineTo(x[0]+30, yBase);
        ctx.stroke();
    }

    // ボタンを押したら描画
    //document.getElementById("start").addEventListener("click", draw);

    // ==========================
    // ヘッダー
    // ==========================
    const btn = document.getElementById("menuBtn");
    const panel = document.getElementById("panel");

    btn.onclick = function(){

        panel.classList.toggle("show");

    }

    // ==========================
    // サイドバー
    // ==========================

    const menuButton = document.getElementById("menuButton");
    const closeButton = document.getElementById("closeButton");
    const sidebar = document.getElementById("sidebar");

    if (menuButton && sidebar) {
        menuButton.addEventListener("click", function () {
            sidebar.classList.add("open");
        });
    }

    if (closeButton && sidebar) {
        closeButton.addEventListener("click", function () {
            sidebar.classList.remove("open");
        });
    }

    // ==========================
    // チェックボックス
    // ==========================

    const checkbox = document.getElementById("lock");
    const select = document.getElementById("input seismic wave");
    const label = document.getElementById("earthquakeLabel");
    const csvFile = document.getElementById("csvFile");

    if (checkbox && select && label && csvFile) {

        // 初期状態
        select.disabled = false;
        csvFile.disabled = true;
        label.style.color = "#000";

        checkbox.addEventListener("change", function () {

            // 地震波選択
            select.disabled = checkbox.checked;
            label.style.color = checkbox.checked ? "#999" : "#000";

            // CSVファイル選択
            csvFile.disabled = !checkbox.checked;

        });

    }



    // ==========================
    // CSV読込
    // ==========================

    const fileInput = document.getElementById("csvFile");
    const loadButton = document.getElementById("loadCsv");

    if (loadButton && fileInput) {

        loadButton.addEventListener("click", function () {

            const file = fileInput.files[0];

            if (!file) {
                alert("CSVファイルを選択してください。");
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {

                const csv = e.target.result;

                const rows = csv.trim().split("\n");

                const data = [];

                for (let i = 1; i < rows.length; i++) {

                    const cols = rows[i].split(",");

                    data.push({
                        time: Number(cols[0]),
                        acc: Number(cols[1])
                    });

                }

                console.log(data);

            };

            reader.readAsText(file);

        });

    }

    // ==========================
    // 階数に応じて入力欄を作成
    // ==========================

    if (floorInput && floorParameters) {

        floorInput.addEventListener("input", function () {

            const n = Number(this.value);

            floorParameters.innerHTML = "";

            if (n <= 0) return;

            // 見出し
            floorParameters.innerHTML = `
                <div class="parameterHeader">
                    <div></div>
                    <div>質量 M (ton)</div>
                    <div>剛性 K (kN/mm)</div>
                </div>
            `;

            // 入力欄
            for (let i = 1; i <= n; i++) {

                floorParameters.innerHTML += `
                    <div class="parameterRow">

                        <div class="floorLabel">${i}F</div>

                        <input
                            class="massInput"
                            type="number"
                            id="mass${i}"
                            value="1000">

                        <input
                            class="stiffnessInput"
                            type="number"
                            id="stiffness${i}"
                            value="40">

                    </div>
                `;
            }

            // 階数を取得
            const storys = Number(floorInput.value);
            const x = new Array(storys+1).fill(350);

            // ★ Canvasを更新
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

            const checkbox = document.getElementById("lock");
            const select = document.getElementById("input seismic wave");
            const fileInput = document.getElementById("csvFile");

            let earthquake = "";
            let csvText = "";
            let fileName = "";

            if (checkbox.checked) {

                const file = fileInput.files[0];

                if (!file) {
                    alert("CSVファイルを選択してください。");
                    return;
                }

                fileName = file.name;
                csvText = await file.text();

            } else {

                earthquake = select.value;

            }
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
    // 解析結果を見る
    // ==========================


    //const lookButton = document.getElementById("look");
    //document.getElementById("look").addEventListener("click", async function () {
    document.getElementById("look").addEventListener("click", function () {

        const storys = Number(floorInput.value);

        let t = 0;

        function animate() {

            if (t >= totalDispData.length) {
                return;
            }

            // x座標を作る
            const x = [350];

            for (let i = 0; i < totalDispData[t].length; i++) {
                x.push(350 + totalDispData[t][i] * 2);
            }

            draw(storys, x);

            t++;

            setTimeout(animate, 16);   // 約60fps
        }

        animate();

    });






    const modal = document.getElementById("modal");



    document.getElementById("helpButton1").addEventListener("click", function () {

        modal.style.display = "block";

    });

    document.getElementById("helpButton2").addEventListener("click", function () {

        modal.style.display = "block";

    });

    document.getElementById("close").addEventListener("click", function () {

        modal.style.display = "none";

    });















};


function downloadCsv() {

    const fileName = document.getElementById("fileName").value;

    if (fileName.trim() === "") {
        alert("ファイル名を入力してください");
        return;
    }

    window.location.href =
        "/downloadCsv?name=" + encodeURIComponent(fileName);
}

function showError(message){

    document.getElementById("errorText").innerHTML = message;

    document.getElementById("errorModal").style.display = "block";

}







