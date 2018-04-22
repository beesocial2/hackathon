// switching to testnet
golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');
var hash = location.hash.substring(1), // geting hash
	resultContent = ''; // global variable for content
/* if (hash != '') getHash();
window.onhashchange = function () {
	hash = location.hash.substring(1);
	console.log('hash has been changed: ', hash);
	if (hash != '') getHash();
}; */
if (wif) {
	document.getElementById('signin').className = 'btn btn-outline-danger my-2 my-sm-0';
	document.getElementById('signin').innerHTML = 'Log out';
	document.querySelector('.user-menu').style = 'display: block; padding-right: 1rem;';
}
if (username) {
	golos.api.getAccounts([username], function (err, result) {
		console.log('accType = ', JSON.parse(result[0].json_metadata).type);
	});
}

function doTransfer() {
	var wif = '5J5V5Wahrw34qfWgPPL3PGTaLuy5Ec7S8Fuh7Hd2XR1rhb1TQyd';
	var from = 'imaguru';
	var to = 'fundobra';
	var amount = '1.000 GOLOS';
	var memo = '{"from":"imaguru","to":"fundobra","project":"hackathon Social Weekend","tokens":"1000","moreinfo":"24-25 February, Hackathon Social Weekend","permlink":"imaguru/beesocialapp-1524340568454"}';
	golos.broadcast.transfer(wif, from, to, amount, memo, function (err, result) {
		//console.log(err, result);
		if (!err) {
			console.log('transfer', result);
		} else console.error(err);
	});
}

function doPost() {
	var parentAuthor = '';
	var parentPermlink = 'beesocialapp-npo';
	var permlink = 'beesocialapp' + '-' + Date.now();
	var title = 'Save Villy!';
	var body = `<p>'Save Villy' is a new project that unites commercial companies, social projects and volunteers.<p>The Bee Social platform unites those who want to share their resources, and those who need these resources.<p>A platform where everyone can help the social project with their resources and volunteering in exchange for Honeycombs - the crypto currency.<img src="https://beesocial.in/img/about_logo.png"><p>https://beesocial.in/`;
	var jsonMetadata = '{"from":"imaguru","to":"fund dobra","project":"hackathon Social Weekend","tokens":"1000","moreinfo":"24-25 February, Hackathon Social Weekend"}';
	golos.broadcast.comment(wif, parentAuthor, parentPermlink, username, permlink, title, body, jsonMetadata, function (err, result) {
		if (!err) {
			console.log('comment', result);
		} else console.error(err);
	});
}

function showPost(callback) {
	console.log('<f> showPost');
	resultContent.json_metadata = JSON.parse(resultContent.json_metadata);
	//console.log(resultContent.json_metadata);
	document.getElementsByTagName('tbody')[0].innerHTML = '';
	var $div = document.createElement('tr'); // inserting header in poll 
	$div.innerHTML = `
       <th scope="row">1</th>
        <td>` + resultContent.permlink + `</td>
		<td>` + resultContent.json_metadata.from + `</td>
          <td>` + resultContent.json_metadata.to + `</td>
          <td>` + resultContent.json_metadata.project + `</td>
          <td>` + resultContent.json_metadata.tokens + ` SUC</td>
          <td>` + resultContent.json_metadata.moreinfo + `</td>
        </tr>`;
	document.getElementsByTagName('tbody')[0].appendChild($div);
	if (callback) callback();
	document.querySelector('.lding').style.display = 'none';
}

function getHash() {
	console.log('<f> getHash');
	document.querySelector('.lding').style.display = 'block';
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
			console.log('gethash->getPost =', result.title);
			showPost();
		} else {
			console.error('Failed to find post', err);
		}
	});
}

function completeForm() {
	console.log('<f> completeForm');
	// collecting data & sending
	str = urlLit(document.querySelector('.form-control.title').value, 0);
	str = str + '-' + Date.now();
	console.log('permlink : ' + str);
	console.log('json var : ' + answers); // debug info
	console.log('title : ' + title);
	var jsonMetadata = {
		app: 'beesocialplatform/0.1',
		canonical: 'https://beesocial.in/' + username + '/' + str,
		app_account: 'beesocial',
		data: {
			title: title,
			items: items
		}
	};
	send_request(str, title, jsonMetadata);
	if (!err) {
		document.querySelector('.lding').style.display = 'none';
		swal({ // visual
			type: 'success',
			title: 'Your polling form has been compiled',
			text: 'Don`t forget to share it!',
			showConfirmButton: false,
			timer: 2500
		})
		tagNewPost = true;
		counter = 20;
		newPostTimout = setInterval(function () {
			counter--;
			console.log('counter =', counter);
			if (counter == 0) {
				clearTimeout(newPostTimout);
				tagNewPost = false;
			}
		}, 1000);
	} else {
		document.querySelector('.lding').style.display = 'none';
		console.error(err);
		swal({
			type: 'error',
			title: 'error',
			text: err
		});
	}
}

function send_request(str, title, jsonMetadata) {
	console.log('<f> send_request');
	var parentAuthor = ''; // for post creating, empty field
	var parentPermlink = 'test'; // main tag
	var body = 'At the moment, you are looking at is a social platform "Bee Social"  test page - social platform that unites commercial companies, social projects and volunteers. Good luck to you and all the best. https://beesocial.in/<img src="https://beesocial.in/img/about_logo.png"></img>'; // post text
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

// button events

document.getElementById('signin').addEventListener('click', () => {
	console.log('<f> signin click');
	if (wif) {
		localStorage.removeItem('wif');
		localStorage.removeItem('username');
		window.username = '';
		window.wif = '';
		setTimeout(function () {
			window.location.reload();
		});
	} else {
		auth(() => {
			setTimeout(function () {
				window.location.reload();
			});
		});
	}
}, false);

document.getElementById('avatar').addEventListener('click', () => {
	console.log('<f> avatar click');
	swal({
		position: 'top-end',
		type: 'success',
		title: 'Your work has been saved',
	})
}, false);

document.onreadystatechange = function () { // loading animation switch-off
	console.log('<f> doc ready');
	if (document.readyState === "complete") {
		document.querySelector('.lding').style.display = 'none';
	}
}