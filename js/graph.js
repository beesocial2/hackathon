       
$(document).ready(function(){

    var svg = d3.select("svg")
        .attr('width',window.innerWidth)
        .attr('height',window.innerHeigt)
    
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
            .attr("title",function(d){return '<p>'+d.type+'</p><p>'+d.name+'<p></p>'+d.description.substr(0,150)+'...</p>';});
        ;
        circle.exit().remove();
        $(function () {
            $('[data-toggle="tooltip"]').tooltip();
        });
     }
    
    //SVG------------------------------------------
       
    //DATA-----------------------------------------
    
    var visualize = function(names,transactions){
        var circs = [];
        var lines = [];
        
        golos.api.getAccounts(names, function(err, result) {
            console.log(result);
            /*result.forEach(function(item,i){
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
            N++;*/
        });//end of names cycle
    }//end of visualize
    
    
    
    var N=1;
    window.addEventListener('click',function(){
        
        circs = [];
        lines = [];
        //console.log(lines);
        var user;
        var currentNamesArray = names.slice(0,N);
        
        
    });
    
    
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
                for(i=0;i<circs.length;i++){
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
                console.log(typeFrom+' '+typeTo);
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
            
           
});
       
       