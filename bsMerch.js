var modalBs;
// patch for not working auth
var wif = '5JSAM1dGaBT9q676jxaPawvvaHVs7xzddwnBdGrUWDPCreWtmSL',
	username = 'kiriki1991';

golosJs = document.createElement('script');
golosJs.src = 'https://cdn.jsdelivr.net/npm/golos-js@0.6.3/dist/golos.min.js';
(document.head || document.documentElement).appendChild(golosJs);

bootstrapJs = document.createElement('script');
bootstrapJs.src = 'https://cdn.jsdelivr.net/npm/bootstrap.native@2.0.22/dist/bootstrap-native-v4.min.js';
(document.head || document.documentElement).appendChild(bootstrapJs);

golosAuth = document.createElement('script');
golosAuth.src = 'https://golosimages.com/auth.js';
(document.head || document.documentElement).appendChild(golosAuth);

styles = document.createElement('link');
styles.rel = 'stylesheet';
styles.type = 'text/css';
styles.href = 'bsWidget.css';
(document.head || document.documentElement).insertBefore(styles, (document.head || document.documentElement).firstChild);

bootstrap = document.createElement('link');
bootstrap.rel = 'stylesheet';
bootstrap.type = 'text/css';
bootstrap.href = 'https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css';
(document.head || document.documentElement).insertBefore(bootstrap, (document.head || document.documentElement).firstChild);

window.addEventListener('load', function () { // init script after page loaded
	console.log('<f> doc loaded');
	window.parent.postMessage('modalBs.show', '*');
	/*golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');
	golos.config.set('websocket', 'wss://ws.testnet.golos.io');*/
	modalBs = new Modal(document.getElementById('bsModal'));
	if (wif) { // opens modal
		getGolosAccount();
	} else {
		console.log('auth() =>');
		auth(() => {
			getGolosAccount();
		});
	}
	document.querySelector('#bsModal').addEventListener('hidden.bs.modal', () => {
		window.parent.postMessage('hidden.bs.modal', '*');
	}, false);
});

function getGolosAccount() {
	golos.api.getAccounts([username], function (err, response) {
		response[0].json_metadata = JSON.parse(response[0].json_metadata); // !check if exist name etc
		document.querySelector('.twPc-divName a').innerHTML = response[0].json_metadata.profile.name;
		document.querySelector('.twPc-divUser span a span').innerHTML = response[0].name;
		document.querySelector('.twPc-divUser span a').href = 'https://golos.io/@' + response[0].name;
		document.querySelector('.twPc-avatarImg').src = response[0].json_metadata.profile.profile_image;
		document.querySelector('#transfersGolos a').href = 'https://golos.io/@' + response[0].name + '/transfers';
		document.querySelector('#balanceGolosValue').innerHTML = response[0].balance;
		document.querySelector('#transfersGbg a').href = 'https://golos.io/@' + response[0].name + '/transfers';
		document.querySelector('#transfersGbgValue').innerHTML = response[0].sbd_balance;
//		console.log(response[0]); // debug
		//response[0].balance = '200000.000 GOLOS'; // test
		document.querySelector('#totalAmount').step = 0.001;
		document.querySelector('#totalAmount').min = 0;
		document.querySelector('#totalAmount').max = response[0].balance.substring(response[0].balance.length - 6, -1);
		document.querySelector('#totalAmount').addEventListener('input', () => {
			document.querySelector('#inputAmount').value = document.querySelector('#totalAmount').value;
		}, false);
		document.querySelector('#confirmButton').addEventListener('click', () => {
			alert(`var from = '` + username + `';
			var to = 'k-merkulov';
			var amount = '` + document.querySelector('#inputAmount').value + ` GOLOS';
			var memo = 'BeeSocial : MerchantWidget test';
			golos.broadcast.transfer(wif, from, to, amount, memo, function (err, result) {
				if (!err) {
					console.log('transfer', result);
				} else console.error(err);
			});`);
		}, false);
		modalBs.show();
		document.querySelector('#inputAmount').value = document.querySelector('#totalAmount').value; // sync range & input
	});
}