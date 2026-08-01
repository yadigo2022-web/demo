window.onload = async function () {

    // =========================================================
    // 要素取得
    // =========================================================

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const floorInput = document.getElementById("floor");
    const dampingInput = document.getElementById("damping");
    const floorParameters = document.getElementById("floorParameters");

    const parameterPageButton =
        document.getElementById("parameterPageButton");

    const analysisPageButton =
        document.getElementById("analysisPageButton");

    const resultPageButton =
        document.getElementById("resultPageButton");

    const parameterSection =
        document.getElementById("parameterSection");

    const analysisSection =
        document.getElementById("analysisSection");

    const resultArea =
        document.getElementById("resultArea");

    const inputSeismicWave =
        document.getElementById("inputSeismicWave");

    const startButton =
        document.getElementById("startButton");

    const unlockButton =
        document.getElementById("unlockButton");

    const playButton =
        document.getElementById("playButton");

    const progressBar =
        document.getElementById("progressBar");

    const timeText =
        document.getElementById("timeText");

    const displacementScale =
        document.getElementById("displacementScale");

    const displacementScaleText =
        document.getElementById("displacementScaleText");

    const completeModal =
        document.getElementById("completeModal");

    const completeOkButton =
        document.getElementById("completeOkButton");

    const errorModal =
        document.getElementById("errorModal");

    const errorText =
        document.getElementById("errorText");

    const errorOkButton =
        document.getElementById("errorOkButton");

    const loadingModal =
        document.getElementById("loadingModal");


    // =========================================================
    // 解析データ
    // =========================================================

    let data = [];
    let csvText = "";
    let dt = 0;

    let totalDispData = [];


    // =========================================================
    // 結果再生用
    // =========================================================

    let currentTimeIndex = 0;
    let playing = false;
    let timer = null;
    let displacementScaleValue = 1;


    // =========================================================
    // 質量・剛性の保存
    // =========================================================

    let savedMass = [];
    let savedStiffness = [];


    // =========================================================
    // Canvas描画
    // =========================================================

    function draw(floorCount, x) {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        const margin = 2;
        const floorHeight = 80;
        const radius = 15;


        const buildingHeight =
            Math.max(
                (floorCount + 0.2) * floorHeight,
                floorHeight
            );


        const scale =
            (canvas.height - margin * 2 - radius * 2)
            / buildingHeight;


        const h =
            floorHeight * scale;


        // -----------------------------------------
        // 質点のY座標
        // -----------------------------------------

        function getY(i) {

            return canvas.height
                - margin
                - radius
                - (i + 1) * h;

        }


        // -----------------------------------------
        // 地盤位置
        // -----------------------------------------

        const groundY =
            getY(0) + h;


        // -----------------------------------------
        // 柱
        // -----------------------------------------

        for (let i = 0; i < floorCount - 1; i++) {

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


        // -----------------------------------------
        // 質点
        // -----------------------------------------

        for (let i = 0; i < floorCount; i++) {

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


        // -----------------------------------------
        // 地盤から1階質点まで
        // -----------------------------------------

        ctx.beginPath();

        ctx.moveTo(
            x[0],
            groundY
        );

        ctx.lineTo(
            x[1],
            getY(0)
        );

        ctx.stroke();


        // -----------------------------------------
        // 地盤線
        // -----------------------------------------

        ctx.beginPath();

        ctx.moveTo(
            x[0] - 15 * scale,
            groundY
        );

        ctx.lineTo(
            x[0] + 15 * scale,
            groundY
        );

        ctx.stroke();

    }


    // =========================================================
    // ページ切替
    // =========================================================

    const pages = [
        parameterSection,
        analysisSection,
        resultArea
    ];


    function hidePages() {

        pages.forEach(page => {

            if (page) {
                page.style.display = "none";
            }

        });

    }


    function showPage(page) {

        hidePages();

        if (page) {
            page.style.display = "flex";
        }

    }


    function setActivePage(button) {

        const buttons = [
            parameterPageButton,
            analysisPageButton,
            resultPageButton
        ];

        buttons.forEach(btn => {

            if (btn) {
                btn.classList.remove("active");
            }

        });


        if (button) {
            button.classList.add("active");
        }

    }


    // パラメーター
    parameterPageButton.addEventListener(
        "click",
        function () {

            showPage(parameterSection);

            setActivePage(parameterPageButton);

        }
    );


    // 解析
    analysisPageButton.addEventListener(
        "click",
        function () {

            showPage(analysisSection);

            setActivePage(analysisPageButton);

        }
    );


    // 結果
    resultPageButton.addEventListener(
        "click",
        function () {

            if (resultPageButton.disabled) {
                return;
            }

            showPage(resultArea);

            setActivePage(resultPageButton);

        }
    );


    // 初期表示
    showPage(parameterSection);
    setActivePage(parameterPageButton);


    // =========================================================
    // メニュー
    // =========================================================

    const menuButton =
        document.getElementById("menuButton");

    const menu =
        document.getElementById("menu");


    if (menuButton && menu) {

        menuButton.addEventListener(
            "click",
            function () {

                menu.classList.toggle("show");

            }
        );

    }


    // =========================================================
    // モーダル共通処理
    // =========================================================

    function setupModal(
        buttonId,
        modalId,
        closeId
    ) {

        const button =
            document.getElementById(buttonId);

        const modal =
            document.getElementById(modalId);

        const close =
            document.getElementById(closeId);


        if (button && modal) {

            button.addEventListener(
                "click",
                function () {

                    modal.style.display = "block";

                }
            );

        }


        if (close && modal) {

            close.addEventListener(
                "click",
                function () {

                    modal.style.display = "none";

                }
            );

        }

    }


    setupModal(
        "manualButton",
        "manualModal",
        "manualClose"
    );


    setupModal(
        "helpButton",
        "helpModal",
        "helpClose"
    );


    setupModal(
        "aboutButton",
        "aboutModal",
        "aboutClose"
    );


    // =========================================================
    // エラー画面
    // =========================================================

    function showError(message) {

        errorText.innerHTML = message;

        errorModal.style.display = "block";

    }


    errorOkButton.addEventListener(
        "click",
        function () {

            errorModal.style.display = "none";

        }
    );


    // =========================================================
    // 完了画面
    // =========================================================

    completeOkButton.addEventListener(
        "click",
        function () {

            completeModal.style.display = "none";

        }
    );


    // =========================================================
    // 階数選択肢
    // =========================================================

    for (let i = 1; i <= 30; i++) {

        const option =
            document.createElement("option");

        option.value = i;
        option.textContent = i;

        floorInput.appendChild(option);

    }


    // =========================================================
    // 地震波CSV読み込み
    // =========================================================

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

            default:
                throw new Error(
                    "地震波が選択されていません。"
                );

        }


        const response =
            await fetch("/csv/" + fileName);


        if (!response.ok) {

            throw new Error(
                "地震波ファイルを読み込めませんでした。"
            );

        }


        csvText =
            await response.text();


        const rows =
            csvText
                .trim()
                .split(/\r?\n/);


        data = [];


        for (let i = 1; i < rows.length; i++) {

            const cols =
                rows[i].split(",");


            if (cols.length < 2) {
                continue;
            }


            data.push([
                Number(cols[0]),
                Number(cols[1])
            ]);

        }


        if (data.length < 2) {

            throw new Error(
                "地震波データが正しくありません。"
            );

        }


        dt =
            data[1][0] - data[0][0];




    }


    // 地震波変更時
    inputSeismicWave.addEventListener(
        "change",
        async function () {

            try {

                await loadCsv(
                    this.value
                );

            } catch (error) {

                console.error(error);

                showError(
                    "地震波の読み込みに失敗しました。"
                );

            }

        }
    );


    // 初期地震波
    inputSeismicWave.value =
        "El Centro";


    try {

        await loadCsv("El Centro");

    } catch (error) {

        console.error(error);

        showError(
            "初期地震波の読み込みに失敗しました。"
        );

    }


    // =========================================================
    // 階数に応じた入力欄作成
    // =========================================================

    function createFloorInputs() {

        // -----------------------------------------
        // 現在の入力値を保存
        // -----------------------------------------

        document
            .querySelectorAll(".massInput")
            .forEach((input, index) => {

                savedMass[index] =
                    input.value;

            });


        document
            .querySelectorAll(".stiffnessInput")
            .forEach((input, index) => {

                savedStiffness[index] =
                    input.value;

            });


        const floorCount =
            Number(floorInput.value);


        if (!Number.isInteger(floorCount) ||
            floorCount <= 0) {

            return;

        }


        // -----------------------------------------
        // 入力欄を削除
        // -----------------------------------------

        floorParameters.innerHTML = "";


        // CSSへ階数を渡す
        floorParameters.style.setProperty(
            "--floor",
            floorCount
        );


        // -----------------------------------------
        // 階数
        // -----------------------------------------

        const header =
            document.createElement("div");

        header.className =
            "parameterHeader";


        header.innerHTML =
            "<div></div>" +
            Array.from(
                { length: floorCount },
                (_, i) =>
                    `<div>${i + 1}F</div>`
).join("");


floorParameters.appendChild(header);


// -----------------------------------------
// 質量
// -----------------------------------------

const massRow =
    document.createElement("div");

massRow.className =
    "parameterRow";


let massHTML =
    `<div class="floorLabel">
                質量<br>(ton)
             </div>`;


for (let i = 0; i < floorCount; i++) {

    const currentValue =
        Number(
            savedMass[i] ?? 800
        );


    const massOptions =
        [400, 800, 1200, 1600, 2000]
            .map(value => {

                const selected =
                    currentValue === value
                        ? "selected"
                        : "";

                return `
                            <option
                                value="${value}"
                                ${selected}>
                                ${value}
                            </option>
                        `;

            })
            .join("");


    massHTML += `
                <select
                    class="massInput"
                    id="mass${i + 1}">
                    ${massOptions}
                </select>
            `;

}


massRow.innerHTML =
    massHTML;


floorParameters.appendChild(
    massRow
);


// -----------------------------------------
// 剛性
// -----------------------------------------

const stiffnessRow =
    document.createElement("div");

stiffnessRow.className =
    "parameterRow";


let stiffnessHTML =
    `<div class="floorLabel">
                剛性<br>(kN/mm)
             </div>`;


for (let i = 0; i < floorCount; i++) {

    const currentValue =
        Number(
            savedStiffness[i] ?? 150
        );


    const stiffnessOptions =
        Array.from(
            { length: 14 },
            (_, j) => 150 * (j + 1)
        )
            .map(value => {

                const selected =
                    currentValue === value
                        ? "selected"
                        : "";

                return `
                        <option
                            value="${value}"
                            ${selected}>
                            ${value}
                        </option>
                    `;

            })
            .join("");


    stiffnessHTML += `
                <select
                    class="stiffnessInput"
                    id="stiffness${i + 1}">
                    ${stiffnessOptions}
                </select>
            `;

}


stiffnessRow.innerHTML =
    stiffnessHTML;


floorParameters.appendChild(
    stiffnessRow
);


// -----------------------------------------
// Canvas更新
// -----------------------------------------

const x =
    new Array(floorCount + 1)
        .fill(canvas.width / 2);


draw(
    floorCount,
    x
);

}


// 階数変更後
floorInput.addEventListener(
    "change",
    createFloorInputs
);


// 階数からカーソルが外れた場合も更新
floorInput.addEventListener(
    "blur",
    createFloorInputs
);


// 初期階数
floorInput.value = 1;


createFloorInputs();


// =========================================================
// 入力ロック
// =========================================================

function setInputDisabled(disabled) {

    floorInput.disabled =
        disabled;

    dampingInput.disabled =
        disabled;

    inputSeismicWave.disabled =
        disabled;

    startButton.disabled =
        disabled;


    document
        .querySelectorAll(
            ".massInput, .stiffnessInput"
        )
        .forEach(input => {

            input.disabled =
                disabled;

        });

}


// =========================================================
// 解析開始
// =========================================================

startButton.addEventListener(
    "click",
    async function () {

        // -----------------------------------------
        // 入力チェック
        // -----------------------------------------

        const floorValue =
            floorInput.value.trim();


        const dampingValue =
            dampingInput.value.trim();


        let errorMessage = "";


        if (floorValue === "") {

            errorMessage +=
                "・階数を選択してください。<br>";

        }


        const floorCount =
            Number(floorValue);


        if (floorValue !== "" &&
            (!Number.isInteger(floorCount) ||
                floorCount <= 0)) {

            errorMessage +=
                "・階数は1以上を選択してください。<br>";

        }


        if (dampingValue === "") {

            errorMessage +=
                "・減衰定数を選択してください。<br>";

        }


        const damping =
            Number(dampingValue);


        if (dampingValue !== "" &&
            damping < 0) {

            errorMessage +=
                "・減衰定数は0以上を入力してください。<br>";

        }


        // -----------------------------------------
        // 質量・剛性チェック
        // -----------------------------------------

        for (
            let i = 1;
            i <= floorCount;
            i++
        ) {

            const massInput =
                document.getElementById(
                    `mass${i}`
                );


            const stiffnessInput =
                document.getElementById(
                    `stiffness${i}`
                );


            if (!massInput ||
                massInput.value.trim() === "") {

                errorMessage +=
                    `・${i}階の質量を選択してください。<br>`;

            } else if (
                Number(massInput.value) <= 0
            ) {

                errorMessage +=
                    `・${i}階の質量は0より大きい値を選択してください。<br>`;

            }


            if (!stiffnessInput ||
                stiffnessInput.value.trim() === "") {

                errorMessage +=
                    `・${i}階の剛性を選択してください。<br>`;

            } else if (
                Number(stiffnessInput.value) <= 0
            ) {

                errorMessage +=
                    `・${i}階の剛性は0より大きい値を選択してください。<br>`;

            }

        }


        if (errorMessage !== "") {

            showError(errorMessage);

            return;

        }


        // -----------------------------------------
        // 質量・剛性取得
        // -----------------------------------------

        const mass = [];
        const stiffness = [];


        for (
            let i = 1;
            i <= floorCount;
            i++
        ) {

            mass.push(
                Number(
                    document.getElementById(
                        `mass${i}`
                    ).value
                )
            );


            stiffness.push(
                Number(
                    document.getElementById(
                        `stiffness${i}`
                    ).value
                )
            );

        }


        // -----------------------------------------
        // 地震波
        // -----------------------------------------

        const earthquake =
            inputSeismicWave.value;


        // -----------------------------------------
        // ローディング表示
        // -----------------------------------------

        loadingModal.style.display =
            "flex";


        startButton.disabled =
            true;


        try {

            // -----------------------------------------
            // Javaへ送信
            // -----------------------------------------

            const response =
                await fetch(
                    "/analysis",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            damping: damping,

                            mass: mass,

                            stiffness: stiffness,

                            earthquake: earthquake,

                            fileName: "",

                            csvText: csvText,

                            data: data,

                            dt: dt

                        })

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "解析サーバーからエラーが返されました。"
                );

            }


            const result =
                await response.json();


            // -----------------------------------------
            // 解析結果取得
            // -----------------------------------------

            if (!result.totalDispData ||
                !Array.isArray(result.totalDispData)) {

                throw new Error(
                    "解析結果を取得できませんでした。"
                );

            }


            totalDispData =
                result.totalDispData;


            if (totalDispData.length === 0) {

                throw new Error(
                    "解析結果が空です。"
                );

            }


            // -----------------------------------------
            // 再生状態を初期化
            // -----------------------------------------

            currentTimeIndex = 0;

            progressBar.value = 0;

            updateTimeText();


            displacementScale.value = 1;

            displacementScaleValue = 1;

            displacementScaleText.textContent =
                "倍率：1倍";


            playButton.innerHTML =
                "▶";


            playing = false;


            if (timer !== null) {

                clearTimeout(timer);

                timer = null;

            }


            // -----------------------------------------
            // 入力をロック
            // -----------------------------------------

            setInputDisabled(true);


            unlockButton.disabled =
                false;

            unlockButton.textContent =
                "🔒";


            // 結果ボタンを有効化
            resultPageButton.disabled =
                false;


            // -----------------------------------------
            // 完了画面
            // -----------------------------------------

            completeModal.style.display =
                "flex";


        } catch (error) {

            console.error(
                "解析エラー:",
                error
            );


            showError(
                "解析中にエラーが発生しました。<br>" +
                error.message
            );


        } finally {

            // -----------------------------------------
            // ローディング終了
            // -----------------------------------------

            loadingModal.style.display =
                "none";


            // 解析に失敗した場合のみ
            // 開始ボタンを再び有効化
            if (totalDispData.length === 0) {

                startButton.disabled =
                    false;

            }

        }

    }
);


