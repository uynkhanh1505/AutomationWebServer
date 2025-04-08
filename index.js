// Khai báo các biến toàn cục
let currentStep = 0;
let remainingTime = 0;
let isPaused = false;
let processInterval = null;
let isRobotArmRunning = false;
let startBtn;
let stopBtn;
let pauseBtn;
let statusProgress;
let quantityProgress;
let conveyors;
let startFade;
let startBeat;
let startFlip;
let startPulse;
let startFade2;
let sensors;
let isLoggedIn = false;
let targetQuantity = 0;
let currentQuantity = 0;
let quantityInterval = null;
let currentStepJar1 = 0;
let currentStepJar2 = -1; // Hũ 2 bắt đầu chậm hơn hũ 1
let currentQuantityJar1 = 0;
let currentQuantityJar2 = 0;
let quantityIntervalJar1 = null;
let quantityIntervalJar2 = null;
let statusJar1, statusJar2, quantityProgressJar1, quantityProgressJar2;

// Định nghĩa các hàm toàn cục
function showInputModal() {
    const inputModal = document.getElementById("inputModal");
    if (inputModal) {
        inputModal.style.display = "flex";
    } else {
        console.error("Không tìm thấy inputModal");
    }
}

function hideInputModal() {
    const inputModal = document.getElementById("inputModal");
    if (inputModal) {
        inputModal.style.display = "none";
    } else {
        console.error("Không tìm thấy inputModal");
    }
}

// Cập nhật stopProcess
function stopProcess() {
    if (processInterval) clearTimeout(processInterval);
    if (quantityIntervalJar1) clearInterval(quantityIntervalJar1);
    if (quantityIntervalJar2) clearInterval(quantityIntervalJar2);
    sensors.forEach(sensor => sensor && sensor.classList.remove('on'));
    conveyors.forEach(conveyor => conveyor.style.animationPlayState = 'paused');
    isRobotArmRunning = false;
    statusJar1.textContent = 'Đã dừng';
    statusJar2.textContent = 'Đã dừng';
    quantityProgressJar1.textContent = 'Khối lượng hũ 1: 0 gram (0%)';
    quantityProgressJar2.textContent = 'Khối lượng hũ 2: 0 gram (0%)';
    currentQuantityJar1 = 0;
    currentQuantityJar2 = 0;
    currentStepJar1 = 0;
    currentStepJar2 = -1;
    remainingTime = 0;
    isPaused = false;
    startBtn.textContent = 'Bắt đầu';
}

// Hàm cập nhật khối lượng cho từng hũ
function updateQuantityProgress(jarNumber) {
    const current = jarNumber === 1 ? currentQuantityJar1 : currentQuantityJar2;
    const quantityProgress = jarNumber === 1 ? quantityProgressJar1 : quantityProgressJar2;
    const interval = jarNumber === 1 ? quantityIntervalJar1 : quantityIntervalJar2;

    if (targetQuantity <= 0) {
        quantityProgress.textContent = `Khối lượng hũ ${jarNumber}: 0 gram (0%)`;
        clearInterval(interval);
        return;
    }

    if (current < targetQuantity) {
        const increment = Math.random() * 1.2 + 3;
        const newQuantity = Math.min(current + increment, targetQuantity);
        const percentage = Math.round((newQuantity / targetQuantity) * 100);
        quantityProgress.textContent = `Khối lượng hũ ${jarNumber}: ${newQuantity.toFixed(1)} gram (${percentage}%)`;
        if (jarNumber === 1) currentQuantityJar1 = newQuantity;
        else currentQuantityJar2 = newQuantity;

        // Khi đạt 100%, sau 2 giây chuyển sang bước tiếp theo
        if (newQuantity >= targetQuantity) {
            clearInterval(interval); // Dừng tăng khối lượng
            quantityProgress.textContent = `Khối lượng hũ ${jarNumber}: ${targetQuantity} gram (100%)`;
            setTimeout(() => {
                const nextStep = jarNumber === 1 ? currentStepJar1 + 0.5 : currentStepJar2 + 0.5;
                if (jarNumber === 1) currentStepJar1 = nextStep;
                else currentStepJar2 = nextStep;
                runStep(jarNumber, nextStep, 5000); // Chuyển sang bước tiếp theo sau 2 giây
            }, 2000); // Chờ 2 giây
        }
    }
}

