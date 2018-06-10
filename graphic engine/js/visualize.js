//var width = ,     // svg width
    //height = 600,     // svg height

var dr = 8,      // default point radius
    off = 10,    // cluster hull offset
    expand = {}, // expanded clusters
    data, net, force, hullg, hull, linkg, link, nodeg, node;

var curve = d3.svg.line()
    .interpolate("cardinal-closed")
    .tension(.85);

var fill = d3.scale.category20();

function noop() { return false; }

function nodeid(n) {
  return n.size ? "_g_"+n.group : n.name;
}

function linkid(l) {
  var u = nodeid(l.source),
      v = nodeid(l.target);
  return u<v ? u+"|"+v : v+"|"+u;
}

function getGroup(n) { return n.group; }

// constructs the network to visualize
function network(data, prev, index, expand) {
    expand = expand || {};
    var gm = {},    // group map
        nm = {},    // node map
        lm = {},    // link map
        gn = {},    // previous group nodes
        gc = {},    // previous group centroids
        nodes = [], // output nodes
        links = []; // output links

    // process previous nodes for reuse or centroid calculation
    if (prev) {
        prev.nodes.forEach(function(n) {
            var i = index(n), o;
            if (n.size > 0) {
                gn[i] = n;
                n.size = 0;
            } else {
                o = gc[i] || (gc[i] = {x:0,y:0,count:0});
                o.x += n.x;
                //o.x = 750;
                //o.y = 250;
                o.y += n.y;
                o.count += 1;
            }
        });
    }

  // determine nodes
    for (var k=0; k<data.nodes.length; ++k) {
        var n = data.nodes[k],
            i = index(n),
            l = gm[i] || (gm[i]=gn[i]) || (gm[i]={group:i, size:0, nodes:[]});
        
        if (expand[i]) {
            // the node should be directly visible
            nm[n.name] = nodes.length;
            nodes.push(n);
            if (gn[i]) {
                // place new nodes at cluster location (plus jitter)
                //n.x = gn[i].x + Math.random();
                //n.y = gn[i].y + Math.random();
                n.x = gn[i].x;
                n.y = gn[i].y;
            }
        } else {
            // the node is part of a collapsed cluster
            if (l.size == 0) {
                // if new cluster, add to set and position at centroid of leaf nodes
                nm[i] = nodes.length;
                nodes.push(l);
                if (gc[i]) {
                    //l.x = gc[i].x / gc[i].count;
                    //l.y = gc[i].y / gc[i].count;
                    l.x = 700;
                    l.y = 250;
                }
            }
            l.nodes.push(n);
        }
        // always count group size as we also use it to tweak the force graph strengths/distances
        l.size += 1;
        n.group_data = l;
    }

    for (i in gm) { gm[i].link_count = 0; }

    // determine links
    for (k=0; k<data.links.length; ++k) {
        var e = data.links[k],
            u = index(e.source),
            v = index(e.target),
            g = e.value;
        //console.log(e);
        if (u != v) {
            gm[u].link_count++;
            gm[v].link_count++;
        }
        u = expand[u] ? nm[e.source.name] : nm[u];
        v = expand[v] ? nm[e.target.name] : nm[v];
        
        var i = (u<v ? u+"|"+v : v+"|"+u),
            l = lm[i] || (lm[i] = {source:u, target:v, size:0, amount:g });
        l.size += 1;
    }
    
    for (i in lm) { links.push(lm[i]); }
        
    return {nodes: nodes, links: links};
}

function convexHulls(nodes, index, offset) {
  var hulls = {};

  // create point sets
  for (var k=0; k<nodes.length; ++k) {
    var n = nodes[k];
    if (n.size) continue;
    var i = index(n),
        l = hulls[i] || (hulls[i] = []);
    l.push([n.x-offset, n.y-offset]);
    l.push([n.x-offset, n.y+offset]);
    l.push([n.x+offset, n.y-offset]);
    l.push([n.x+offset, n.y+offset]);
  }

  // create convex hulls
  var hullset = [];
  for (i in hulls) {
    hullset.push({group: i, path: d3.geom.hull(hulls[i])});
  }

  return hullset;
}

function drawCluster(d) {
    return curve(d.path); // 0.8
}

