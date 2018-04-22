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
		document.querySelector('#avatar').querySelector('img').src = JSON.parse(result[0].json_metadata).img;
		toTable();
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
		title: '<i>Cabinet</i>',
		html: '<button type="button" class="btn btn-primary" id="operations">My operations</button>' +
			'<button type="button" class="btn btn-primary d-flex align-items-" id="newoperation">New operation</button>',
		showConfirmButton: false,
	})
}, false);

document.onreadystatechange = function () { // loading animation switch-off
	console.log('<f> doc ready');
	if (document.readyState === "complete") {
		document.querySelector('.lding').style.display = 'none';
	}
}

var myRecievers = [];

function toTable() {
	currentUser = username;
	golos.api.getAccountHistory(currentUser, -1, 100, function (err, result) {
		//console.log(err,result);

		myRecievers.push(currentUser);
		//отсеивание валидных транзакций
		//если это операция трансфер + длина json'а нормальная + конечный узел существует на графе
		result.forEach(function (item, i) {
			//console.log(item[1]);
			if (item[1].op[0] == "transfer" &&
				item[1].op[1].memo.length > 100 &&
				item[1].op[1].from == currentUser &&
                item[1].trx_id !='126c199cb03fb46fd38783d991934d549f9fc94a'
			) {

				console.log(item);
				let data = JSON.parse(item[1].op[1].memo);
				let row = document.createElement('tr');
				row.innerHTML = "<td>" + item[1].trx_id + "</td><td>" + item[1].op[1].from + "</td><td>" + item[1].op[1].to + "</td><td>" + data.tokens + "</td><td>" + item[1].timestamp + "</td><td>" + data.moreinfo + "</td>";
				document.getElementsByTagName('tbody')[0].appendChild(row);


				let flag = true;
				myRecievers.forEach(function (itemName) {
					if (itemName == item[1].op[1].to) {
						flag = false;
					}
				});
				if (flag == true) {
					myRecievers.push(item[1].op[1].to);
				}
			}
		});
		//console.log(myTransactions);
		//console.log(myRecievers);
	});
};

document.getElementById('visual').addEventListener('click', function () {
	visualize(myRecievers);
});

//visualize.js--------------------------------
var w = window.innerWidth;
var h = window.innerHeight;
var svg = d3.select("svg")
.attr('width',w)
.attr('height',h)
function redrawLines(data){
    var line = svg.selectAll("line")
    .data(data, function(d){ return d; });

    line.enter().append("line")
    .attr("x1", function(d){ return getCoord(d.from)[0];})
    .attr("y1", function(d){ return getCoord(d.from)[1];})
    .attr("x2", function(d){ return getCoord(d.to)[0];})
    .attr("y2", function(d){ return getCoord(d.to)[1];})
    .attr("stroke",function(d){
        return getTransactionColor(getTypeOfCirc(getCircById(d.from).name),getTypeOfCirc(getCircById(d.to).name));})
    .attr("stroke-width",5)
    .attr("data-toggle","tooltip")
    .attr("data-placement","right")
    .attr("data-html","true")
	.attr("data-hash",function(d){return d.hash;})
    .on('mouseenter',function(d){
        $('#'+d.from).tooltip('show');
        $('#'+d.to).tooltip('show');
    })
    .on('mouseout',function(d){
        $('#'+d.from).tooltip('hide');
        $('#'+d.to).tooltip('hide');
    })
    .attr("title",function(d){return '<p>'+getCircById(d.from).name+' -> '+getCircById(d.to).name+'</p><p> tokens: '+d.tokens+'</p><p>'+d.moreinfo+'</p>' });
    
    line.exit().remove();
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
}
function redrawCircs(data){
    var circle = svg.selectAll("circle")
    .data(data, function(d) { return d; });
    
    circle.enter().append("circle")
        .attr("cy", function(d){return d.y;})
        .attr("cx", function(d){return d.x;})
        .attr("r", function(d){return Number.parseInt(d.balance)/50;})
        .attr("id",function(d){return d.ID;})
        .attr("fill", function(d){return getAccountColor(d.type);})
        .attr("data-toggle","tooltip")
        .attr("data-placement","left")
        .attr("data-html","true")
        //.attr("title",function(d){return '<p>'+d.type+'</p><p>'+d.name+'<p></p>'+d.description.substr(0,150)+'...</p>';});
        .attr("title",function(d){return '<p>'+d.type+'</p><p>'+d.name+'<p></p>balance: '+d.balance+'</p>';})
    ;
    circle.exit().remove();
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
 }
