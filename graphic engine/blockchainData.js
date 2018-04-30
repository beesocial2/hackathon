golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');



/*var names = ['botcube','monkeyfood','priorbank','imaguru','ecotheatre','greenetwork','botcube','fundobra','maria-knop','anton-shvab'];
            var N=1;
            window.addEventListener('click',function(){
                
                circs = [];
                lines = [];
                //console.log(lines);
                var user;
                var currentNamesArray = names.slice(0,N);
                golos.api.getAccounts(currentNamesArray, function(err, result) {
                    //console.log(result);
                    result.forEach(function(item,i){
                        var circ = new Object();
                        circ.x = window.innerWidth/2 + 200*Math.cos(i*2*Math.PI/N);
                        circ.y = window.innerHeight/2 + 200*Math.sin(i*2*Math.PI/N);
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
                        //console.log(circs);
                    });
                    
                    
                    //искать всевозможные транзакции между существующими участниками
                    //цикл по именам
                    names.slice(0,N).forEach(function(itemName){
                        lines = [];
                        //все транзакции для текущего имени
                        golos.api.getAccountHistory(itemName, -1, 100, function(err, result) {
                            //console.log(err, result);
                            
                            //отсеивание валидных транзакций
                            //если это операция трансфер + длина json'а нормальная + конечный узел существует на графе
                            result.forEach(function(item){
                                //console.log(item[1]);
                                if(item[1].op[0]=="transfer" 
                                   && item[1].op[1].memo.length>100 
                                   && isCircExist(item[1].op[1].to)
                                   && item[1].op[1].from == itemName
                                ){
                                    //console.log(item);
                                    
                                    let line = new Object();
                                    let info = JSON.parse(item[1].op[1].memo);
                                    line.from = getCircByName(info.from).ID;
                                    info.to = info.to.replace(' d','');
                                    line.to = getCircByName(info.to).ID;
                                    line.hash = item[1].trx_id;
                                    line.moreinfo = info.moreinfo;
                                    line.tokens = info.tokens;
                                    lines.push(line);
                                    console.log('from: '+item[1].op[1].from+' to: '+item[1].op[1].to+' json: '+item[1].op[1].memo);
                                    //console.log('from: '+getTypeOfCirc(item[1].op[1].from)+' to: '+getTypeOfCirc(item[1].op[1].to));
                                }
                            });
                            console.log('lines '+N);
                            redrawLines(lines);
                        });
                        
                    });
                    console.log('circs '+N);
                    redrawCircs(circs);
                    N++;
                });
                
            });*/