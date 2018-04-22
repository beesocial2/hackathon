var golosJs, momentJs, sweetAlert, gAuth, gPollsApi, bootstrapMin, gPollsStyle, gPollsWidth, gPollsLink, gPollsContainer;

bootstrapMin = document.createElement('link');
bootstrapMin.rel = 'stylesheet';
bootstrapMin.type = 'text/css';
bootstrapMin.href = 'inject.css';
(document.head || document.documentElement).appendChild(bootstrapMin);

sweetAlert = document.createElement('script');
sweetAlert.src = 'https://unpkg.com/sweetalert2@7.15.0/dist/sweetalert2.all.js';
(document.head || document.documentElement).appendChild(sweetAlert);

golosJs = document.createElement('script');
golosJs.src = 'https://cdn.jsdelivr.net/npm/golos-js@0.6.1/dist/golos.min.js';
(document.head || document.documentElement).appendChild(golosJs);

gAuth = document.createElement('script');
gAuth.src = 'https://golosimages.com/auth.js';
(document.head || document.documentElement).appendChild(gAuth);

glang = document.createElement('script');
glang.src = 'https://golosimages.com/lang.js';
(document.head || document.documentElement).appendChild(glang);

window.onload = function() { // init script after page loaded
gPollsContainer = document.createElement('div');
gPollsContainer.className = 'card border-primary mb-3';
gPollsContainer.innerHTML = `<div class="card-header"><img src="bee-logo.ico" width="25" height="25" class="d-inline-block align-top" alt=""><a href="https://http://beesocial.in/" target="_blank">BeeSocial.in</a></div><div class="card-header-right"><p></p></div><div class="card-body text-dark"><img class="social-img" src="bee-logo.ico" style="width: 100%; height: 65%;"></div></div>`;
document.querySelector('.gMerch').style.width = gWidth;
document.querySelector('.gMerch').appendChild(gPollsContainer);

golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');

document.querySelector('.social-img').addEventListener('mouseover', () => {
	console.log('<f> img over');
	document.querySelector('.social-img').src = 'merch.jpg';
}, false);
	
document.querySelector('.social-img').addEventListener('mouseout', () => {
	console.log('<f> img out');
	document.querySelector('.social-img').src = 'bee-logo.ico';
}, false);
	
document.querySelector('.social-img').addEventListener('click', () => {
	console.log('<f> progress_click');
	if (wif) {
		swal({ // visual 
			type: 'success',
			title: 'Thanks for making your choice!',
			toast: true,
			showConfirmButton: false,
			timer: 2500
		})
		sendVote();
	} else {
		auth(() => {
			swal({ // visual 
				type: 'success',
				title: 'Thanks for making your choice!',
				toast: true,
				showConfirmButton: false,
				timer: 2500
			})
			sendVote();
		});
		if (err) {
			swal({
				title: 'error',
				text: 'authorization failed',
				type: 'error'
			})
		}
	}
}, false);

function sendVote(pollId) {
	console.log('<f> sendVote');
	var from = document.querySelector('#constr').querySelectorAll('.form-control')[0].value;
	var to = document.querySelector('#constr').querySelectorAll('.form-control')[1].value;
	var wif = document.querySelector('#constr').querySelectorAll('.form-control')[2].value;
	var amount = document.querySelector('#constr').querySelectorAll('.form-control')[3].value;
	var memo = document.querySelector('#constr').querySelectorAll('.form-control')[4].value;
	golos.broadcast.transfer(wif, from, to, amount, memo, function (err, result) {
		//console.log(err, result);
		if (!err) {
			swal({
					title: 'success',
					text: result,
					type: 'success',
					showConfirmButton: false,
					timer: 2500
			})
		} else swal({
					title: 'error',
					text: err,
					type: 'error',
					showConfirmButton: false,
					timer: 2500
			});
	})
}

};