// =========================================================
// ロック解除
// =========================================================

unlockButton.addEventListener(
    "click",
    function () {

        // 再生停止
        stopPlayback();


        // 入力を解除
        setInputDisabled(false);


        // 結果ページを無効化
        resultPageButton.disabled =
            true;


        // ボタン表示
        unlockButton.disabled =
            true;

        unlockButton.textContent =
            "🔓";


        // 結果をリセット
        currentTimeIndex = 0;

        progressBar.value = 0;


        displacementScale.value =
            1;

        displacementScaleValue =
            1;

        displacementScaleText.textContent =
            "倍率：1倍";


        playButton.innerHTML =
            "▶";


        // 初期状態のCanvas
        const floorCount =
            Number(floorInput.value);


        const x =
            new Array(floorCount + 1)
                .fill(canvas.width / 2);


        draw(
            floorCount,
            x
        );


        updateTimeText();

    }
);


// =========================================================
// 結果再生時のロック
// =========================================================

const playbackLockTargets = [

    document.querySelector(".pageButton"),

    parameterSection,

    analysisSection

];


function lockPlayback() {

    playbackLockTargets.forEach(
        element => {

            if (element) {

                element.classList.add(
                    "disabled"
                );

            }

        }
    );

}


function unlockPlayback() {

    playbackLockTargets.forEach(
        element => {

            if (element) {

                element.classList.remove(
                    "disabled"
                );

            }

        }
    );

}


