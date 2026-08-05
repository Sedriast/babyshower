let gifts = [];
let slots = [];
let inventory = {};
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
            refreshRoulette();
        });

    document.getElementById('confirm-btn').addEventListener('click', openRoulette);
    document.getElementById('spin-btn').addEventListener('click', spinRoulette);

    window.addEventListener('animationComplete', function () {
        document.getElementById('confirm-section').classList.add('visible');
    });
}

function buildSlots() {
    slots = [];
    gifts.forEach(function (gift) {
        var remaining = inventory[gift.id] !== undefined ? inventory[gift.id] : gift.count;
        if (remaining < 0) remaining = 0;
        for (var i = 0; i < remaining; i++) {
            slots.push({ gift: gift });
        }
    });
}

function loadInventory() {
    var counts = {};
    return Promise.all(gifts.map(function (gift) {
        var ref = db.collection('giftInventory').doc(String(gift.id));
        return ref.get().then(function (doc) {
            if (doc.exists && typeof doc.data().remaining === 'number') {
                counts[gift.id] = doc.data().remaining;
            } else {
                return ref.set({ name: gift.name, remaining: gift.count }).then(function () {
                    counts[gift.id] = gift.count;
                });
            }
        }).catch(function () {
            counts[gift.id] = gift.count;
        });
    })).then(function () {
        inventory = counts;
    });
}

function refreshRoulette() {
    return loadInventory().then(function () {
        buildSlots();
        drawRoulette();
    });
}

function openRoulette() {
    document.getElementById('confirm-section').classList.remove('visible');
    document.getElementById('roulette-screen').classList.add('visible');
    refreshRoulette();
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
    const count = slots.length;
    const sliceAngle = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
        const startAngle = i * sliceAngle - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;
        const gift = slots[i].gift;

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
        ctx.fillText(gift.emoji, radius * 0.65, -2);
        ctx.font = (size / 26) + 'px sans-serif';
        ctx.fillText(gift.name, radius * 0.65, size / 20);
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
    if (isSpinning || slots.length === 0) return;
    isSpinning = true;

    var spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;

    var canvas = document.getElementById('roulette-canvas');
    var totalRotation = (3 + Math.random() * 3) * 2 * Math.PI;
    var winnerIndex = Math.floor(Math.random() * slots.length);
    var sliceAngle = (2 * Math.PI) / slots.length;
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
            showResult(slots[winnerIndex].gift);
        }
    }

    requestAnimationFrame(animate);
}

function showResult(gift) {
    saveGift(gift);
}

function saveGift(gift) {
    if (!window.currentUser) return;

    var userRef = db.collection('users').doc(window.currentUser.uid);
    var inventoryRef = db.collection('giftInventory').doc(String(gift.id));

    db.runTransaction(function (transaction) {
        return transaction.get(inventoryRef).then(function (doc) {
            var remaining = doc.exists && typeof doc.data().remaining === 'number' ? doc.data().remaining : gift.count;
            if (remaining <= 0) {
                throw { giftExhausted: true };
            }
            transaction.update(inventoryRef, { remaining: remaining - 1 });
            transaction.set(userRef, {
                displayName: window.currentUser.displayName,
                email: window.currentUser.email,
                gift: { id: gift.id, name: gift.name, emoji: gift.emoji },
                confirmedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            return { remaining: remaining - 1 };
        });
    }).then(function (result) {
        inventory[gift.id] = result.remaining;
        buildSlots();
        document.getElementById('roulette-screen').classList.remove('visible');
        document.getElementById('gift-emoji').textContent = gift.emoji;
        document.getElementById('gift-name').textContent = gift.name;
        document.getElementById('gift-screen').style.display = 'flex';
    }).catch(function (error) {
        if (error && error.giftExhausted) {
            alert('Ese regalo ya se agotó. Vuelve a girar.');
            refreshRoulette();
            return;
        }
        console.error('Error guardando regalo:', error);
        var msg = 'Error al guardar. Intenta de nuevo.';
        if (error.code === 'permission-denied' || (error.message && error.message.includes('permission'))) {
            msg = 'No tienes permiso para guardar.';
        } else if (error.message && (error.message.includes('network') || error.message.includes('ERR_BLOCKED') || error.message.includes('Failed') || error.message.includes('transaction'))) {
            msg = 'No se pudo confirmar. Reintenta girar (el regalo puede haberse agotado).';
        }
        alert(msg);
        refreshRoulette();
    });
}

window.addEventListener('DOMContentLoaded', initRoulette);