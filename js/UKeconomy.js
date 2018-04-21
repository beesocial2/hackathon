"use strict";

//--------------************ SECTION 0: Common functions************-----------

function anim_stop()
{
d3.selectAll(".anim_element").transition().duration(0);
}

function clear()
{
    anim_stop();
    $('.remove_on_reload').remove();
    $('.default').prop('selected', true);
    $('#startAnimation').text('Start animation');
}

function middle_range(range)
{
    var middle_range;
    var middle = range.length/2;
    if (range.length%2 == 0)
    {
	var scale = d3.scale.linear()
            .domain([0,1])
            .range(range[middle-1],range[middle]);
	middle_range = scale(0.5);
    }
    else { middle_range = range[Math.floor(middle)]; }
    return middle_range;
}


function uniformDomainRange(metadata,range)
{
    //return a domain suitable for inputting into a D3 scale function; Nlevels evenly spaced between the min and max of the metadata 
    var domain = [];
    if (metadata.min && metadata.max) { for (var i=0;i<range.length;i++) {domain.push(  metadata.min + i*(metadata.max-metadata.min)/(range.length-1)  ); }}
    return {"domain": domain, "range":range};
}

function centredDomainRange(metadata,range,centre)
{
    var N = range.length;
    var centre_in_range = centre > metadata.min && centre < metadata.max;
    var insert_middle = centre_in_range && N%2 === 0; //if the given centre is within the expected domain, there must be an odd number in the returned range/domain so that the centre is represented by the middle element
    if (insert_middle) 
    {
	N++;
	range.splice(Math.floor(N/2),0,middle_range(range));
    }   
    var domain = [];
    for (var i=0;i<N;i++)
    {
	var increment = centre_in_range? ((i <= N/2)? (centre - metadata.min) : (metadata.max - centre))/Math.floor(N/2) : (metadata.max-metadata.min)/(N-1);
	var addto =  centre_in_range? ((i <= N/2)? metadata.min : centre) : metadata.min;
	var multip =  centre_in_range? ((i <= N/2)? i : i-Math.floor(N/2)) : i;
	domain[i] = addto + multip*increment;
    }
    return {"domain": domain, "range":range};
}

function onlyUnique(value, index, self) { 
//callback for use in conjunction with .filter() to get unique values of an array
    return self.indexOf(value) === index;
}

function log_absolute(v,fac)
{
    return (v === 0)? v : Math.pow(-1,v<0)*Math.log(fac*Math.abs(v)+1); 
}

function reverse_log_absolute(v,fac)
{
    return v = (v === 0)? v : Math.pow(-1,v<0)*(Math.exp(Math.pow(-1,v<0)*v) - 1)/fac;
}


function greater(z,x)
{
    return z > x? z : x;
}

function lesser(z,x)
{
    return z < x? z : x;
}


//-----------------------------main function--------------------------------------------

