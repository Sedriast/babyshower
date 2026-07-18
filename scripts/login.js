const firebaseConfig = {
	apiKey: "AIzaSyBs_4bmIpsHaM_rM4g4pFFt0Jpkjpgg8es",
	authDomain: "invitations-f618a.firebaseapp.com",
	projectId: "invitations-f618a",
	storageBucket: "invitations-f618a.firebasestorage.app",
	messagingSenderId: "602561988972",
	appId: "1:602561988972:web:76ebeabad899f3b8aa8b49"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

const loginScreen = document.getElementById('login-screen');
const appContainer = document.getElementById('app');
const googleLoginBtn = document.getElementById('google-login-btn');
const loginError = document.getElementById('login-error');

function signInWithGoogle() {
	loginError.style.display = 'none';
	googleLoginBtn.disabled = true;

	auth.signInWithPopup(provider)
		.then(function (result) {
			return saveUserData(result.user);
		})
		.catch(function (error) {
			googleLoginBtn.disabled = false;
			if (error.code !== 'auth/popup-closed-by-user') {
				loginError.textContent = 'Error al iniciar sesión. Intenta de nuevo.';
				loginError.style.display = 'block';
			}
		});
}

function saveUserData(user) {
	return db.collection('users').doc(user.uid).set({
		displayName: user.displayName,
		email: user.email,
		photoURL: user.photoURL,
		lastLogin: firebase.firestore.FieldValue.serverTimestamp()
	}, { merge: true });
}

auth.onAuthStateChanged(function (user) {
	if (user) {
		window.currentUser = user;
		loginScreen.style.display = 'none';
		appContainer.style.display = 'block';
		initAnimation();
	} else {
		window.currentUser = null;
		loginScreen.style.display = 'flex';
		appContainer.style.display = 'none';
	}
});

googleLoginBtn.addEventListener('click', signInWithGoogle);
