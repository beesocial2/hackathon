/*golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');*/



//получает информацию о транзакциях и выдает json строку на выходе


//var currentName = 'beesocial';
var currentCluster = 1;
var names = [];
var trans = [];
let namesExt = [];


var getJsonData = function(currentName,callback){
    
    names = [];
    trans = [];
    namesExtended = [];
    
    
    
    
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
            console.log(names);
            getAccountsInfo(names, function(result){
                namesExt = result;
                //let output = namesToNodes(names,namesExt);
                //console.log(output);
                //console.log( JSON.parse(output));
                let jsonData = makeJSON(namesToNodes(names,namesExt),transfersToLines(trans,names));
                callback(jsonData);
                //console.log(trans);
                //console.log(json_metadata);
                //console.log(JSON.parse(json_metadata));
                //console.log('{"nodes":[{"name":"Myriel","group":1},{"name":"Myriel1","group":1}]}');
                //console.log(JSON.parse('{"nodes":[{"name":"Myriel","group":1},{"name":"Myriel1","group":1}]}'));
                //console.log(namesToNodes(names));
            });
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
var namesToNodes = function(names,namesExt){
    //"nodes":[{"name":"Myriel","group":1},{"name":"Myriel3","group":1}];
    let output = '"nodes":[';
    names.forEach(function(item,i){
        output += '{';
        output += '"name":"'+item+'","group":'+currentCluster;//+',';
        //output += '"misc":'+namesExt[i];
        if(i==names.length-1){
            output += '}';    
        }else{
            output += '},';
        }    
    });
    output+=']';
    console.log(output);
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

//returns an array of json strings with additional data of accounts
var getAccountsInfo = function(names,callback){
    let resultArray = [];
    
    golos.api.getAccounts(names, function(err, result) {
        if(!err){
            console.log(result);
            result.forEach(function(item,i){
                let el = new Object();
                el.id = item.id;
                el.name = item.name;
                //el.json_metadata = item.json_metadata;
                //console.log("id: "+item.id+", name: "+item.name+", json_metadata: "+item.json_metadata);
                resultArray.push(JSON.stringify( el));
            });
            callback(resultArray);
        }
    });
}

