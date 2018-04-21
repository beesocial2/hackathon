// switching to testnet
golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');
var hash = location.hash.substring(1), // geting hash
	resultContent = ''; // global variable for content
if (hash != '') getHash();
window.onhashchange = function () {
	hash = location.hash.substring(1);
	console.log('hash has been changed: ', hash);
	if (hash != '') getHash();
};
if (wif) {
	document.getElementById('signin').className = 'btn btn-outline-danger my-2 my-sm-0';
	document.getElementById('signin').innerHTML = 'Log out';
	document.querySelector('.user-menu').style = 'display: block; padding-right: 1rem;';
}
/* = {"from":"imaguru","to":"fund dobra","description":"Project: hackathon Social Weekend","tokens":"1000","moreinfo":"24-25 February, Hackathon Social Weekend"} */
function showPost(callback) {
	console.log('<f> showPost');
	resultContent.json_metadata = JSON.parse(resultContent.body); //parse json to js
	console.log(resultContent.json_metadata);
	document.getElementsByTagName('tbody')[0].innerHTML = '';
	var $div = document.createElement('tr'); // inserting header in poll 
	$div.innerHTML = `
       <th scope="row">1</th>
        <td>` + resultContent.permlink + `</td>
		<td>` + resultContent.json_metadata.from + `</td>
          <td>` + resultContent.json_metadata.to + `</td>
          <td>` + resultContent.json_metadata.project + `</td>
          <td>` + resultContent.json_metadata.resource + ` SUC</td>
          <td>` + resultContent.created + `</td>
        </tr>`;
	document.getElementsByTagName('tbody')[0].appendChild($div);
	document.querySelector('.lding').style.display = 'none';
	if (callback) callback();
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