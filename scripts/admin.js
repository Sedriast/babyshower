var adminScreen = document.getElementById('admin-screen');
var adminList = document.getElementById('admin-list');
var adminStatus = document.getElementById('admin-status');

function openAdminScreen() {
    adminStatus.textContent = 'Cargando...';
    adminList.innerHTML = '';
    adminScreen.classList.add('visible');
    loadAdminList();
}

function closeAdminScreen() {
    adminScreen.classList.remove('visible');
}

function loadAdminList() {
    db.collection('users')
        .where('gift', '!=', null)
        .get()
        .then(function (snapshot) {
            var items = [];
            snapshot.forEach(function (doc) {
                var data = doc.data();
                if (data.gift) {
                    items.push({
                        name: data.displayName || data.email || 'Invitado',
                        emoji: data.gift.emoji || '🎁',
                        giftName: data.gift.name || 'Regalo'
                    });
                }
            });
            if (items.length === 0) {
                adminList.innerHTML = '';
                adminStatus.textContent = 'Todavía no hay invitados con regalo asignado.';
                return;
            }
            items.sort(function (a, b) { return a.name.localeCompare(b.name); });
            adminStatus.textContent = items.length + (items.length === 1 ? ' invitado' : ' invitados');
            adminList.innerHTML = items.map(function (item) {
                return '<li>' +
                    '<span class="admin-guest-name"></span>' +
                    '<span class="admin-gift"><span class="admin-gift-emoji"></span></span>' +
                    '</li>';
            }).join('');
            var lis = adminList.querySelectorAll('li');
            lis.forEach(function (li, i) {
                li.querySelector('.admin-guest-name').textContent = items[i].name;
                li.querySelector('.admin-gift-emoji').textContent = items[i].emoji;
                li.querySelector('.admin-gift').appendChild(
                    document.createTextNode(' ' + items[i].giftName)
                );
            });
        })
        .catch(function (error) {
            console.error('Error cargando lista:', error);
            adminList.innerHTML = '';
            adminStatus.textContent = 'No se pudo cargar la lista.';
        });
}

document.getElementById('admin-btn').addEventListener('click', openAdminScreen);
document.getElementById('admin-close').addEventListener('click', closeAdminScreen);
adminScreen.addEventListener('click', function (e) {
    if (e.target === adminScreen) closeAdminScreen();
});