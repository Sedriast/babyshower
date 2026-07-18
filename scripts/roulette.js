let gifts = [];
let isSpinning = false;

const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

function initRoulette() {
    fetch('data/gifts.json')
        .then(function (res) { return res.json(); })
        .then(function (data) {
            gifts = data;
            drawRoulette();
        });

    document.getElementById('confirm-btn').addEventListener('click', openRoulette);
    document.getElementById('spin-btn').addEventListener('click', spinRoulette);
    document.getElementById('result-close').addEventListener('click', closeResult);

    window.addEventListener('animationComplete', function () {
        document.getElementById('confirm-section').classList.add('visible');
    });
}

function openRoulette() {
    document.getElementById('confirm-section').classList.remove('visible');
    document.getElementById('roulette-screen').classList.add('visible');
    drawRoulette();
}

function drawRoulette() {
    const canvas = document.getElementById('roulette-canvas');
    const size = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6);
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = (canvas.width / 2) - 10;
    const sliceAngle = (2 * Math.PI) / gifts.length;

    for (let i = 0; i < gifts.length; i++) {
        const startAngle = i * sliceAngle - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = COLORS[i % COLORS.length];
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#333';
        ctx.font = 'bold ' + (size / 18) + 'px sans-serif';
        ctx.fillText(gifts[i].emoji, radius * 0.65, -2);
        ctx.font = (size / 26) + 'px sans-serif';
        ctx.fillText(gifts[i].name, radius * 0.65, size / 20);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function spinRoulette() {
    if (isSpinning || gifts.length === 0) return;
    isSpinning = true;

    var spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;

    var canvas = document.getElementById('roulette-canvas');
    var totalRotation = (3 + Math.random() * 3) * 2 * Math.PI;
    var winnerIndex = Math.floor(Math.random() * gifts.length);
    var sliceAngle = (2 * Math.PI) / gifts.length;
    var targetAngle = totalRotation + (2 * Math.PI - winnerIndex * sliceAngle - sliceAngle / 2);

    var startTime = null;
    var duration = 4000;
    var startRotation = 0;

    function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        var elapsed = timestamp - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var currentAngle = startRotation + targetAngle * eased;

        canvas.style.transform = 'rotate(' + currentAngle + 'rad)';

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            isSpinning = false;
            spinBtn.disabled = false;
            showResult(gifts[winnerIndex]);
        }
    }

    requestAnimationFrame(animate);
}

function showResult(gift) {
    document.getElementById('result-emoji').textContent = gift.emoji;
    document.getElementById('result-text').textContent = gift.name;
    document.getElementById('roulette-result').classList.add('visible');
    document.getElementById('result-saved').textContent = '';
    saveGift(gift);
}

function closeResult() {
    document.getElementById('roulette-result').classList.remove('visible');
}

function saveGift(gift) {
    if (!window.currentUser) return;

    db.collection('users').doc(window.currentUser.uid).set({
        gift: { id: gift.id, name: gift.name, emoji: gift.emoji },
        confirmedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).then(function () {
        document.getElementById('result-saved').textContent = 'Guardado correctamente';
    }).catch(function () {
        document.getElementById('result-saved').textContent = 'Error al guardar';
    });
}

window.addEventListener('DOMContentLoaded', initRoulette);
