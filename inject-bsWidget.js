widgetButton = document.createElement('button');
widgetButton.type = 'button';
widgetButton.id = 'initButton';
widgetButton.class = 'btn btn-primary';
widgetButton.innerHTML = 'Pay with GOLOS';
document.querySelector('.bsMerch').appendChild(widgetButton); // div inject

document.querySelector('#initButton').addEventListener('click', () => {
bsIframe = document.createElement('div');
bsIframe.innerHTML = `<iframe frameborder="0" allowtransparency="true" src="bsWidget.html" style="display: none;"></iframe>`;
document.querySelector('.bsMerch').appendChild(bsIframe); // div inject
 var iframe = document.getElementsByTagName('iframe')[0];
  // сработает
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
  };
}, false);