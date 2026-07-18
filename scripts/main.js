const CONFIG = {
	totalFrames: 275,
	framesPath: 'assets/frames/',
	throttleDelay: 30
};
let currentFrame = 0, lastScrollTime = 0, imageCache = [];
let AnimationFrame, loadingScreen, loadingText;

function getFramePath(index) {
	return CONFIG.framesPath + (index + 1).toString().padStart(4, '0') + '.webp';
}

function preloadImages() {
	return new Promise(function (resolve) {
		let loadedCount = 0;
		for (let i = 0; i < CONFIG.totalFrames; i++) {
			const img = new Image(); img.src = getFramePath(i); img.onload = function () { loadedCount++; if (loadedCount === CONFIG.totalFrames) { resolve(); } }; img.onerror = function () { loadedCount++; if (loadedCount === CONFIG.totalFrames) { resolve(); } }; imageCache.push(img);
		}
	});
}

function updateFrame() {
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
	const scrollFraction = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
	let targetFrame = Math.floor(scrollFraction * (CONFIG.totalFrames - 1));
	if (targetFrame !== currentFrame) {
		currentFrame = targetFrame;
		AnimationFrame.src = getFramePath(currentFrame);
	}
	if (currentFrame === CONFIG.totalFrames - 1) {
		window.dispatchEvent(new CustomEvent('animationComplete'));
	}
}

function handleScroll() {
	var hint = document.getElementById('scroll-hint');
	if (hint && !hint.classList.contains('hidden')) {
		hint.classList.add('hidden');
	}
	const now = Date.now();
	if (now - lastScrollTime >= CONFIG.throttleDelay) {
		lastScrollTime = now;
		requestAnimationFrame(updateFrame);
	}
}

async function initAnimation() {
	AnimationFrame = document.getElementById('animation-frame');
	loadingScreen = document.getElementById('loading-screen');
	loadingText = document.querySelector('.loading-text');

	loadingText.textContent = 'Cargando...';
	await preloadImages();
	loadingText.textContent = 'Listo';
	setTimeout(function () {
		loadingScreen.classList.add('hidden');
		AnimationFrame.src = getFramePath(0);
		window.addEventListener('scroll', handleScroll, { passive: true });
		updateFrame();
		document.getElementById('scroll-hint').classList.remove('hidden');
	}, 500);
}