function launch_IOmodel(quantity,nodeColorVariableStr,nodeRadiusVariableStr,color_scale,display_thresholds,anim_speed)
{
    //--------------************ SECTION 1: Object methods************--------
    //-------------------------------------------------------------------------

    //--------------************ SECTION 2: Settings ************--------------

    var mag_fac = 1.25;
    var color_scale_options = {"multi_colored":['#E6FFFF','blue','green','#FFCC00','red','#751947','#2F0A1C'], "grayscale": ['white','black']};

    var settings = {
	"force": {"initial":{"charge": display_thresholds.link.min >= 1000? -650*mag_fac : -(mag_fac*(1267.5 - 0.6875*display_thresholds.link.min)), "gravity": 0.3, "linkDistance": 40, "friction": 0.3},"mousedown":{"charge":-600}},
	"offset": {"x":-130,"y":-85},
	"color": {"range": color_scale_options[color_scale]},
	"node": {"radius": {"min": mag_fac*3, "max": mag_fac*10}, "highlight":"magenta"},
	"ring": {"radius": mag_fac*225},
	"time": {"data": {"startYear": 0, "endYear": 0},"display": {"startYear": 0, "endYear": 0},"relbaseYear": 0},
	"animation": {"delay":0, "duration":anim_speed},
	"labels": {"node_info": {"xf": function() {return width/2+settings.ring.radius+15+settings.offset.x;}},"margin":200}
    };

    var nodeVariables = {
	"current": 
	{
	    "addtoStartYear" : false,
	    "node" :
	    {
		"domainRange": function(metadata) {return uniformDomainRange(metadata,settings.color.range);},
		"calcDisplayData": function(quantity,year) {return quantity[year];}
	    },
	    "info" :
	    {
		"calcDisplayData": function(quantity,year) {return quantity[year];}
	    }
	},
	"relative": 
	{
	    "addtoStartYear" : true,
	    "node" :
	    {
		"domainRange": function(metadata) {return centredDomainRange(metadata,settings.color.range,0);},
		"calcDisplayData": function(quantity,year) {return Math.log(quantity[year]/quantity[settings.time.relbaseYear]);},
	//	"key_scale": function(range,domain,base) {return d3.scale.linear().range(range).domain(domain);}, //scale for key axis    
		"key_reverse": function(x) {return Math.exp(x);},
//		"ticks": function(mn,mx) {return [mn,0.5,1,2,5,10,mx];}, //ticks for key axis
		"ticks": function(mn,mx) {return [mn,0.1,0.2,0.5,1,2.5,10,mx];}, //ticks for key axis
		"tickFormat": '.1f',
		"key_label": 'times 1997 level'
	    },
	    "info" :
	    {
		"calcDisplayData": function(quantity,year) {return quantity[year]/quantity[settings.time.relbaseYear];}   
	    }
	},
	"proportion": 
	{
	    "addtoStartYear" : false,
	    "node" :
	    {
		"domainRange": function(metadata) {return uniformDomainRange(metadata,settings.color.range);},
		"calcDisplayData": function(quantity,year,agg_data) {return quantity[year]/agg_data[year];} 
	    },
	    "info" :
	    {
		"calcDisplayData": function(quantity,year,agg_data) {return quantity[year]/agg_data[year];} 
	    }
	},
	"change": 
	{
	    "addtoStartYear" : true,
	    "node" :
	    {
		"domainRange": function(metadata) {return centredDomainRange(metadata,settings.color.range,0);},
		"calcDisplayData": function(quantity,year) {return log_absolute((quantity[year]-quantity[year-1])/quantity[year-1],5);}, 
	//	"key_scale": function(range,domain,base) {return d3.scale.log().base(base).range(range).domain(domain);}, 
		"key_reverse": function(x) {return reverse_log_absolute(x,5);},
//		"ticks": function(mn,mx) {return [100*mn,-40,-10,0,10,40,80,100*mx];}, //ticks for key axis
		"ticks": function(mn,mx) {return [100*mn,-30,-10,0,10,30,100*mx];}, //ticks for key axis
		"tickFormat" : ',f',
		"key_label": '% annual change'
	    },
	    "info" :
	    {
		"calcDisplayData": function(quantity,year) {return (quantity[year]-quantity[year-1])/quantity[year-1];} 
	    }
	}
    };

    var linkVariables =  {
	"relative": 
	{
	    "addtoStartYear" : true,
	    "link" :
	    {
		"domainRange": function(metadata) {return centredDomainRange(metadata,settings.link.color.range,0);},
		"calcDisplayData": function(value,year) {return Math.log(value[year]/value[settings.time.relbaseYear]);},
		"valueExists": function(value,year) {return Boolean(value[year] && value[settings.time.relbaseYear]);}
	    },
	    "info" :
	    {
		"valueExists": function(value,year) {return Boolean(value[year] && value[settings.time.relbaseYear]);},
		"calcDisplayData": function(value,year) { return this.valueExists(value,year)? value[year]/value[settings.time.relbaseYear] : undefined; } 
	    }
	},
	"change": 
	{
	    "addtoStartYear" : true,
	    "link" :
	    {
		"domainRange": function(metadata) {return centredDomainRange(metadata,settings.link.color.range,0);},
//		"calcDisplayData": function(value,year) {return (value[year]-value[year-1])/value[year-1];},
		"calcDisplayData": function(value,year) {return log_absolute((value[year]-value[year-1])/value[year-1],5);},
		"valueExists": function(value,year) {return Boolean(value[year] && value[year-1]);}
	    },
	    "info" :
	    {
		"valueExists": function(value,year) {return Boolean(value[year] && value[year-1]);},
		"calcDisplayData": function(value,year) { return this.valueExists(value,year)? (value[year]-value[year-1])/value[year-1] : undefined; }  
	    }
	}
    };

    //--------------************ SECTION 3: basic SVG elements ************----

    var width = mag_fac*d3.select('#displaybox').attr('width') - settings.labels.margin,
    height = mag_fac*d3.select('#displaybox').attr('height');
//    var force_pos_dim = {"x":width/2-50,"y":height/2,"w":width,h:"height"};

    var svg = d3.select('#displaybox');

    var force = d3.layout.force()
	.charge(settings.force.initial.charge)
	.gravity(settings.force.initial.gravity)
	.linkDistance(settings.force.initial.linkDistance)
	.friction(settings.force.initial.friction)
	.size([width, height]);

    svg.append('g')
	.attr('id','hover')
	.append('rect')
	.attr('x',settings.labels.node_info.xf()-5)
	.attr('y',0)
	.attr('height',height)
	.attr('width',300)
	.style('fill','#FBFBFB')
	.style('opacity',1);

    //arrows for ends of lines
    svg.append("svg:defs").selectAll("marker")
	.data(["end"])   
	.enter().append("svg:marker")    
	.attr("id", String)
	.attr('class','arrow')
	.attr("viewBox", "0 -5 10 10")
	.attr("refX", 10)
	.attr("refY", 0)
	.attr("markerWidth", 6)
	.attr("markerHeight", 6)
	.attr("markerUnits","userSpaceOnUse")
	.attr("orient", "auto")
	.append("svg:path")
	.attr("d", "M0,-5L10,0L0,5");

   //text-------------
    var loading = svg.append("text")
	.attr('id','msg')
	.attr("x", width / 2)
	.attr("y", height / 2)
	.style("text-anchor", "middle")
	.text("Drawing network ... please wait");

    svg.append('text')
	.attr('id','time')
	.attr('class','time_label anim_element remove_on_reload')
	.attr('x',width/2+settings.offset.x)
	.attr('y',20)
	.style("text-anchor", "middle");

    d3.select('#hover').append('text')
	.attr("x",settings.labels.node_info.xf()+30)
	.attr('y',0.5*height+settings.offset.y)
	.text('Hover over node for sector information')
	.style('opacity',0.5);

    var node_info = [
	{"tx":function() {return 'index';},"id":'ni_index',"type":"identifier"},
	{"tx":function() {return 'code';},"id":'ni_code',"type":"identifier"},
	{"tx":function() {return 'name';},"id":'ni_name',"type":"identifier"},
	{"tx":function() {return quantity;},"id":'ni_quantity',"varb":"current","type":"data", "infoNumber":function(d) {return '&pound;'+(d/1000).toFixed(1)+' billion';}},
	{"tx":function() {return '% of '+(quantity === 'output'? 'gross output' : 'GDP');},"id":'ni_propquantity',"varb":"proportion","type":"data","infoNumber":function(d) {return (100*d).toFixed(2)+'%';}},
	{"tx":function() {return 'relative to 1997';},"id":'ni_relative',"varb":"relative","type":"data","infoNumber":function(d) {return d.toFixed(1)+'x';}},
	{"tx":function() {return 'change on previous year';},"id":'ni_change',"varb":"change","type":"data","infoNumber":function(d) {return (100*d).toFixed(1)+'%';}}
    ];
    var node_info_g = svg.append('g')
	.attr('id','node_info')
	.attr('class','remove_on_reload')
	.attr("transform","translate("+settings.labels.node_info.xf()+",100)")
	.selectAll('.node_info').data(node_info).enter().append('text')
	.attr('class','node_info')
	.attr('id',function(d) {return d.id;})
	.attr('x',0)
	.attr('y',function(d,i) {return i*14;})
	.style('fill-opacity',0)
	.style('stroke-opacity',0)
	.text('');

    d3.select('#node_info').append('text')
	.attr('class','time_label node_info anim_element remove_on_reload')
	.attr('x',0)
	.attr('y',0)
	.style('fill-opacity',0)
	.style('stroke-opacity',0);

    var key_labels = [{'tx':'Key','x':24,'y':20},{'tx':'','x':20,'y':244,'id':'key_label_quant'},{'tx':'','x':20,'y':254,'id':'key_label'},{'tx':'(log scale)','x':20,'y':264,'id':'key_label_log'}];
    var keyg = d3.select('svg')
	.append('g')
	.attr('id','key')
    	.attr('transform','translate(-20,0)')
	.selectAll('.key_labels').data(key_labels).enter()
	.append('text')
	.attr('id',function(d) {return d.id? d.id : undefined})
	.attr('x',function(d) {return d.x;})
	.attr('y',function(d) {return d.y;})
	.text(function(d) {return d.tx;})
	.style('font-size',function(d,i) {return i===0? undefined : '10px'});

    d3.select('#key').append('rect')
	.attr('id','keyrect')
	.attr('x',25)
	.attr('y',30)
	.attr('width',20)
	.attr('height',200)
//	.style('stroke','grey')
	.attr('fill','url(#grad1)');

    var highlit_agent_index;

    //-------------------------------------------------------------------------

    //--------------************ SECTION 4: read in and manipulate data *******


    d3.json("IntCon.json", function(error, economy) {

	var nodeColorVariable,  nodeRadiusVariable, linkVariable, node_color, link_color, link_opacity, link_strokeWidth;

    //************ SECTION 4.A: sub-functions

	function do_animation()
	{		  
	    var tm = parseInt(d3.select('#time').text());
	    var is_start = Boolean(($("#startAnimation").text()).match(/Start/));
	    $("#startAnimation").text('Pause');
	    tm = is_start? settings.time.display.startYear : tm;
	    d3.selectAll('.node').transition()
		.delay(0)
		.duration(0)
		.call(update_network,tm,is_start? '' : tm);
	}

	function restart_animation()
	{
	    anim_stop();
	    d3.select('#time').text(settings.time.display.startYear);
	    static_update_network();
	    do_animation();
	}

	//************ SECTION 4.A.i: general
	var calcRadius = function(quantity,year,agg_data) {
	     var calibration_range = {"min": economy.metadata.node.radius.min,"max": economy.metadata.node.radius.max};
	    var datum = this.calcDisplayData(quantity,year,agg_data);
	    var pc = (datum - calibration_range.min)/(calibration_range.max - calibration_range.min);
	    var v = settings.node.radius.min + pc*(settings.node.radius.max -  settings.node.radius.min);
	    return v;
	};

	function calcDisplayMinMax(components,seriesName,variable,legendInfo)
	{
	   // find min and max for display
	    var element_name = components === 'agents'? 'node' : 'link';
	    var calcDisplayData = variable[element_name].calcDisplayData;
	    if (!economy.metadata[element_name]) {economy.metadata[element_name] = {"color":{}, "info":{}};}
	    if (element_name === 'node') {economy.metadata[element_name].radius = {};}
	    economy.metadata[element_name][legendInfo].min = calcDisplayData(economy[components][0][seriesName],settings.time.display.startYear+variable.addtoStartYear,economy.metadata[seriesName].tot);  
	    economy.metadata[element_name][legendInfo].max = economy.metadata[element_name][legendInfo].min;
	    economy.metadata[element_name].info.min = variable.info.calcDisplayData(economy[components][0][seriesName],settings.time.display.startYear+variable.addtoStartYear,economy.metadata[seriesName].tot);  
	    economy.metadata[element_name].info.max = economy.metadata[element_name].info.min;
	    var subset_elements = economy[components].filter(function(d){return components === 'agents' || d.display;});
	    for (var c=0;c<subset_elements.length;c++) 
	    {
		var years = Object.keys(subset_elements[c][seriesName]).sort(function(a, b){return a-b});
		if (variable.addtoStartYear) {years.shift();}
		for (var y in years)
		     {
			 var v = calcDisplayData(subset_elements[c][seriesName],years[y],economy.metadata[seriesName].tot);
			 economy.metadata[element_name][legendInfo].min = lesser(v,economy.metadata[element_name][legendInfo].min);
			 economy.metadata[element_name][legendInfo].max = greater(v,economy.metadata[element_name][legendInfo].max);
		//	 if (seriesName === 'value' && v > 10) {alert(years[y]+': '+subset_elements[c].source+' '+subset_elements[c].target);}

			 v = variable.info.calcDisplayData(subset_elements[c][seriesName],years[y],economy.metadata[seriesName].tot);
			 economy.metadata[element_name].info.min = lesser(v,economy.metadata[element_name].info.min);
			 economy.metadata[element_name].info.max = greater(v,economy.metadata[element_name].info.max);
		     }
	    }
	}

	function loadVariable()
	{
	    nodeColorVariable = nodeVariables[nodeColorVariableStr];
	    nodeRadiusVariable = nodeVariables[nodeRadiusVariableStr];
	    linkVariable = linkVariables[nodeColorVariableStr];

	    settings.time.data.startYear = economy.metadata.startYear;
	    settings.time.display.startYear = economy.metadata.startYear + (nodeColorVariable.addtoStartYear > nodeRadiusVariable.addtoStartYear? nodeColorVariable.addtoStartYear : nodeRadiusVariable.addtoStartYear);
	    settings.time.data.endYear = economy.metadata.endYear;
	    settings.time.display.endYear = economy.metadata.endYear;
	    settings.time.relbaseYear = settings.time.data.startYear;

	    calcDisplayMinMax("input","value",linkVariable,'color');  
	    calcDisplayMinMax("agents",'output',nodeColorVariable,'color');
	    economy.metadata.color = {"min":lesser(economy.metadata.node.color.min,economy.metadata.link.color.min),"max":greater(economy.metadata.node.color.max,economy.metadata.link.color.max)};
	    calcDisplayMinMax("agents",'gva',nodeColorVariable,'color');
	    economy.metadata.color = {"min":lesser(economy.metadata.node.color.min,economy.metadata.color.min),"max":greater(economy.metadata.node.color.max,economy.metadata.color.max)};
	    calcDisplayMinMax("agents",quantity,nodeRadiusVariable,'radius');
	   // alert(economy.metadata.link.color.max);

	    var scale_args = nodeColorVariable.node.domainRange(economy.metadata.color); 
	    node_color = d3.scale.linear() //node_color and link_color need to have the same scale so that two keys aren't needed
		.domain(scale_args.domain)
		.range(scale_args.range);
	    link_color = d3.scale.linear()
		.domain(scale_args.domain)
		.range(scale_args.range);

	    link_opacity = d3.scale.linear()
		.domain([economy.metadata.link.color.min,economy.metadata.link.color.max])
		.range([0.25,1]); 
	    link_strokeWidth = d3.scale.linear()
		.domain([economy.metadata.link.color.min,economy.metadata.link.color.max])
		.range([0.25,2]); 	 

	    nodeRadiusVariable.node.calcRadius = calcRadius;

	     //add key
	    var Ncolors = settings.color.range.length;
	    var key_data = [];
	    var key_scale_domain = [];
	    var key_scale_range = [];
	    for (var c=0;c<Ncolors;c++) 
	    { 
		var x = scale_args.domain[c];//economy.metadata.color.min + c*(economy.metadata.color.max - economy.metadata.color.min)/(Ncolors-1) ;
		key_data[c] = {
		    "color_represents": x,
		    "actual_value": nodeColorVariable.node.key_reverse(x) 
		};
		key_scale_domain[c] =  (nodeColorVariableStr === 'change'? 100 : 1)*key_data[c].actual_value;
	    }
	    for (var c=0;c<Ncolors;c++) 
	    { 
		key_data[c].offset = c/(Ncolors-1);//(key_data[c].color_represents - key_data[0].color_represents)/(key_data[Ncolors-1].color_represents - key_data[0].color_represents);
		key_scale_range[c] = d3.select('#keyrect').attr('height')*key_data[c].offset;
	//	alert(key_data[c].color_represents+' '+key_data[c].actual_value+' '+key_data[c].offset+' '+key_scale_range[c]+' '+node_color(x));
	    }
	   
	  //  alert(key_scale_range);
	    key_data.reverse();
	    d3.select('#grad1').selectAll('.key_stop').data(key_data).enter()
		.append('stop')
		.attr('offset',function(d) { return (100*(1-d.offset)).toFixed(0).toString()+'%';}) 
		.style('stop-color', function(d,i) {return settings.color.range[Ncolors-i-1];})//node_color(d.color_represents);})
		.attr('stop-opacity',1); 

	    var key_scale = d3.scale.linear()
		.domain(key_scale_domain.reverse())
		.range(key_scale_range);
	
	    $('#key_label').text(nodeColorVariable.node.key_label);
	    $('#key_label_quant').text(quantity === 'gva'? 'GVA' : quantity);
	    var key_axis = d3.svg.axis().scale(key_scale).orient('right').tickValues(nodeColorVariable.node.ticks(key_data[0].actual_value,key_data[Ncolors-1].actual_value)).tickFormat(d3.format(nodeColorVariable.node.tickFormat));
	    d3.select('#key').append('g').attr("class", "axis remove_on_reload").attr('transform','translate(55,30)').style('font-size','10px').call(key_axis);
	}



	//************ SECTION 4.A.ii: display
	var get_link_style = function(scale,value_ts,year) { return linkVariable.link.valueExists(value_ts,year)? scale(linkVariable.link.calcDisplayData(value_ts,year)) : scale(economy.metadata.link.color.min); }


	function node_info_format(node_info,datum)
	{
	    var tx = node_info.tx();
	    return tx === 'index'? datum : ( (tx === 'name'? 'sector' : tx)  +":\t"+datum.toString() );
	}

	function calc_node_datum(e,tm)
	{
	    var datum_key = node_info[e].type === 'data'? quantity : node_info[e].tx();
	    var calcDisplayData = node_info[e].type === 'data'? nodeVariables[node_info[e].varb].info.calcDisplayData : undefined;
	    node_info[e].datum = node_info[e].type === 'data'? calcDisplayData(economy.agents[highlit_agent_index][datum_key],tm,economy.metadata[quantity].tot) : economy.agents[highlit_agent_index][datum_key];
	    node_info[e].datum = node_info[e].tx() === 'name'? node_info[e].datum.toLowerCase() : node_info[e].datum;
	    node_info[e].datum = node_info[e].varb? node_info[e].infoNumber(node_info[e].datum) : node_info[e].datum;
	}

	function update_node_info(tm) 
	{
	    for (var e in node_info) 
	    { 
		var id = node_info[e].id;
		calc_node_datum(e,tm,highlit_agent_index);
		if (node_info[e].datum) { 
		    d3.select('#'+id)
			.style('fill-opacity',(node_info[e].tx() === 'index')? 0 : 1)
			.text(node_info_format(node_info[e],node_info[e].datum));
		   // if (node_info[e].type === 'data') { d3.select('#'+id).attr('class','node_info update_me');}
		}
	    }
	}

	function highlight_node(node)
	{
	    d3.select("#hover").remove();
	    var new_color = settings.node.highlight;
	    d3.selectAll(".node").style("stroke","none").style("stroke-width",0);
	    d3.select(node).style("stroke", new_color).style("stroke-width",'2px').classed('highlit');
	    d3.selectAll('.time_label').style('fill-opacity',1);

	    var gx = settings.labels.node_info.xf(); 
	    var gy = (economy.agents[highlit_agent_index].perm_y? economy.agents[highlit_agent_index].perm_y : economy.agents[highlit_agent_index].y - 10)+settings.offset.y;
	    gy = gy > 575? 575: gy;
	    d3.select("#node_info").attr("transform","translate("+gx+','+gy+")");
	    update_node_info(d3.select('#time').text(),highlit_agent_index);
	}

	
	var curvy_link = function(d) {
	    //based on links for directional graph courtesy of 'd3noob' see: http://bl.ocks.org/d3noob/5141278
	    //adjusted to put path end for targets to be on the radius, not centre, so arrows don't get rendered invisible by large nodes
	    var r_n = nodeRadiusVariable.node.calcRadius(d.target[quantity],settings.time.display.startYear,economy.metadata[quantity].tot); //radius of node
	    var dx =  d.source.x - d.target.x,
	    dy =  d.source.y - d.target.y,
	    arc_r = Math.sqrt(dx * dx + dy * dy);  //radius of circle arc making up arrow

	    var psi = 2*Math.asin(0.5);    //see test_curvy_links_expl.html: angles and distances needed to work out coordinates of where arrow enters node
	    var mx = 0.5*dx + 0.5*dy*Math.sqrt(3);
	    var rho = Math.pow(-1,dy>0 && dx<0)*Math.acos(mx/arc_r);
	    var my = Math.pow(-1,dy<0 && dx<0)*arc_r*Math.sin(rho);
	    var theta = Math.pow(-1,dy<0 && dx<0)*2*Math.asin(r_n/(2*arc_r));
	    var arc_centre = {x:d.target.x + mx, y:d.target.y - my};

	    var new_x = arc_centre.x + arc_r*Math.cos(theta + rho + Math.PI),  //Cartesian coordinates of where arrow enters node
	    new_y = arc_centre.y - Math.pow(-1,dy<0 && dx<0)*arc_r*Math.sin(theta + rho + Math.PI);   
	    return "M" + d.source.x + "," + d.source.y + "A" + arc_r + "," + arc_r + " 0 0,1 " + new_x + "," + new_y;
	};

	function static_update_network()
	{
	    var tm = parseInt(d3.select('#time').text());
	    d3.selectAll('.link')
		.transition()
		.delay(0)
		.duration(0)
		.style("stroke", function(d) {return get_link_style(link_color,d.value,tm);})
	    //		    .style("opacity", function(d) {return get_link_style(link_opacity,d.value,tm);})
	    //		    .style("stroke-width", function(d) {return get_link_style(link_strokeWidth,d.value,tm);})
	    ;
	    d3.selectAll('.node')
		.transition()
		.delay(0)
		.duration(0)
		.attr("r", function(d) {var v = nodeRadiusVariable.node.calcRadius(d[quantity],tm,economy.metadata[quantity].tot); return v;})
		.style('fill',function(d) {return node_color(nodeColorVariable.node.calcDisplayData(d[quantity],tm,economy.metadata[quantity].tot));})
	    ;
	    if (highlit_agent_index) {update_node_info(tm);}
	}

	//************ SECTION 4.A.iii: update
	function update_network(trans,tm,delay_ref_year)
	{
	    var use_orig_delay = 1-Boolean(delay_ref_year); //false if resuming after pause
	    var fixed_delay = 0;
	    if (use_orig_delay) 
	    {
		delay_ref_year = settings.time.display.startYear;
		fixed_delay = settings.animation.delay;
	    }
	    if (tm <= settings.time.display.endYear)
	    {
		d3.selectAll('.time_label')
		    .transition()
		    .delay(fixed_delay+(tm-delay_ref_year)*settings.animation.duration+fixed_delay/2)
		    .duration(0)
		    .text(tm)
		    .each("start", function() {	if (highlit_agent_index !== undefined) { update_node_info(tm);}});

		d3.selectAll('.link')
		    .transition()
		    .delay(fixed_delay+(tm-delay_ref_year)*settings.animation.duration)
		    .duration(settings.animation.duration)
		    .ease("linear")
		    .style("stroke", function(d) {return get_link_style(link_color,d.value,tm);})
//		    .style("opacity", function(d) {return get_link_style(link_opacity,d.value,tm);})
//		    .style("stroke-width", function(d) {return get_link_style(link_strokeWidth,d.value,tm);})
		;
		d3.selectAll('.node')
		    .transition()
		    .delay(fixed_delay+(tm-delay_ref_year)*settings.animation.duration)
		    .duration(settings.animation.duration)
		    .ease("linear")
		    .attr("r", function(d) {var v = nodeRadiusVariable.node.calcRadius(d[quantity],tm,economy.metadata[quantity].tot); return v;})
		    .style('fill',function(d) {return node_color(nodeColorVariable.node.calcDisplayData(d[quantity],tm,economy.metadata[quantity].tot));})
		    .call(update_network,tm+1,delay_ref_year);	

		d3.selectAll('#startAnimation')
		    .transition()
		    .delay(fixed_delay+(2012-delay_ref_year)*settings.animation.duration+fixed_delay/2)
		    .duration(0)
		    .text('Start animation');
	    }
	}



    //------------------------------------


    //************ SECTION 4.B: build or adapt data objects 

	var N = economy.agents.length;
	for (var a in economy.agents)  
	{
	    economy.agents[a].display_in_network = false;
	    economy.agents[a].neighbours = [];
	}

	for (var l in economy.input)  
	{
	    economy.agents[economy.input[l].target].inputs[economy.input[l].source] = economy.input[l];
	    var years = Object.keys(economy.input[l].value).sort(function(a, b){return a-b});
	    var display_link = false;
	    //for (var y in years) { 
	    display_link = display_link || (economy.input[l].value[years[0]] >= display_thresholds.link.min && (economy.input[l].value[years[0]] <= display_thresholds.link.max));//}
	    display_link = display_link && economy.input[l].target != economy.input[l].source;

	    if (display_link)
	    {
		economy.agents[economy.input[l].target].neighbours.push(economy.input[l].source);
		economy.agents[economy.input[l].source].neighbours.push(economy.input[l].target);
		economy.agents[economy.input[l].target].display_in_network = true;//economy.agents[economy.input[l].target][quantity] >= display_thresholds.node.min && economy.agents[economy.input[l].target][quantity] <= display_thresholds.node.max;
		economy.agents[economy.input[l].source].display_in_network = true;//economy.agents[economy.input[l].target][quantity] >= display_thresholds.node.min && economy.agents[economy.input[l].target][quantity] <= display_thresholds.node.max;
		economy.input[l].display = true;//economy.agents[economy.input[l].target].display_in_network && economy.agents[economy.input[l].source].display_in_network; 
	    }
	}
	for (var a in economy.agents) {economy.agents[a].neighbours = economy.agents[a].neighbours.filter(onlyUnique);}


//------------------------------------

    //************ SECTION 4.C: display

	var displayed_inputs = economy.input.filter(function(d){return d.display;});
	var ring = economy.agents.filter(function(d) {return !d.display_in_network;});  //agents which have no displayed links are presented in a ring
	for (var a in ring)    
	{
	    var angle = (a*2*Math.PI+0.5)/ring.length;
	    economy.agents[ring[a].index].perm_x = width/2 + settings.ring.radius * Math.cos(angle-Math.PI/2);
	    economy.agents[ring[a].index].perm_y = height/2 + settings.ring.radius * Math.sin(angle-Math.PI/2);
	}

	loadVariable();
	d3.selectAll('.time_label').text(settings.time.display.startYear);

	force
	    .nodes(economy.agents)
	    .links(displayed_inputs);

	setTimeout(function() {

	    // static force-directed graph courtesy of Mike Bostock: see http://bl.ocks.org/mbostock/1667139
	    // Run the layout a fixed number of times.

	    //some callbacks
	    var stickydrag = force.drag()
	    //sticky layout courtesy of Mike Bostock: see http://bl.ocks.org/mbostock/3750558
	    //adapted to make neighbours of moved node temporarily non-sticky
		.on("dragstart", function(d) {
		    d3.selectAll('.node').classed("fixed", d.fixed = true);
		    this.__data__.moved = true;
		    var neighbours = this.__data__.neighbours;
		    for (var n in neighbours) { economy.agents[neighbours[n]].fixed = economy.agents[neighbours[n]].moved? true : false;}
		});

	    var tick = function() 
	    {
		node.attr("cx", function(d) {return d.perm_x? d.perm_x : d.x ;})
		    .attr("cy", function(d) {return d.perm_y? d.perm_y : d.y ;});
		link.attr("d",curvy_link);
	    }

	    //run force layout so many iterations to get it to settle into a reasonable configuration
	    force.start();
	    for (var i = 100; i > 0; --i) force.tick("tick");
	    force.stop();


    //------------------------------------

    //************ SECTION 4.D: link SVG elements to data

	    var link = svg.append("svg:g").selectAll("path")
		.data(displayed_inputs)
		.enter().append("svg:path")
		.attr("class", "link anim_element remove_on_reload")
		.attr("d", curvy_link)
		.attr("marker-end", "url(#end)")
		.attr('transform','translate('+settings.offset.x+','+settings.offset.y+')')
		.style("stroke", function(d) {return get_link_style(link_color,d.value,settings.time.display.startYear);})
	//	.style("stroke", function(d) {return settings.time.display.startYear === settings.time.data.startYear? 'grey' : get_link_color(d.value,settings.time.display.startYear);})
		.style("opacity", function(d) {return get_link_style(link_opacity,d.value,settings.time.display.startYear);})
//		.style("stroke_width", function(d) {return get_link_style(link_strokeWidth,d.value,settings.time.display.startYear);})
	    ;
	    
	    var node = svg.selectAll("circle")
		.data(economy.agents)
		.enter().append("circle")
		.attr("class", "node anim_element remove_on_reload")
		.attr("cx", function(d) { return d.perm_x? d.perm_x : d.x; })
		.attr("cy", function(d) { return d.perm_y? d.perm_y : d.y; })
		.attr("r", function(d) {var v = nodeRadiusVariable.node.calcRadius(d[quantity],settings.time.display.startYear,economy.metadata[quantity].tot);  return v;})
		.attr('transform','translate('+settings.offset.x+','+settings.offset.y+')')
		.style("fill", function(d) {return node_color(nodeColorVariable.node.calcDisplayData(d[quantity],settings.time.display.startYear,economy.metadata[quantity].tot));})
		.style("stroke","none")
		.style("stroke-width",0)
		.on('mousedown', function() {
		    //force.charge(settings.force.mousedown.charge)
		    force.resume().on("tick",tick);
		})
	        .on('mouseover', function(d) 
		    {
			highlit_agent_index = d.index;
			highlight_node(this);
		    })
		.call(stickydrag)
	    ;


	    //************ stuff to do before the Timeout function ends
	    for (var a in economy.agents)  {economy.agents[a].fixed = true;}
	    loading.remove();

	}, 10);


	d3.select('#startAnimation')
	    .attr('class','anim_element')
	    .on('click',function() {
		var tx = $("#startAnimation").text();
		var start_or_restart = Boolean(tx.match(/Start|Resume/));
		if (start_or_restart) {do_animation();} else {$("#startAnimation").text('Resume'); anim_stop();}
	    });

	d3.select('#select_quantity')
	    .on('change',function() {
		anim_stop();
		$('.axis').remove();
		quantity = $("#select_quantity option:selected").attr("value");
		loadVariable();
		static_update_network();
		if (!$("#startAnimation").text().match(/Start/)) {$("#startAnimation").text('Resume');}
	    });

	d3.select('#select_variable')
	    .on('change',function() {
		anim_stop();
		$('.axis').remove();
		nodeColorVariableStr = $("#select_variable option:selected").attr("value");
		loadVariable();
		static_update_network();
		if (!$("#startAnimation").text().match(/Start/)) {$("#startAnimation").text('Resume');}
	    });

	d3.select('#anim_speed')
	    .on('change',function() {
		settings.animation.duration = $(this).val();
		if (!$("#startAnimation").text().match(/Start/)) {restart_animation();}
	    });

    });

}