// --------------------------------------------------------

var init = function (jsonData) {
    
    //очистка контейнера svg здесь - удалить все три группы
    //третья строчка на всякий случай - переселект чтобы удалить
    //все ссылки на бывшие узлы.
    var s = d3.selectAll('svg g');
    s = s.remove();
    //s = d3.selectAll('svg g');
    
    data = JSON.parse(jsonData);
    console.log(data);
   
    for (var i=0; i<data.links.length; ++i) {
        o = data.links[i];
        o.source = data.nodes[o.source];
        o.target = data.nodes[o.target];
    }
    hullg = vis.append("g");
    linkg = vis.append("g");
    nodeg = vis.append("g");
    //init();
    vis.attr("opacity", 1e-6)
        .transition()
        .duration(1)
        .attr("opacity", 1);
    
    /*d3.json("", function(json) {
        
    });*/
    
    if (force) force.stop();

    net = network(data, net, getGroup, expand);
    
    console.log(data);
    console.log(net);
    force = d3.layout.force()
        .nodes(net.nodes)
        .links(net.links)
        .size([width, height])
        .linkDistance(function(l, i) {
        var n1 = l.source, n2 = l.target;
        // larger distance for bigger groups:
        // both between single nodes and _other_ groups (where size of own node group still counts),
        // and between two group nodes.
        //
        // reduce distance for groups with very few outer links,
        // again both in expanded and grouped form, i.e. between individual nodes of a group and
        // nodes of another group or other group node or between two group nodes.
        //
        // The latter was done to keep the single-link groups ('blue', rose, ...) close.
        return 200 +
        Math.min(20 * Math.min((n1.size || (n1.group != n2.group ? n1.group_data.size : 0)),
                             (n2.size || (n1.group != n2.group ? n2.group_data.size : 0))),
           -30 +
           30 * Math.min((n1.link_count || (n1.group != n2.group ? n1.group_data.link_count : 0)),
                         (n2.link_count || (n1.group != n2.group ? n2.group_data.link_count : 0))),
           100);
        //return 150;
    })
        .linkStrength(function(l, i) {
            return 1;
        })
        .gravity(0.05)   // gravity+charge tweaked to ensure good 'grouped' view (e.g. green group not smack between blue&orange, ...
        .charge(-1000)    // ... charge is important to turn single-linked groups to the outside
        .friction(0.1)   // friction adjusted to get dampened display: less bouncy bouncy ball [Swedish Chef, anyone?]
        .start();

    hullg.selectAll("path.hull").remove();
    hull = hullg.selectAll("path.hull")
        .data(convexHulls(net.nodes, getGroup, off))
        .enter().append("path")
        .attr("class", "hull")
        .attr("d", drawCluster)
        .style("fill", function(d) { return fill(d.group); })
        .on("click", function(d) {
            console.log("hull click", d, arguments, this, expand[d.group]);
            expand[d.group] = false; init(jsonData);
        });

    link = linkg.selectAll("line.link").data(net.links, linkid);
    link.exit().remove();
    link.enter().append("line")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .attr("ID", function (d,i) { return i;})
        .attr("title", function(d){
            console.log(d);
            if( expand[d.source.group] && expand[d.target.group] ) {
                return makeLinkInfoString(d.target.name, d.source.name, false);
            } else {
                return '';  
            }
        })
        .style("stroke-width", function(d) { return d.size+3 || 3; })
        .on("mouseover",function(d) {
            //let toNameId = getIndexByNameFromData(d.target.name);
            //let fromNameId = getIndexByNameFromData(d.source.name);
            //writeInfoAbout('links between: '+d.source.name+' ('+fromNameId+') and '+d.target.name+' ('+toNameId+') ','link');
            if( expand[d.source.group] && expand[d.target.group] ) {
                writeInfoAbout(makeLinkInfoString(d.target.name, d.source.name, true), 'link') ;
            } else {
                return '';  
            }
            //writeInfoAbout(this.getAttribute('title'),'link');
        });

    node = nodeg.selectAll("circle.node").data(net.nodes, nodeid);
    node.exit().remove();
    node.enter().append("circle")
        // if (d.size) -- d.size > 0 when d is a group node.
        .attr("class", function(d) { return "node" + (d.size?"":" leaf"); })
        .attr("r", function(d) { return d.size ? d.size + dr : dr+1; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("ID",function(d){ return getIndexByNameFromData(d.name); })
        .attr("title",function(d) { 
            
            if(expand[d.group]){
                //этот узел развернут
                return 'id: '+ getIndexByNameFromData(d.name) + ', name: ' + d.name; 
            } else {
                //кластер закрыт
                return 'cluster: ' + d.group;
            }
            
        })
        .style("fill", function(d) { return fill(d.group); })
        .on("click", function(d) {
            console.log("node click", d, arguments, this, expand[d.group]);
            if(expand[d.group]){
                
                //только для узлов в открытом кластере
                //printInfo('node click '+d.name);
                writeInfoAbout('node click '+d.name, 'node');
                
                //вызов метода дополнения jsonData
                getJsonData(d.name, true, function(result){
                    jsonData = result;
                    init(jsonData);
                });
                
            } else {
                expand[d.group] = !expand[d.group];
                init(jsonData);
            }
            
        })
        .on("mouseover",function(d) {
            if(expand[d.group]){
                writeInfoAbout('id: '+getIndexByNameFromData(d.name)+', name: '+d.name, 'node');
                //printInfo('id: '+getIndexByNameFromData(d.name)+', name: '+d.name);
            }
        });
        /*.on("mouseout",function(d) {
            if(expand[d.group]){
                printInfo('id: '+getIndexByNameFromData(d.name)+', name: '+d.name);
            }
            //console.log("node hover out");
        });*/

    node.call(force.drag);
    
    force.on("tick", function() {
        if (!hull.empty()) {
            hull.data(convexHulls(net.nodes, getGroup, off))
                .attr("d", drawCluster);
        }
        
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    
        node.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });
    
    tippy('circle.node');
    tippy('line.link');
}

var printInfo = function(text){
    let block = document.getElementById('graph-description');
    //block.innerHTML = '';
    block.innerHTML += '<p>'+text+'</p>';
}

var getIndexByNameFromData = function(name) {
    let index = null;
    data.nodes.forEach(function(item, i) {
        if(name == item.name) index = i;
    });
    
    if(index == null) {
        console.log('error name '+name+' not found in visualize str: 290 !');  
    } else {
        return index;
    }
}

/*Returns list of all transactions between given nodes*/
var getExtendedDataAboutTrans = function(nameFrom, nameTo) {
    let result = [];
    data.links.forEach( function(item, i) {
        if( (item.misc.op[1].from == nameFrom && item.misc.op[1].to == nameTo) ||
            (item.misc.op[1].from == nameTo && item.misc.op[1].to == nameFrom)
          ) {
            result.push(item);
        }
    });
    return result;
}

/*Builds a text about some transactions between given nodes*/
var makeLinkInfoString = function(nameFrom, nameTo, extended) {
    let toNameId = getIndexByNameFromData(nameTo);
    let fromNameId = getIndexByNameFromData(nameFrom);
    
    let info = getExtendedDataAboutTrans(nameFrom, nameTo);
    let result = '';
    info.forEach( function(item, i) {
        result += ( '' +(i+1)+ ') from: ' +item.source.name+ ', to: ' +item.target.name+ ', amount: ' +item.value+ 'GOLOS');
        if(extended == true) {
            result += (', trx_id: ' +item.misc.trx_id);
        }
        
        if(i != info.length) {
            result += '<br>';
        }
    });
    return result;
}

/*Makes message box with text about node or link when a certain event is triggered*/
var writeInfoAbout = function(text, about) {
    document.getElementById('graph-description').innerHTML = '';
    let message = document.createElement('div');
    message.classList = 'alert';
    if( about == 'node') {
        message.classList += ' alert-primary';
        message.innerHTML = 'Nodes:<br> ';
    } else if (about == 'link') {
        message.classList += ' alert-success';
        message.innerHTML = 'Links:<br> ';
    }
    message.innerHTML += text;
    document.getElementById('graph-description').appendChild(message);
}

//var getInfoAboutNode = function(){};
//var getLinks = function(from,to){};
