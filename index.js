function turnOn() {
    fetch('http://192.168.1.100/cgi-bin/write?address=Y0&value=1')
        .then(response => response.text())
        .then(data => {
            console.log(data);
            document.getElementById("status").innerText = "Bật";
        });
}

function turnOff() {
    fetch('http://192.168.1.100/cgi-bin/write?address=Y0&value=0')
        .then(response => response.text())
        .then(data => {
            console.log(data);
            document.getElementById("status").innerText = "Tắt";
        });
}

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;
    if(b){var d=b.createElement('script');
        d.innerHTML="window.__CF$cv$params={r:'9235b4494b261867',t:'MTc0MjQ3ODg5NS4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};
        document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();



// Lấy tham chiếu đến canvas và context
document.addEventListener('DOMContentLoaded', function () {
const canvas = document.getElementById('robotArm');

// Trạng thái ban đầu: tất cả cảm biến tắt
const sensors = document.querySelectorAll('.sensor .status');
sensors.forEach(sensor => sensor.classList.remove('on'));

// Trạng thái ban đầu: dừng tất cả animation
const conveyors = document.querySelectorAll('.conveyor-items, .conveyor-items-down, .conveyor-items-left');
conveyors.forEach(conveyor => conveyor.style.animationPlayState = 'paused');

// Dừng animation của tay robot (block 4) ban đầu
let isRobotArmRunning = false;
let armAnimationFrame;


// vẽ tay
if (canvas) {
    const ctx = canvas.getContext('2d');

    // Biến để điều khiển chuyển động tay gắp
    let armAngle = 0; // Góc mở của tay gắp
    let armSpeed = 0.01; // Tốc độ chuyển động (radian mỗi khung hình)
    let armDirection = 1; // Hướng chuyển động (1: mở, -1: đóng)

    // Hàm vẽ biểu tượng robot gắp
    function drawRobotGripper() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sử dụng toàn bộ kích thước canvas 80x80px
        const centerX = canvas.width / 2; // 40px (giữa 80px)
        const baseY = 5; // Điểm bắt đầu từ trên xuống (cách đỉnh 5px)
        const gripperHeight = 70; // Chiều cao tổng = 70px
        const gripperWidth = 70; // Chiều rộng tổng = 70px

        // Thiết lập màu và độ dày
        ctx.fillStyle = '#000'; // Màu đen cho robot
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;

        // 1. Vẽ phần thân trên (hình chữ nhật nhỏ với đầu bo tròn)
        const topHeight = gripperHeight * 0.35; // 15% chiều cao
        const topWidth = gripperWidth * 0.2; // 20% chiều rộng
        ctx.beginPath();
        ctx.roundRect(centerX - topWidth / 2, baseY, topWidth, topHeight, 3);
        ctx.fill();

        // 2. Vẽ phần thân giữa (hình chữ nhật lớn hơn)
        const middleHeight = gripperHeight * 0.3; // 30% chiều cao
        const middleWidth = gripperWidth * 0.6; // 60% chiều rộng
        ctx.beginPath();
        ctx.roundRect(centerX - middleWidth / 2, baseY + topHeight, middleWidth, middleHeight, 3);
        ctx.fill();

        // 3. Vẽ vòng tròn trắng ở giữa (camera/cảm biến)
        const circleRadius = middleWidth * 0.25; // Bán kính vòng tròn
        ctx.fillStyle = '#fff'; // Màu trắng
        ctx.beginPath();
        ctx.arc(centerX, baseY + topHeight + middleHeight / 2, circleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke(); // Viền đen cho vòng tròn

        // 4. Vẽ hai tay gắp (hình chữ nhật cong, với chuyển động)
        const armHeight = gripperHeight * 0.35; // 55% chiều cao
        const armWidth = gripperWidth * 0.15; // 15% chiều rộng mỗi tay
        const armCurve = 10; // Độ cong của tay
        const maxAngle = 0.3; // Góc mở tối đa (radian)

        // Cập nhật góc tay gắp
        armAngle += armSpeed * armDirection;
        if (armAngle > maxAngle) {
            armAngle = maxAngle;
            armDirection = -1; // Đổi hướng: đóng tay gắp
        } else if (armAngle < 0) {
            armAngle = 0;
            armDirection = 1; // Đổi hướng: mở tay gắp
        }

        // Tay trái
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.moveTo(centerX - middleWidth / 2, baseY + topHeight + middleHeight); // Điểm bắt đầu tay trái
        ctx.lineTo(centerX - middleWidth / 2, baseY + topHeight + middleHeight + armHeight - armCurve);
        ctx.quadraticCurveTo(
            centerX - middleWidth / 2 - armAngle * 10, baseY + topHeight + middleHeight + armHeight, // Điểm điều khiển (thay đổi theo góc)
            centerX - middleWidth / 2 + armWidth + armAngle * 10, baseY + topHeight + middleHeight + armHeight // Điểm kết thúc (thay đổi theo góc)
        );
        ctx.lineTo(centerX - middleWidth / 2 + armWidth, baseY + topHeight + middleHeight);
        ctx.closePath();
        ctx.fill();

        // Tay phải
        ctx.beginPath();
        ctx.moveTo(centerX + middleWidth / 2, baseY + topHeight + middleHeight); // Điểm bắt đầu tay phải
        ctx.lineTo(centerX + middleWidth / 2, baseY + topHeight + middleHeight + armHeight - armCurve);
        ctx.quadraticCurveTo(
            centerX + middleWidth / 2 + armAngle * 10, baseY + topHeight + middleHeight + armHeight, // Điểm điều khiển (thay đổi theo góc)
            centerX + middleWidth / 2 - armWidth - armAngle * 10, baseY + topHeight + middleHeight + armHeight // Điểm kết thúc (thay đổi theo góc)
        );
        ctx.lineTo(centerX + middleWidth / 2 - armWidth, baseY + topHeight + middleHeight);
        ctx.closePath();
        ctx.fill();
    }

    // Hàm animate để vẽ lại liên tục
    function animate() {
        drawRobotGripper();
        requestAnimationFrame(animate);
    }


    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const sensors = document.querySelectorAll('.sensor .status');
    sensors.forEach(sensor => sensor.classList.remove('on'));
    const statusProgress = document.querySelector('.statusProgress p');
    const conveyors = document.querySelectorAll('.conveyor-items, .conveyor-items-down, .conveyor-items-left');
    const startFade = document.getElementById('fade');
    const startBeat = document.getElementById('beat');
    const startFlip = document.getElementById('flip');
    const startPulse = document.getElementById('pulse')
    const startFade2 = document.getElementById('fade2');
    let isRobotArmRunning = false;
    let processInterval;
    let currentStep = 0; // Theo dõi bước hiện tại
    let remainingTime = 0; // Thời gian còn lại của bước hiện tại
    let isPaused = false; // Trạng thái tạm dừng

    // Hàm chạy bước cụ thể với thời gian còn lại
    function runStep(step, time) {
        if (step === 0) {
            sensors[0].classList.add('on');
            statusProgress.textContent = 'Đang chiết hạt';
            conveyors[0].style.animationPlayState = 'running';
            startBeat.classList.add('fa-beat');
            startFade.classList.add('fa-fade');
        } else if (step === 1) {
            sensors[0].classList.remove('on');
            sensors[1].classList.add('on');
            sensors[2].classList.add('on');
            statusProgress.textContent = 'Đang đóng nắp';
            conveyors[0].style.animationPlayState = 'paused';
            conveyors[1].style.animationPlayState = 'running';
            startBeat.classList.remove('fa-beat');
            startFade.classList.remove('fa-fade');
            startFlip.classList.add('fa-flip');
            startPulse.classList.add('fa-spin-pulse');
        } else if (step === 2) {
            sensors[1].classList.remove('on');
            sensors[2].classList.remove('on');
            sensors[3].classList.add('on');
            startFlip.classList.remove('fa-flip');
            startPulse.classList.remove('fa-spin-pulse');
            statusProgress.textContent = 'Đang gắp hũ';
            conveyors[1].style.animationPlayState = 'paused';
            conveyors[2].style.animationPlayState = 'running';
            isRobotArmRunning = true;
        } else if (step === 3) {
            sensors[3].classList.remove('on');
            sensors[4].classList.add('on');
            statusProgress.textContent = 'Đang đóng hộp';
            startFade2.classList.add('fa-fade') 
            isRobotArmRunning = false;
        } else if (step === 4) {
            sensors[4].classList.remove('on');
            sensors[5].classList.add('on');
            startFade2.classList.remove('fa-fade')
            statusProgress.textContent = 'Hoàn tất';
            conveyors[2].style.animationPlayState = 'paused';
            return; // Kết thúc tiến trình
        }   

        if (time > 0) {
            processInterval = setTimeout(() => {
                if (!isPaused) {
                    currentStep++;
                    runStep(currentStep, 5000);
                }
            }, time);
        }
    }

    // Hàm khởi động quá trình từ đầu
    function startProcess() {
        stopProcess();
        currentStep = 0;
        remainingTime = 5000;
        startBtn.textContent = 'Bắt đầu'; // Đặt lại nhãn nút
        isPaused = false;
        runStep(currentStep, remainingTime);
    }

    // Hàm tiếp tục quá trình từ điểm dừng
    function resumeProcess() {
        if (isPaused) {
            isPaused = false;
            startBtn.textContent = 'Bắt đầu'; // Đặt lại nhãn nút sau khi tiếp tục
            runStep(currentStep, remainingTime); // Tiếp tục từ bước hiện tại với thời gian còn lại
        }
    }

    // Hàm dừng toàn bộ quá trình
    function stopProcess() {
        clearTimeout(processInterval);
        sensors.forEach(sensor => sensor.classList.remove('on'));
        conveyors.forEach(conveyor => conveyor.style.animationPlayState = 'paused');
        isRobotArmRunning = false;
        statusProgress.textContent = 'Đã dừng';
        currentStep = 0;
        remainingTime = 0;
        isPaused = false;
        startBtn.textContent = 'Bắt đầu'; // Đặt lại nhãn nút
    }

    // Hàm tạm dừng
    function pauseProcess() {
        if (!isPaused && currentStep < 4) { // Chỉ tạm dừng nếu chưa hoàn tất
            clearTimeout(processInterval);
            conveyors.forEach(conveyor => conveyor.style.animationPlayState = 'paused');
            isRobotArmRunning = false;
            statusProgress.textContent = 'Tạm dừng';

            // Tính thời gian còn lại của bước hiện tại
            const elapsedTime = Date.now() - (processInterval._idleStart || Date.now());
            remainingTime = Math.max(10000 - elapsedTime, 0);

            isPaused = true;
            startBtn.textContent = 'Tiếp tục'; // Đổi nút thành "Tiếp tục"
        }
    }

    // Gán sự kiện cho các nút
    startBtn.addEventListener('click', function () {
        if (startBtn.textContent === 'Bắt đầu') {
            startProcess();
        } else if (startBtn.textContent === 'Tiếp tục') {
            resumeProcess();
        }
    });
    stopBtn.addEventListener('click', stopProcess);
    pauseBtn.addEventListener('click', pauseProcess);


    


    // Bắt đầu animation
    animate();
} else {
    console.error('Không tìm thấy phần tử canvas với id "robotArm"');
}
});
 
// Login


   // // Check if user is "logged in" (using localStorage for this example)
        // if (localStorage.getItem("isLoggedIn") === "true") {
        //     document.getElementById("loginModal").style.display = "none";
        //     document.getElementById("mainContent").style.display = "block";
        // }

        // Use a session variable instead of localStorage (won't persist across refreshes)
        let isLoggedIn = false;

        // On page load, always show login modal unless just logged in
        document.getElementById("loginModal").style.display = "flex";
        document.getElementById("mainContent").style.display = "none";

        function handleLogin(event) {
            event.preventDefault();
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Simple fake authentication (replace with real logic)
            if (username === "admin" && password === "admin") { // Example credentials
                // localStorage.setItem("isLoggedIn", "true"); // Mark as logged in
                isLoggedIn = true; // Set session variable
                document.getElementById("loginModal").style.display = "none";
                document.getElementById("mainContent").style.display = "block";
            } else {
                alert("Invalid username or password");
            }
        }

        // Optional: Logout function (if you want to add a logout button)
        function logout() {
            // localStorage.removeItem("isLoggedIn");
            isLoggedIn = false; // Reset session variable
            document.getElementById("mainContent").style.display = "none";
            document.getElementById("loginModal").style.display = "flex"; // Show login modal again
        }