// Hàm bắt đầu tăng khối lượng cho từng hũ
function startQuantityProgress(jarNumber) {
    const quantityProgress = jarNumber === 1 ? quantityProgressJar1 : quantityProgressJar2;
    if (jarNumber === 1) {
        currentQuantityJar1 = 0;
        quantityIntervalJar1 = setInterval(() => updateQuantityProgress(1), 100);
    } else {
        currentQuantityJar2 = 0;
        quantityIntervalJar2 = setInterval(() => updateQuantityProgress(2), 100);
    }
    quantityProgress.textContent = `Khối lượng hũ ${jarNumber}: 0 gram (0%)`;
}

// Hàm chạy bước cho từng hũ
function runStep(jarNumber, step, time) {
    const status = jarNumber === 1 ? statusJar1 : statusJar2;

    if (step === 0) {
        sensors[0].classList.add('on');
        status.textContent = 'Đang chiết hạt';
        conveyors[0].style.animationPlayState = 'paused';
        startBeat.classList.add('fa-beat');
        startFade.classList.add('fa-fade');
        startQuantityProgress(jarNumber);
    } else if (step === 0.5) {
        sensors[0].classList.remove('on');
        status.textContent = 'Di chuyển hũ từ 1 sang 2';
        conveyors[0].style.animationPlayState = 'running';
        startBeat.classList.remove('fa-beat');
        startFade.classList.remove('fa-fade');
        // Reset animation để đảm bảo chạy lại từ đầu
        conveyors[0].style.animation = 'none';
        setTimeout(() => conveyors[0].style.animation = 'moveConveyor 9s linear infinite', 10);
    } else if (step === 1) {
        status.textContent = 'Đang đóng nắp';
        conveyors[0].style.animationPlayState = 'paused';
        conveyors[0].classList.add('centered');
        conveyors[1].style.animationPlayState = 'paused';
        clearInterval(jarNumber === 1 ? quantityIntervalJar1 : quantityIntervalJar2);
        (jarNumber === 1 ? quantityProgressJar1 : quantityProgressJar2).textContent = `Khối lượng hũ ${jarNumber}: ${targetQuantity} gram (100%)`;

        startPulse.classList.add('fa-spin-pulse');
        setTimeout(() => {
            sensors[1].classList.add('on');
            setTimeout(() => {
                startPulse.classList.remove('fa-spin-removed-pulse');
                sensors[2].classList.add('on');
                startFlip.classList.add('fa-flip');
                setTimeout(() => {
                    startPulse.classList.add('fa-spin-pulse');
                    startFlip.classList.remove('fa-flip');
                    sensors[2].classList.remove('on');
                    sensors[1].classList.remove('on');
                    setTimeout(() => {
                        if (jarNumber === 1) currentStepJar1 = 1.5;
                        else currentStepJar2 = 1.5;
                        runStep(jarNumber, 1.5, 2500);
                    }, 500);
                }, 2000);
            }, 2000);
        }, 2000);
        return;
    } else if (step === 1.5) {
        startPulse.classList.remove('fa-spin-pulse');
        status.textContent = 'Di chuyển hũ từ 2 sang 3';
        conveyors[1].style.animationPlayState = 'running';
        conveyors[1].style.animation = 'none';
        setTimeout(() => conveyors[1].style.animation = 'moveConveyorDown 9s linear infinite', 10);
    } else if (step === 2) {
        sensors[4].classList.add('on');
        status.textContent = 'Đang gắp hũ';
        conveyors[1].style.animationPlayState = 'paused';
        conveyors[1].classList.add('centered');
        conveyors[2].style.animationPlayState = 'paused';
        isRobotArmRunning = true;
    } else if (step === 2.5) {
        sensors[4].classList.remove('on');
        status.textContent = 'Di chuyển hũ từ 3 sang 4';
        conveyors[2].style.animationPlayState = 'running';
        conveyors[2].style.animation = 'none';
        setTimeout(() => conveyors[2].style.animation = 'moveConveyorLeft 9s linear infinite', 10);
        isRobotArmRunning = false;
    } else if (step === 3) {
        sensors[3].classList.add('on');
        status.textContent = 'Đang đóng hộp';
        conveyors[2].style.animationPlayState = 'paused';
        conveyors[2].classList.add('centered');
        startFade2.classList.add('fa-fade');
    } else if (step === 4) {
        sensors[3].classList.remove('on');
        status.textContent = 'Hoàn tất';
        startFade2.classList.remove('fa-fade');
        conveyors[2].style.animationPlayState = 'paused';
        return;
    }

    if (time > 0 && step !== 1) {
        processInterval = setTimeout(() => {
            if (!isPaused) {
                const nextStep = step === 0 ? 0.5 : step === 0.5 ? 1 : step === 1.5 ? 2 : step === 2 ? 2.5 : step === 2.5 ? 3 : step + 1;
                if (jarNumber === 1) currentStepJar1 = nextStep;
                else currentStepJar2 = nextStep;
                // Tăng thời gian cho các bước trung gian từ 2500ms lên 5000ms
                runStep(jarNumber, nextStep, nextStep === 0.5 || nextStep === 1.5 || nextStep === 2.5 ? 5000 : 5000);

                // Kích hoạt hũ 2 khi hũ 1 hoàn thành bước 0
                if (jarNumber === 1 && step === 0 && currentStepJar2 === -1) {
                    currentStepJar2 = 0;
                    runStep(2, 0, 10000);
                }
            }
        }, time);
    }
}

