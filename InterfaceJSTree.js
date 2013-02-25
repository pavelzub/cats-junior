function onCreateItem(tree, newNode, type, problem, funcId){
	//var type = initObject.attr('rel');
	if (type == 'func-header' ||type == 'func-body')
		type = 'funccall';
	tree.set_type(type, newNode);

	$(newNode).prop('id', type + ++cmdId);
	$(newNode).prop('numId', cmdId);
	$(newNode).prop('ifLi', 1);
	$(newNode).prop('type', type);
	$(newNode).addClass(type);

	newNode = '#' + type + cmdId;
	
	//tree.rename_node(newNode, type == 'func' ? (name ? name : 'func_' + (problem.numOfFunctions - 1)) : cmdClassToName[type]);
	if (problem.executionUnit.isCommandSupported(type)) {
		var spin = $('<spin></spin>');
		spin.mySpin('init', $(newNode), [], problem);
		$(newNode).append(spin);
	}
	else {
		switch(type){
			case 'for':
				var spin = $('<spin></spin>');
				spin.mySpin('init', $(newNode), [], problem);
				$(newNode).append(spin);
				break;
			case 'if':
			case 'ifelse':
			case 'while':
				$(newNode).append('<select id = "selectCondition0_' + cmdId +'">');
				for (var i = 0; i < selectConditions.length; ++i)
				{
					$('#selectCondition0_' + cmdId).append('<option value = ' + (i == 0 ? '""' : 'not') + '>' + selectConditions[i][1] + '</option><br>');
				}
				$(newNode).append('</select> (')
				$('#selectCondition0_' + cmdId).change(function(p){
					return function() {
						p.updated();
					}
				}(problem));


				var conditionProperties = problem.executionUnit.getConditionProperties();
				var args = conditionProperties['args'];
				if (!args || !$.isArray(args)) {
					throw 'Invalid arguments list in condtion properties';
				}
				
				for (var i = 0; i < args.length; ++i) {
					var objects = args[i];			
					$(newNode).append('<select id = "selectCondition' + (i + 1) + '_' + cmdId +'">');
					for (var j = 0; j < objects.length; ++j)
					{
						$('#selectCondition' + (i + 1) + '_' + cmdId).append('<option value = ' + objects[j][0] + '>' + objects[j][1] + '</option><br>');
					}
					$(newNode).append('</select>');

					$('#selectCondition' + (i + 1) + '_' + cmdId).change(function(p){
						return function() {
							p.updated();
						}
					}(problem));
				}
				if (type == 'ifelse'){
					tree.rename_node(newNode, 'Если');
					tree.create($(newNode), "after", false, 
						function(elseNode){
						tree.set_type('else', elseNode);
						tree.rename_node(elseNode, 'Иначе');
							$(elseNode).prop('numId', cmdId);
							$(elseNode).prop('ifLi', 1);
							$(elseNode).prop('type', 'else');
							$(elseNode).addClass('else');
							$(elseNode).prop('id', 'else' + cmdId);
					}, true); 
				}
				break;
			case 'funccall':
				var arguments = problem.functionsWithId[funcId].getArguments();
				for (var i = 0; i < arguments.length; ++i) {
					$(newNode)
						.append('<input class="argCallInput"/>')
						.bind('change', function(){
							return function(pr) {
								pr.updated();
							}(problem)
						})
				}
				$(newNode).attr('funcId', funcId);
				break;
		}
	}
	//setSpin(problem);
	problem.updated();
}
	
function isBlock(type){
	return type == false || type == 'block' || type == 'if' || type == 'ifelse' || 
		type == 'while' || type == 'for' || type == 'else' || type == 'funcdef';
}
function getNextNode(tree, node)
{
	var parent = tree._get_parent(node);
	var next;
	var cur = node;
	while(1)
	{
		next = tree._get_next(cur, true);
		cur = next;
		var p1 = tree._get_parent(next);
		if (!next || p1 == -1 || p1.prop('id') == parent.prop('id'))
			break;
	}
	return next;
}

function getTreeIdByObject(tree) {
	return tree.data.html_data.original_container_html.context;
}