//SVG------------------------------------------    
    
//DATA-----------------------------------------
var circs = [];
var lines = [];

function visualize(names){
    circs =[];
    lines=[];
    golos.api.getAccounts(names, function(err, result){
    
        console.log(result);
        result.forEach(function(item,i){
            var circ = new Object();
            circ.x = w/3.5 + 200*Math.cos(i*2*Math.PI/names.length);
            circ.y = h/2 + 200*Math.sin(i*2*Math.PI/names.length);
            circ.ID = i;
            circ.Id = item.id;
            circ.balance = item.balance;
            circ.permName = item.name;
            let info = JSON.parse( item.json_metadata);
            circ.name = info.name;
            circ.type = info.type;
            circ.description = info.description;
            circ.img = info.img;
            circs.push(circ);
        });
    
    
    //искать всевозможные транзакции между существующими участниками
    //цикл по именам
    names.forEach(function(itemName){
        lines = [];
        //все транзакции для текущего имени
        golos.api.getAccountHistory(itemName, -1, 100, function(err, result) {
            //console.log(err, result);
            result.forEach(function(item){
                
                //console.log(item);
                if(item[1].op[0]=="transfer" 
                   && item[1].op[1].memo.length>100
                   && item[1].op[1].from == itemName
                   && item[1].trx_id !='126c199cb03fb46fd38783d991934d549f9fc94a'
                ){
                    console.log('from: '+item[1].op[1].from+' to: '+item[1].op[1].to+' json: '+item[1].op[1].memo);
                    let line = new Object();
                    let info = JSON.parse(item[1].op[1].memo);
                    line.from = getCircByName(info.from).ID;
                    info.to = info.to.replace(' d','');
                    if(getCircByName(info.to)==null){
                        names.push(info.to);
                        visualize(names);
                    }
                    line.to = getCircByName(info.to).ID;
                    line.hash = item[1].trx_id;
                    line.moreinfo = info.moreinfo;
                    line.tokens = info.tokens;
                    let flag = true;
                    lines.forEach(function(item){
                        if(item==line) flag=false;    
                    });
                    if(flag=true){
                        lines.push(line);
                    }
                    
                    //console.log('from: '+getTypeOfCirc(item[1].op[1].from)+' to: '+getTypeOfCirc(item[1].op[1].to));    
                }
            });
            console.log('lines: '+lines);
            redrawLines(lines);
            //redrawCircs(circs);
        });
        
    });
    //console.log('circs: '+circs);
    redrawCircs(circs);
});//end of names cycle
}//end of visualize
    
    
function getCoord(id){
                let thisCirc = getCircById(id);
                return [thisCirc.x,thisCirc.y];
            }  
function getCircById(id){
                for(i=0;i<circs.length;i++){
                    if(circs[i].ID == id){
                        return circs[i];
                    }
                }
                return null;
            }
function getCircByName(targetName){
    for(let i=0;i<circs.length;i++){
        if(circs[i].permName == targetName){
            return circs[i];
        }
    }
    return null;
}
function getAccountColor(type){
                if(type=="npo"){
                    return "#4ad331";
                }else if(type=="sponsor"){
                    return "#eb2828";
                }else if(type=="volunteer"){
                    return "#ebf247";
                }
            }
function getTransactionColor(typeFrom,typeTo){
    if(typeFrom=="npo" && typeTo=="npo"){
        return "#9036dd";
    }else if(typeFrom=="volunteer" || typeTo=="volunteer"){
        return "#2e9cbe";
    }else if(typeFrom=="sponsor" || typeTo=="sponsor"){
        return "#d06827";
    }
}
function showInfo(obj){
                let blockInfo = document.getElementsByClassName('info')[0];
                blockInfo.innerHTML = '';
                blockInfo.innerHTML = obj.description;
            }
function hideInfo(){
                let blockInfo = document.getElementsByClassName('info')[0].innerHTML='';
            }        
function isCircExist(targetName){
                if(getCircByName(targetName)==null){
                    return false;
                }else{
                    return true;
                }
            }
function getTypeOfCirc(name){
               return getCircByName(name).type;
           }