// =========================================================
// 変形倍率
// =========================================================

displacementScale.addEventListener(
    "input",
    function () {

        displacementScaleValue =
            Number(this.value);


        displacementScaleText.textContent =
            `倍率：${displacementScaleValue}倍`;

    }
);


// =========================================================
// 時間表示
// =========================================================

function updateTimeText() {

    if (
        !totalDispData ||
        totalDispData.length === 0
    ) {

        timeText.textContent =
            "0.00 / 0.00 秒";

        return;

    }


    const currentTime =
        (
            currentTimeIndex * dt
        ).toFixed(2);


    const totalTime =
        (
            (totalDispData.length - 1) * dt
        ).toFixed(2);


    timeText.textContent =
        `${currentTime} / ${totalTime} 秒`;

}


// =========================================================
// Canvasを結果データの位置に更新
// =========================================================

function drawResultFrame(index) {

    if (
        !totalDispData ||
        totalDispData.length === 0
    ) {

        return;

    }


    if (
        index < 0 ||
        index >= totalDispData.length
    ) {

        return;

    }


    const floorCount =
        Number(floorInput.value);


    const displacementData =
        totalDispData[index];


    const x = [
        canvas.width / 2
    ];


    for (
        let i = 0;
        i < floorCount;
        i++
    ) {

        const displacement =
            Number(
                displacementData[i] ?? 0
            );


        x.push(
            canvas.width / 2
            + displacement
            * displacementScaleValue
        );

    }


    draw(
        floorCount,
        x
    );

}


