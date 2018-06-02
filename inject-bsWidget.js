window.addEventListener('message', function (e) {
			if (e.data == 'hidden.bs.modal') {
				document.querySelector('.framediv').remove();
				console.log('message', e.data); // debug
			}
			if (e.data == 'modalBs.show') {
				document.querySelector('.lding').style.display = 'none';
				console.log('message', e.data); // debug
			}
        });

cubeloader = document.createElement('link');
cubeloader.rel = 'stylesheet';
cubeloader.type = 'text/css';
cubeloader.href = 'cubeloader.css';
(document.head || document.documentElement).appendChild(cubeloader);

widgetButton = document.createElement('button');
widgetButton.type = 'button';
widgetButton.id = 'initButton';
widgetButton.className = 'btn btn-primary';
widgetButton.innerHTML = 'Pay with GOLOS';
document.querySelector('.bsMerch').appendChild(widgetButton); // button inject

lds = document.createElement('div');
lds.className = 'lding';
lds.innerHTML = `<div class="lds-css ng-scope">
			<div class="lds-cube">
				<div></div>
				<div></div>
				<div></div>
				<div></div>
			</div>
		</div>`;
(document.body || document.documentElement).insertBefore(lds, (document.body || document.documentElement).firstChild); // lds inject

document.querySelector('#initButton').addEventListener('click', () => {
document.querySelector('.lding').style.display = 'block';
framediv = document.createElement('div');
framediv.className = 'framediv';
framediv.innerHTML = `<iframe id="bsIframe" frameborder="0" allowtransparency="true" src="bsWidget.html" style="display: none;"></iframe>`;
document.querySelector('.bsMerch').appendChild(framediv); // div inject
 var iframe = document.getElementsByTagName('iframe')[0];
  iframe.onload = function() {
    iframe.style = `style="
			z-index: 2147483647;
			display: block;
			overflow-y: auto;
			visibility: visible;
			margin: 0px;
			padding: 0px;
			position: fixed;
			left: 0px;
			top: 0px;
			width: 100%;
			height: 100%;"`;
	iframe.contentWindow.postMessage(
		`{ "data-account" : "` + document.querySelector('.golos-merchant-button').getAttribute('data-account') + `", 
		"data-amount" : "` + document.querySelector('.golos-merchant-button').getAttribute('data-amount') + `",
		"data-fixprice" : "` + document.querySelector('.golos-merchant-button').getAttribute('data-fixprice') + `",
		"data-description" : "` + document.querySelector('.golos-merchant-button').getAttribute('data-description') + `",
		"data-image" : "` + document.querySelector('.golos-merchant-button').getAttribute('data-image') + `"
		}` 
		, '*');	// get attr&send
  };
}, false);