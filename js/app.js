// switching to testnet
golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');
var	hash = location.hash.substring(1), // geting hash
	resultContent = ''; // global variable for content
if (hash != '') getHash();
window.onhashchange = function () {
	hash = location.hash.substring(1);
	console.log('hash has been changed: ', hash);
	if (hash != '') getHash();
};

function getTransaction(callback) {
	console.log('<f> getTransaction');
	document.getElementsByTagName('tbody')[0].innerHTML = '';
	var $div = document.createElement('tr'); // inserting header in poll 
	$div.innerHTML = `
          <th scope="row">1</th>
          <td>` + resultContent.permlink + `</td>
          <td>` + resultContent.author + `</td>
          <td>@XYZ</td>
          <td>` + resultContent.body + `</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>`;
	document.getElementsByTagName('tbody')[0].appendChild($div);
	if (callback) callback();
}

function getHash() {
	console.log('<f> getHash');
	var startTarget = '/@';
	var startPos = -1;
	while ((startPos = hash.indexOf(startTarget, startPos + 1)) != -1) {
		var Pos = startPos,
			targetStart = startPos;
	}
	startTarget = '/'; // search '/' after '/@'
	while ((Pos = hash.indexOf(startTarget, Pos + 1)) != -1) {
		var slashPos = Pos;
	}
	var username = hash.substring(targetStart + 2, slashPos); // '+ 2' removes the target symbols
	var permlink = hash.substring(slashPos + 1); // '+ 1' removes '/' 
	golos.api.getContent(username, permlink, function (err, result) { // The console displays the data required for the post 
		console.log(err, result);
		resultContent = result;
		if (!err && result.title != '') {
			console.log('gethash->getTransaction =', result.title);
			getTransaction();
		} else {
			console.error('Failed to find post', err);
		}
	});
}
