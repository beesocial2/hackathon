/*golos.config.set('websocket', 'wss://ws.testnet.golos.io');
golos.config.set('address_prefix', 'GLS');
golos.config.set('chain_id', '5876894a41e6361bde2e73278f07340f2eb8b41c2facd29099de9deef6cdb679');*/



//получает информацию о транзакциях и выдает json строку на выходе


/*Текущий кластер - для токена group в jsonData*/
var currentCluster = 1;
//var names = [];

/*accounts that are central at the moment*/
/*массив с именами, которые сейчас являются цетрами*/
var namesExpanded = [];

/*массив со всеми транзакциями*/
/*(решить вопрос с повторками и замыканием)*/
var trans = [];

/*массив с расширенной инфой об узлах - скорее всего не нужен*/
let namesExt = [];// more info about accounts

/*текущий кластер - работает как индекс для строки в двумерном массиве names*/
//var cluster = 0;

/*Двумерный массив для имен, хранит минимальную инфу для построения узлов*/
var names = new Array();


var getJsonData = function(currentName, newCluster, callback) {
    
    if(namesExpanded.length == 0) namesExpanded.push(currentName);
       
    //names = [];
    names = new Array();
    trans = [];
    
    /*create new cluster if this name has never been expanded*/
    /*создать новый кластер (новая строка в двумерном массиве names),
        если параметр newCluster выставлен в true и
        такого имени еще нет в массиве namesExpanded
    */
    if(newCluster && !isHere(currentName, namesExpanded) ) {
        
        /*additional nodes to new cluster*/
        /**/
        currentCluster++;
        
        /*central nodes are in the namesExpanded array*/
        addNew(currentName, namesExpanded);
    }
    
    namesExtended = [];
    
    
    /*функция пробегает по всем именам в namesExpanded - 
        один элемент этого массива - один центральный узел в графе.
        Все остальные имена выстраиваются вокруг них    
    */
    getNames(0, namesExpanded, function(result) {
        //console.log(result);
        callback(result);
    });
}


var getNames = function(cluster, namesExpanded, callback) {
    
    golos.api.getAccountHistory(namesExpanded[cluster], -1, 100, function(err, result) {
        names[cluster] = new Array();
        if(!err) {
            result.forEach( function(item) {
                if(item[1].op[0] == "transfer" ) {
                    
                    addNewToDSA(item[1].op[1].from, names, cluster);
                    addNewToDSA(item[1].op[1].to, names, cluster);
                    addNewTrans(item[1],trans);
                    
                    
                    //trans.push(item[1].op[1]);
                    
                    //let info = JSON.parse(item[1].op[1].memo);
                    //console.log('from: '+item[1].op[1].from+' to: '+item[1].op[1].to+' json: '+item[1].op[1].memo);
                }
            });
            console.log(names[cluster]);//текущая строка с окружением центрального имени
            console.log(namesExpanded);//какие имена центральные
            console.log(currentCluster);//номер группы (от 1 до ...)
            console.log(cluster+1);//номер строки в массиве (от 0 до ...)
            console.log(names);//полный массив имен
            console.log(trans);//список транзакций для всех имен в массиве names
            
            /*здесь массив names уже содержит все необходимые имена для построения узлов,
                а массив trans имеет транзакции без повторок и готов к построению связей
            */
            
            
            
            //это старое
            //=========================================================================================
            //console.log(trans);
            
            //console.log(namesToNodes(names,cluster+1));
            /*getAccountsInfo(names, function(result){
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
            });*/
            //=========================================================================================
            
            cluster++;
            if(cluster < namesExpanded.length) {
                //console.log('new call');
                getNames(cluster, namesExpanded, callback);
                
            } else {
                //console.log('result is ready');
                let result = dataToObject(names, trans);
                //console.log(result);
                callback(result);
            }
            
        } else {
            console.log(err);
        }
    });    
}


/*adds the element to the array if there is not the same one*/
/*функция в общем виде, работает, если element имеет базовый тип*/
var addNew = function(element, array) {
    let same = false;
    array.forEach(function(item){
        if(item == element) same = true;
    });
    if(same == false) array.push(element);
    return array;
}

/*Add new to double size array*/
var addNewToDSA = function(element, array, cluster) {
    let i=0,j=0,same=false;
    for(;i<array.length;i++){
        for(j=0;j<array[i].length;j++){
            if(array[i][j] == element) same = true;
        }
    }
    if(same == false) array[cluster].push(element);
    return array;
}

/*Says is the element in the array*/
var isHere = function(element, array) {
    let res = false;
    array.forEach(function(item){
        if(item==element) res=true;
    });
    return res;
}

/*Adds new transaction to the array if there's no matches with previous trx_id*/
var addNewTrans = function(element, array) {
    let same = true;
    
    array.forEach( function(item) {
        if( item.trx_id == element.trx_id) {
            same = false;
        }
    });
    
    if( same) {
        array.push(element);
    }
    return array;
}

/*Returns an index of the name in the array of nodes    */
var getIndexByNameFromNodes = function(name, nodes) {
    let index = -1;
    nodes.forEach(function(item, i) {
        if(name == item.name) index = i;
    });
    
    if(index == -1) {
        console.log('error in seeking index of name!');  
    } else {
        return index;
    }
}

/*Transforms recived data from blockchain to the valid json format for drawing the graph*/
var dataToObject = function(names, trans) {
    let output = {};
    output.nodes = [];
    output.links = [];
    
    /*names to nodes*/
    let i = 0;
    let j = 0;
    for(i=0; i < names.length; i++) {
        for(j=0; j < names[i].length; j++) {
            let node = {};
            node.name = names[i][j];
            node.group = i;
            output.nodes.push(node);
        }
    }
    
    /*transactions to links*/
    trans.forEach( function(item, i) {
        let link = {};
        link.source = getIndexByNameFromNodes(item.op[1].from, output.nodes);
        link.target = getIndexByNameFromNodes(item.op[1].to, output.nodes);
        link.value = GOLOStoNumber( item.op[1].amount );
        link.misc = item;
        output.links.push(link);
    });
    
    let result = JSON.stringify(output);
    return result;
}


/*var transfersToLines = function(trans,names){
    //"links":[{"source":1,"target":0,"value":10}]
    let output = '"links":[';
    trans.forEach(function(item,i){
        output += '{';
        output += '"source":"'+getIndexByName(item.from,names)+'","target":"'+getIndexByName(item.to,names)+'","value":'+GOLOStoNumber(item.amount);
        output += ',"misc":{"from":"'+item.from+'","to":"'+item.to+'"}';
        if(i==trans.length-1){
            output += '}';    
        }else{
            output += '},';
        }    
    });
    output+=']';
    console.log(output);
    return output;
}*/

/*var makeJSON = function(nodes,lines){
    return '{'+nodes+','+lines+'}';
}*/
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