function createJsTreeForFunction(funcId, problem) {
	return $(funcId).jstree({ 
		"types" : {
			"max_depth" : -2,
	        "max_children" : -2,
			"types" : {
				"block" : {
					"icon" : { 
						"image" : "images/block_small.png" 
					}
				},
				"if" : {
					"icon" : { 
						"image" : "images/block_small.png" 
					}
				},
				"ifelse" : {
					"icon" : { 
						"image" : "images/block_small.png" 
					}
				},
				"else" : {
					"icon" : { 
						"image" : "images/block_small.png" 
					}
				},
				"while" : {
					"icon" : { 
						"image" : "images/block_small.png" 
					}
				},
				"for" : {
					"icon" : { 
						"image" : "images/block_small.png" 
					}
				},
				"left" : {
					"valid_children" : "none",
					"icon" : { 
						"image" : "images/left_small.png" 
					}
				},
				"right" : {
					"valid_children" : "none",
					"icon" : { 
						"image" : "images/right_small.png" 
					}
				},
				"forward" : {
					"valid_children" : "none",
					"icon" : { 
						"image" : "images/forward_small.png" 
					}
				},
				"wait" : {
					"valid_children" : "none",
					"icon" : { 
						"image" : "images/wait_small.png" 
					}
				},
				"funccall" : {
					"valid_children" : "none",
					"icon" : { 
						"image" : "images/block_small.png" 
					}
				}
			}
		},
		"crrm":{
			"move" : {
				"default_position" : "inside", 
				"check_move" : function (data) {
					var node = data.o;
					var type = this._get_type(node);
					if (type == 'else') {
						return false;
					}
					elseStmt = undefined;
					if (type == 'ifelse'){
						elseStmt = getNextNode(this, node);
					}
					node = data.r;
					type = this._get_type(node);
					if (type == 'ifelse' && data.p == 'after'){
						return false;
					}
					if (type == 'else' && data.p == 'before'){
						return false;
					}
					if (type == 'funcdef' && this._get_type(data.o) == 'funcdef' && data.p == 'inside' ){
						return false;
					}
					if (type == 'funccall' && data.p == 'inside' ){
						return false;
					}
					return true;
				}
			}
			},
		"dnd" : {
			"drag_check" : function (data) {
				result = { 
					after : true, 
					before : true, 
					inside : true 
				};
				if (this._get_type(data.r) == 'ifelse'){
					result['after'] = false;
				}
				if (this._get_type(data.r) == 'else'){
					result['before'] = false;
				}
				if (this._get_type(data.r) == 'funcdef' && this._get_type(data.o) == 'funccall'){
					result['inside'] = false;
				}
				if (this._get_type(data.r) == 'funccall'){
					result['inside'] = false;
				}
				return result;
			},
			"drag_finish" : function (data) { 
				var node = data.r;
				//; //=(
				var pos = data.p;
				if ((!isBlock(this._get_type(node)) || this._get_type(node) == 'funcdef' && this._get_type(data.o) == 'funcdef') && pos == 'inside'){
					pos = 'after';
				}
				if ( !$(data.o).hasClass('jstree-draggable') )
					data.o = $(data.o).parent()[0];
				if ( !$(data.o).hasClass('jstree-draggable') )
					data.o = $(data.o).parent()[0];
				var type = this._get_type(data.o);
				var name = problem.getCommandName(type);
				if (type == 'funcdef') {
					name = 'func_' + problem.numOfFunctions;
				}
				else if (type == 'funccall') {
					name = $(data.o).children('.func-header').text();
				}
				else if (type == 'func-header') {
					name = $(data.o).text()
				}
				else if(type == 'func-body') {
					name = $(data.o).prev().prev().text();
				}
				if (type != 'funcdef') {
					$(funcId).jstree(
						"create", node, pos, 
						{'data': name}, 
						function(newNode){
							onCreateItem(this, newNode, $(data.o).attr('rel'), problem, problem.functions[name] ? problem.functions[name].getArguments() : []);
						}, type != 'funcdef'); 
				}

			},
			"drop_finish": function(data){
				var node = data.o;
				if (node) {
					var type = this._get_type(node);
					if (type == 'else')
						return false;
					var next = undefined;
					if (type == 'ifelse'){
						next = getNextNode(this, node);
					}
					this.remove(data.o);
					if (next)
						this.remove(next);
					problem.updated();				
				}
			}
		},
		"ui" : {
			"initially_select" : [ "phtml_2" ],
			"select_limit" : 1
		},
		"core" : { "initially_open" : [ "phtml_1" ] },
		"plugins" : [ "themes", "html_data", "dnd", "crrm", "ui", "types", "json_data" ]			
	})
	.bind("move_node.jstree", function(event, data){
		var node = data.args[0].o;
		if (data.inst._get_type(node) == 'ifelse' && elseStmt){
			data.inst.move_node(elseStmt, node, 'after', false, false, true);
			elseStmt = undefined;
	}
		problem.updated();
	}).bind('click', function(event, ui) {
		problem.showCounters();
	}).bind("rename.jstree", function(event, data) {
		problem.updated();
	}).bind('refresh.jstree', function(event, data) {
		problem.updated();
	});
}