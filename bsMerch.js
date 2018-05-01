golosJs = document.createElement('script');
golosJs.src = 'https://cdn.jsdelivr.net/npm/golos-js@0.6.3/dist/golos.min.js';
(document.head || document.documentElement).appendChild(golosJs);

bootstrapJs = document.createElement('script');
bootstrapJs.src = 'https://cdn.jsdelivr.net/npm/bootstrap.native@2.0.22/dist/bootstrap-native-v4.min.js';
(document.head || document.documentElement).appendChild(bootstrapJs);

golosAuth = document.createElement('script');
golosAuth.src = 'https://golosimages.com/auth.js';
(document.head || document.documentElement).appendChild(golosAuth);

bootstrap = document.createElement('link');
bootstrap.rel = 'stylesheet';
bootstrap.type = 'text/css';
bootstrap.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css';
(document.head || document.documentElement).appendChild(bootstrap);

window.addEventListener('load', function () { // init script after page loaded
	console.log('<f> doc loaded');
	golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');
	golos.config.set('websocket', 'wss://ws.testnet.golos.io');
	bsButton = document.createElement('button');
	bsButton.className = 'btn btn-outline-primary';
	bsButton.type = 'button';
	bsButton.innerHTML = `Donate with <img src="golos-icon-114x114.png" class="" height="20"> GOLOS`;
	document.querySelector('.bsMerch').appendChild(bsButton); // div inject
});