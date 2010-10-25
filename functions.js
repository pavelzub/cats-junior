﻿	function getProblemStatement(){
		$.ajax({
			async: false,
			dataType : "json",
			url: 'problems/02/problem.json',
			success: function(data) {
				problem.name = data.name;
				problem.statement = data.statement;
				problem.testsNum = data.testsNum;
				problem.commands = data.commands.slice();
				problem.start_life = data.start_life;
				problem.d_life = data.d_life;
				problem.start_pnts = data.start_pnts;
				problem.finish_symb = data.finish_symb;
			}
		});
	}
	function getTest(i){
		$.ajax({
			async: false,
			dataType : "json",
			url: 'problems/02/tests/' + i +'.json',
			success: function(data) {
				map = data.map.slice();
				var tmp = data.spec_symbols;
				for (var i = 0; i < tmp.length; ++i){
					spec_symbols.list.push(tmp[i].symbol);
					spec_symbols.style_list.push(tmp[i].style);
					spec_symbols.count.push(tmp[i].count);
					spec_symbols.names.push(tmp[i].name);
					spec_symbols["do"].push(tmp[i]["do"]);
					spec_symbols.points.push(tmp[i].points);
					spec_symbols.d_life.push(tmp[i].d_life);
				}
				problem.cleaner = data.cleaner.slice();
				for (var i = 0; i < data.cleaned.length; ++i)
					problem.cleaned[i] =  data.cleaned[i].slice();
				if (data.commands)
					problem.commands = data.commands.slice();
				if (data.start_life)
					problem.start_life = data.start_life;
				if (data.d_life)
					problem.d_life = data.d_life;
				if (data.start_pnts)
					problem.start_pnts = data.start_pnts;
				if (data.finish_symb)
					problem.finish_symb = data.finish_symb;
				tmp = data.moving_elements;
				for (var i = 0; i < tmp.length; ++i){
					moving_elems.style.push(tmp[i].style);
					moving_elems.path.push(tmp[i].path.slice());
					moving_elems.looped.push(tmp[i].looped);
					moving_elems.die.push(tmp[i].die);
					map[tmp[i].path[0].y, tmp[i].path[0].x] = m_elem_id;
					moving_elems.symbol.push(m_elem_id++);
				}
			}
		});
	}
	function copyMap(){
		for (var k = 0; k < map.length; ++k){
			cur_map[k] = new Array();
			for (var l = 0; l < map[k].length; ++l)
				cur_map[k][l] = map[k][l];
		}
	}
	function fillLabyrinth(){
		document.write("<div class = 'field'>");
		document.writeln("<table border = '0''>");
		for (var i = 0; i < cur_map.length; ++i){
			document.writeln("<tr>");
			for (var j = 0; j < cur_map[i].length; ++j){
				cur_map[i][j] == '#'  ? document.writeln("<td class = 'wall' id = '"+(i * 100 + j)+"'>") : document.writeln("<td class = 'floor' id = '"+(i * 100 + j)+"'>");
				if (cur_map[i][j] == "R" || cur_map[i][j] == "L" || cur_map[i][j] == "U" || cur_map[i][j] == "D"){
					start_dir = dirs[cur_map[i][j]];
					start_x = j;
					start_y = i;
				}
				for (var k = 0; k < spec_symbols.list.length; ++k){
					if (cur_map[i][j] == spec_symbols.list[k]){
						spec_symbols.coord.x.push(j);
						spec_symbols.coord.y.push(i);
						spec_symbols.style.push(spec_symbols.style_list[k]);
						spec_symbols.cur_count[k] = 0;
						spec_symbols.symb.push(spec_symbols.list[k]);
						break;
					}
				}
				document.writeln("</td>");
			}
			document.writeln("</tr>");
		}
		document.writeln("</table>");
		document.writeln("</div>");
	}
	function enableButtons(){
		document.btn_form.btn_play.disabled = false;
		document.btn_form.btn_next.disabled = false;
		document.btn_form.btn_prev.disabled = false;
		document.btn_form.btn_fast.disabled = false;
	}
	function disableButtons(){
		document.btn_form.btn_play.disabled = true;
		document.btn_form.btn_next.disabled = true;
		document.btn_form.btn_prev.disabled = true;
		document.btn_form.btn_fast.disabled = true;
	}
	function changeClass(elem){
		if (!elem || elem.classList[0] == "invisible")
			return false;
		elem.className = classNames[elem.className];
	}
	function isChangedClass(elem){
		if (!elem || elem.classList[0] == "invisible")
			return false;
		if (elem.classList[0][elem.classList[0].length - 1] == "1")
			return true;
		return false;
	}
	function clearClasses(){
		var el = $("#sortable").children();
		for (var i = 0; i < el.length; ++i){
			if (isChangedClass(el[i]))
				changeClass(el[i]);
		}
	}
	function updated(){
		var arr = $("#sortable").sortable('toArray');
		var el = $("#sortable").children();
		if (arr.length < cur_list.length ||  !isChangedClass(el[cur_i])){
			setDefault();
			clearClasses();
			cur_list = arr;
			return;
		}
		else {
			for (var i = 0; i < cur_i; ++i){
				if (cur_list[i] != arr[i]){
					setDefault();
					cur_list = arr;
					return;
				}
			}
			cur_list = arr;
		}
	}
	function setDefault(f){
		enableButtons();
		var s = '#' + (cur_y * 100 + cur_x);
		$(s).empty();
		for (var i = 0; i < cur_map.length; ++i){
			for (var j = 0; j < cur_map[i].length; ++j){
				s = '#' + (i * 100 + j);
				$(s).empty();
			}
		}
		for (var k = 0; k < spec_symbols.coord.x.length; ++k){
			s = "#" + (spec_symbols.coord.y[k] * 100 + spec_symbols.coord.x[k]);
			$(s).empty();
			$(s).append("<div class = '" + spec_symbols.style[k] + "'></div>");
			spec_symbols.cur_count[k] = 0;
		}
		for (var k = 0; k < moving_elems.symbol.length; ++k){
			s = "#" + (moving_elems.path[k][cur_i].y * 100 + moving_elems.path[cur_i][0].x);
			$(s).empty();
			s = "#" + (moving_elems.path[k][0].y * 100 + moving_elems.path[k][0].x);
			$(s).prepend("<div class = '" + moving_elems.style[k] + "'></div>");
		}
		for (var k = 0; k < problem.cleaner.length; ++k){
			for (var l = 0; l < problem.cleaned[k].length; ++l){
				var y = problem.cleaned[k][l].y;
				var x = problem.cleaned[k][l].x
				s = '#' + (y * 100 + x);
				$(s).removeClass('floor');
			}
		}
		copyMap();
		pause = false;
		$("#cons").empty();
		cur_dir = start_dir;
		cur_x = start_x;
		cur_y = start_y;
		if (!stopped && cur_list.length > cur_i){
			var el = $("#sortable").children();
			changeClass(el[cur_i]);
		}
		stopped = false;
		cur_i = 0;
		if (!f){
			s = "#" + (cur_y * 100 + cur_x);
			$(s).append("<div class = '" + cur_dir + "'></div>");
		}
	}
	function play(cnt){
		function loop(i){
			if (pause){
				pause = false;
				cur_i = i - 1;
				return;
			}
			if (stopped){
				stopped = false;
				cur_i = i - 1;
				setDefault();
				return;
			}
			if (i > cur_i && speed != 0){
				var el = $("#sortable").children();
				changeClass(el[i - 1]);
			}
			var x = cur_x;
			var y = cur_y;
			dx = changeDir[result[i]][cur_dir]["dx"];
			dy = changeDir[result[i]][cur_dir]["dy"];
			cur_dir = changeDir[result[i]][cur_dir]["cur_dir"];
			if (checkCell(i)){
				if (cur_x + dx >= 0 && cur_x + dx < cur_map[0].length && cur_y + dy >= 0 && cur_y < cur_map.length)
					if (cur_map[cur_y + dy][cur_x + dx] != '#'){
						cur_x += dx;
						cur_y += dy;
					}
					else{
							$("#cons").append("Шаг " + i + ": Уткнулись в стенку \n");
							var s = '#' + (cur_y * 100 + cur_x);
							$(s).effect("highlight", {}, 300);
						}
				else
					$("#cons").append("Шаг " + i + ": Выход за границу лабиринта \n");
				if (!(speed == 0 && (i + 1) < cnt)){
					s = '#' + (y * 100 + x);
					$(s).empty();
					s = '#' + (cur_y * 100 + cur_x);
					$(s).append('<div class = "' + cur_dir+'"></div>');
					var el = $("#sortable").children();
					changeClass(el[i]);
					setTimeout(function() { 
						if (++i <cnt) loop(i); 
						else {
							cur_i = i - 1; 
							playing = false;
							enableButtons();
						}
						}, speed);
				}
				else{
					if (++i <cnt)
						loop(i); 
					else {
						cur_i = i - 1; 
						playing = false;
						enableButtons();
					}
				}	
			}
			else{
				var el = $("#sortable").children();
				changeClass(el[i]);
				setTimeout(function() { 
					if (++i <cnt) loop(i); 
					else {
						cur_i = i - 1; 
						playing = false;
						enableButtons();
					}
					}, speed);
			}
			
		}
		disableButtons();
		playing = true;
		var result = $('#sortable').sortable('toArray');
		if (!cnt)
			cnt = result.length;
		if (result[cur_i] == "")
			++cur_i;
		dx = 0;
		dy = 0;
		var i = cur_i;
		$("#sortable").sortable( "disable" );
		loop(i);
		$("#sortable").sortable( "enable" );
	}