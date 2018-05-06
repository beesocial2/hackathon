/*golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');*/



//получает информацию о транзакциях и выдает json строку на выходе


//var currentName = 'beesocial';
var currentCluster = 1;
var names = [];
var trans = [];


var getJsonData = function(currentName,callback){
    
    names = [];
    trans = [];
    
    golos.api.getAccounts(currentName, function(err, result) {
        console.log(result);
        /*result.forEach(function(item,i){
        
        
        });*/
    });
    
    
    golos.api.getAccountHistory(currentName, -1, 100, function(err, result) {
        
        if(!err){
            result.forEach(function(item){
                if(item[1].op[0]=="transfer" ){
                    console.log(item);
                    //console.log(item);
                    addNew(item[1].op[1].from, names);
                    addNew(item[1].op[1].to, names);
                    trans.push(item[1].op[1]);
                    
                    //let info = JSON.parse(item[1].op[1].memo);
                    //console.log('from: '+item[1].op[1].from+' to: '+item[1].op[1].to+' json: '+item[1].op[1].memo);
                }
            });
            //console.log(names);
            //console.log(trans);
            //console.log(json_metadata);
            //console.log(JSON.parse(json_metadata));
            //console.log('{"nodes":[{"name":"Myriel","group":1},{"name":"Myriel1","group":1}]}');
            //console.log(JSON.parse('{"nodes":[{"name":"Myriel","group":1},{"name":"Myriel1","group":1}]}'));
            //console.log(namesToNodes(names));
            let jsonData = makeJSON(namesToNodes(names),transfersToLines(trans,names));
            
            callback(jsonData);
        }else{
            console.log(err);
        }
    });
}


/*adds the element to the array if there is not the same one*/
var addNew = function(element, array){
    let same = false;
    array.forEach(function(item){
        if(item == element) same = true;
    });
    if(same == false) array.push(element);
    return array;
}

var getIndexByName = function(name,names){
    let index=null;
    names.forEach(function(item,i){
        if(name==item) index=i;
    });
    
    if(index==null){
        console.log('error in seeking index of name!');  
    } else{
        return index;
    }
}
var namesToNodes = function(names){
    //"nodes":[{"name":"Myriel","group":1},{"name":"Myriel3","group":1}];
    let output = '"nodes":[';
    names.forEach(function(item,i){
        output += '{';
        output += '"name":"'+item+'","group":'+currentCluster;
        if(i==names.length-1){
            output += '}';    
        }else{
            output += '},';
        }    
    });
    output+=']';
    return output;
}
var transfersToLines = function(trans,names){
    //"links":[{"source":1,"target":0,"value":10}]
    let output = '"links":[';
    trans.forEach(function(item,i){
        output += '{';
        output += '"source":"'+getIndexByName(item.from,names)+'","target":"'+getIndexByName(item.to,names)+'","value":'+GOLOStoNumber(item.amount);
        if(i==trans.length-1){
            output += '}';    
        }else{
            output += '},';
        }    
    });
    output+=']';
    //console.log(output);
    return output;
}
var makeJSON = function(nodes,lines){
    return '{'+nodes+','+lines+'}';
}
var GOLOStoNumber = function(amount){
    return Number(amount.substr(0,amount.indexOf(' ')));
}






/*golos.api.getAccounts(currentNamesArray, function(err, result) {
    //console.log(result);
    result.forEach(function(item,i){
        var circ = new Object();
        
    });*/
                    
                    
                    //искать всевозможные транзакции между существующими участниками
                    //цикл по именам
                    /*names.slice(0,N).forEach(function(itemName){
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
                        
                    });*/
                    /*console.log('circs '+N);
                    redrawCircs(circs);
                    N++;
                });
                
            });*/