// Cập nhật startProcessWithQuantity
function startProcessWithQuantity(quantity) {
    stopProcess();
    targetQuantity = quantity; // Khối lượng chung cho cả hai hũ
    currentStepJar1 = 0;
    currentStepJar2 = -1; // Hũ 2 chưa bắt đầu
    remainingTime = 10000;
    startBtn.textContent = "Bắt đầu";
    isPaused = false;
    runStep(1, currentStepJar1, remainingTime);
}

function handleInput(event) {
    if (!event) {
        console.error("Event không được truyền vào handleInput");
        return;
    }
    event.preventDefault();
    const quantityInput = document.getElementById("quantity");
    if (!quantityInput) {
        console.error("Không tìm thấy input quantity");
        return;
    }
    const quantity = parseFloat(quantityInput.value);
    console.log("Giá trị nhập từ input:", quantity);
    if (!isNaN(quantity) && quantity > 0) {
        hideInputModal();
        startProcessWithQuantity(quantity);
    } else {
        alert("Vui lòng nhập khối lượng hợp lệ.");
        console.error("Giá trị quantity không hợp lệ:", quantity);
    }
}

// Cập nhật pauseProcess và resumeProcess
function pauseProcess() {
    if (!isPaused && (currentStepJar1 < 4 || currentStepJar2 < 4)) {
        if (processInterval) clearTimeout(processInterval);
        if (quantityIntervalJar1) clearInterval(quantityIntervalJar1);
        if (quantityIntervalJar2) clearInterval(quantityIntervalJar2);
        conveyors.forEach(conveyor => conveyor.style.animationPlayState = 'paused');
        isRobotArmRunning = false;
        statusJar1.textContent = 'Tạm dừng';
        statusJar2.textContent = 'Tạm dừng';
        remainingTime = processInterval ? Math.max(10000 - (Date.now() - processInterval._idleStart), 0) : 0;
        isPaused = true;
        startBtn.textContent = 'Tiếp tục';
    }
}

function resumeProcess() {
    if (isPaused) {
        isPaused = false;
        startBtn.textContent = 'Bắt đầu';
        if (currentStepJar1 === 0) startQuantityProgress(1);
        if (currentStepJar2 === 0) startQuantityProgress(2);
        runStep(1, currentStepJar1, remainingTime);
        if (currentStepJar2 >= 0) runStep(2, currentStepJar2, remainingTime);
    }
}

function handleLogin(event) {
    if (!event) {
        console.error("Event không được truyền vào handleLogin");
        return;
    }
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "admin") {
        isLoggedIn = true;
        document.getElementById("loginModal").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
    } else {
        alert("Invalid username or password");
    }
}

function logout() {
    isLoggedIn = false;
    targetQuantity = 0; // Reset targetQuantity khi đăng xuất
    document.getElementById("mainContent").style.display = "none";
    document.getElementById("loginModal").style.display = "flex";
}

