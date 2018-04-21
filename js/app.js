// switching to testnet
golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');

function Auth() {
	var username = 'test4';
	var password = 'qwerty12345';
	golos.api.login(username, password, function(err, result) {
	//console.log(err, result);
	if ( ! err) {
		console.log('login', result);
		}
		else console.error(err);
	});
}
