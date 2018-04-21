// switching to testnet
golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');

function auth() {
	var username = 'test4';
	var password = 'qwerty12345';
	golos.api.login(username, password, function (err, result) {
		//console.log(err, result);
		if (!err) {
			console.log('login', result);
		} else console.error(err);
	});
}

function getTransaction(callback) {
	console.log('<f> getTransaction');
	document.getElementsByTagName('tbody')[0].innerHTML = '';
	var $div = document.createElement('tr'); // inserting header in poll 
	$div.innerHTML = `
          <th scope="row">1</th>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>`;
	document.getElementsByTagName('tbody')[0].appendChild($div);
	if (callback) callback();
}

function send_request(str, title, jsonMetadata) {
	console.log('<f> send_request');
	var parentAuthor = ''; // for post creating, empty field
	var parentPermlink = 'test'; // main tag
	var body = 'At the moment, you are looking at the test page of a simple microservice, which is currently under development. And since it so happened that you look at it, here`s a random cat, good luck to you and all the best.<img src="https://tinygrainofrice.files.wordpress.com/2013/08/kitten-16219-1280x1024.jpg"></img>'; // post text
	golos.broadcast.comment(wif, parentAuthor, parentPermlink, username, str, title, body, jsonMetadata, function (err, result) {
		//console.log(err, result);
		if (!err) {
			//console.log('post: ', result);
			window.location.hash = username + '/' + str;
			document.querySelector('.lding').style.display = 'none';
		} else {
			console.error(err);
			swal({
				type: 'error',
				title: 'error',
				text: err
			});
		}
	}); // add post
}

function getHash() {
	console.log('<f> getHash');
	if (location.hash == '');
	var startTarget = '/@'; // search '/@' - FIX THIS BUG! WHY IT`S WORKING?
	var startPos = -1;
	document.querySelector('.lding').style.display = 'block';
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
			console.log('getContent', result.title);
		} else {
			console.error('Failed to find post', err);
		}
		document.querySelector('.lding').style.display = 'none';
	});
}