document.addEventListener('DOMContentLoaded', function () {
    if (isLoggedIn) {
        document.getElementById("loginModal").style.display = "none";
        document.getElementById("mainContent").style.display = "block";
    } else {
        document.getElementById("loginModal").style.display = "flex";
        document.getElementById("mainContent").style.display = "none";
    }

    const canvas = document.getElementById('robotArm');
    startBtn = document.getElementById('startBtn');
    stopBtn = document.getElementById('stopBtn');
    pauseBtn = document.getElementById('pauseBtn');
    statusProgress = document.querySelector('.statusProgress p');
    quantityProgress = document.getElementById('quantityProgress');
    conveyors = document.querySelectorAll('.conveyor-items, .conveyor-items-down, .conveyor-items-left');
    startFade = document.getElementById('fade');
    startBeat = document.getElementById('beat');
    startFlip = document.getElementById('flip');
    startPulse = document.getElementById('pulse');
    startFade2 = document.getElementById('fade2');
    statusJar1 = document.getElementById('statusJar1');
    statusJar2 = document.getElementById('statusJar2');
    quantityProgressJar1 = document.getElementById('quantityProgressJar1');
    quantityProgressJar2 = document.getElementById('quantityProgressJar2');
    sensors = [
        document.querySelector('.block-1 .sensor .status'),
        document.querySelector('.block-2 .sensor:nth-of-type(1) .status'),
        document.querySelector('.block-2 .sensor:nth-of-type(2) .status'),
        document.querySelector('.block-3 .sensor .status'),
        document.querySelector('.block-4 .sensor .status')
    ];

    if (!quantityProgress) {
        console.error("Không tìm thấy phần tử quantityProgress");
    } else {
        console.log("quantityProgress được tìm thấy:", quantityProgress);
    }

    sensors.forEach(sensor => sensor.classList.remove('on'));
    conveyors.forEach(conveyor => conveyor.style.animationPlayState = 'paused');

    startBtn.addEventListener('click', function () {
        console.log("Nút Bắt đầu được nhấn, nội dung nút:", startBtn.textContent);
        if (startBtn.textContent === 'Bắt đầu') {
            showInputModal();
        } else if (startBtn.textContent === 'Tiếp tục') {
            resumeProcess();
        }
    });

    stopBtn.addEventListener('click', stopProcess);
    pauseBtn.addEventListener('click', pauseProcess);

    const inputForm = document.querySelector('#inputModal form');
    if (inputForm) {
        inputForm.addEventListener('submit', handleInput);
    } else {
        console.error("Không tìm thấy form trong inputModal");
    }

    if (canvas) {
        const ctx = canvas.getContext('2d');
        let armAngle = 0;
        let armSpeed = 0.01;
        let armDirection = 1;

        function drawRobotGripper() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const centerX = canvas.width / 2;
            const baseY = 5;
            const gripperHeight = 70;
            const gripperWidth = 70;

            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;

            const topHeight = gripperHeight * 0.35;
            const topWidth = gripperWidth * 0.2;
            ctx.beginPath();
            ctx.roundRect(centerX - topWidth / 2, baseY, topWidth, topHeight, 3);
            ctx.fill();

            const middleHeight = gripperHeight * 0.3;
            const middleWidth = gripperWidth * 0.6;
            ctx.beginPath();
            ctx.roundRect(centerX - middleWidth / 2, baseY + topHeight, middleWidth, middleHeight, 3);
            ctx.fill();

            const circleRadius = middleWidth * 0.25;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(centerX, baseY + topHeight + middleHeight / 2, circleRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();

            const armHeight = gripperHeight * 0.35;
            const armWidth = gripperWidth * 0.15;
            const armCurve = 10;
            const maxAngle = 0.3;

            armAngle += armSpeed * armDirection;
            if (armAngle > maxAngle) {
                armAngle = maxAngle;
                armDirection = -1;
            } else if (armAngle < 0) {
                armAngle = 0;
                armDirection = 1;
            }

            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(centerX - middleWidth / 2, baseY + topHeight + middleHeight);
            ctx.lineTo(centerX - middleWidth / 2, baseY + topHeight + middleHeight + armHeight - armCurve);
            ctx.quadraticCurveTo(
                centerX - middleWidth / 2 - armAngle * 10, baseY + topHeight + middleHeight + armHeight,
                centerX - middleWidth / 2 + armWidth + armAngle * 10, baseY + topHeight + middleHeight + armHeight
            );
            ctx.lineTo(centerX - middleWidth / 2 + armWidth, baseY + topHeight + middleHeight);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(centerX + middleWidth / 2, baseY + topHeight + middleHeight);
            ctx.lineTo(centerX + middleWidth / 2, baseY + topHeight + middleHeight + armHeight - armCurve);
            ctx.quadraticCurveTo(
                centerX + middleWidth / 2 + armAngle * 10, baseY + topHeight + middleHeight + armHeight,
                centerX + middleWidth / 2 - armWidth - armAngle * 10, baseY + topHeight + middleHeight + armHeight
            );
            ctx.lineTo(centerX + middleWidth / 2 - armWidth, baseY + topHeight + middleHeight);
            ctx.closePath();
            ctx.fill();
        }

        function animate() {
            drawRobotGripper();
            requestAnimationFrame(animate);
        }

        animate();
    } else {
        console.error('Không tìm thấy phần tử canvas với id "robotArm"');
    }
});
