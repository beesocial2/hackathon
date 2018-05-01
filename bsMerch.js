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

});

bsButton = document.createElement('div');
bsButton.innerHTML = `<div class="bsMerch"><button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#exampleModal">Donate with <img src="golos-icon-114x114.png" class="" height="20"> GOLOS
</button>`;
document.querySelector('.bsMerch').appendChild(bsButton); // div inject

var bsModal = document.createElement('div');
bsModal.innerHTML = `<div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        ...
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>`;
document.getElementsByTagName('body')[0].appendChild(bsModal); // div inject