// =========================================================
// 再生停止
// =========================================================

function stopPlayback() {

    playing = false;


    if (timer !== null) {

        clearTimeout(timer);

        timer = null;

    }

}


// =========================================================
// 結果再生
// =========================================================

playButton.addEventListener(
    "click",
    function () {

        // -----------------------------------------
        // 解析結果がない場合
        // -----------------------------------------

        if (
            !totalDispData ||
            totalDispData.length === 0
        ) {

            showError(
                "まだ解析結果がありません。"
            );

            return;

        }


        // -----------------------------------------
        // 再生中なら一時停止
        // -----------------------------------------

        if (playing) {

            stopPlayback();

            playButton.innerHTML =
                "▶";

            unlockPlayback();

            return;

        }


        // -----------------------------------------
        // 最後まで再生した後なら最初から
        // -----------------------------------------

        if (
            currentTimeIndex >=
            totalDispData.length - 1
        ) {

            currentTimeIndex = 0;

        }


        // -----------------------------------------
        // 再生開始
        // -----------------------------------------

        playing = true;

        playButton.innerHTML =
            "Ⅱ";


        lockPlayback();


        function animate() {

            if (!playing) {

                return;

            }


            // -----------------------------------------
            // 最後
            // -----------------------------------------

            if (
                currentTimeIndex >=
                totalDispData.length
            ) {

                stopPlayback();

                playButton.innerHTML =
                    "⟲";

                currentTimeIndex = 0;

                progressBar.value = 0;

                updateTimeText();

                unlockPlayback();

                return;

            }


            // -----------------------------------------
            // Canvas更新
            // -----------------------------------------

            drawResultFrame(
                currentTimeIndex
            );


            // -----------------------------------------
            // プログレスバー
            // -----------------------------------------

            const maxIndex =
                totalDispData.length - 1;


            progressBar.value =
                maxIndex > 0
                    ? (
                        currentTimeIndex
                        / maxIndex
                        * 100
                    )
                    : 0;


            // -----------------------------------------
            // 時間
            // -----------------------------------------

            updateTimeText();


            // -----------------------------------------
            // 次のフレーム
            // -----------------------------------------

            currentTimeIndex++;


            timer =
                setTimeout(
                    animate,
                    16
                );

        }


        animate();

    }
);


// =========================================================
// プログレスバー操作
// =========================================================

progressBar.addEventListener(
    "input",
    function () {

        if (
            !totalDispData ||
            totalDispData.length === 0
        ) {

            return;

        }


        const maxIndex =
            totalDispData.length - 1;


        currentTimeIndex =
            Math.round(
                Number(this.value)
                / 100
                * maxIndex
            );


        drawResultFrame(
            currentTimeIndex
        );


        updateTimeText();

    }
);


// =========================================================
// 初期状態
// =========================================================

resultPageButton.disabled =
    true;

unlockButton.disabled =
    true;

progressBar.value =
    0;

displacementScale.value =
    1;

displacementScaleValue =
    1;

displacementScaleText.textContent =
    "倍率：1倍";

updateTimeText();

};











