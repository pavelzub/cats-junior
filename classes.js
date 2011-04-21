var Coord = $.inherit({
	__constructor: function(x, y) {
		this.x = x;
		this.y = y;
	}
});

var FieldElem = $.inherit({
	__constructor: function(problem, coord, isWall) {
		this.problem = problem;
		this.coord = coord;
		this.isWall = isWall;
		this.highlighted = false;
		this.cells = [];
	},
	highlightOn: function() {
		for (var i = 0; i < this.cells.length; ++i)
			this.cells[i].highlightOn();
		this.highlighted = true;
	},
	highlightOff: function() {
		for (var i = 0; i < this.cells.length; ++i)
			this.cells[i].highlightOff();
		this.highlighted = false;
	},
	draw: function() {
		s = '#' + (this.problem * 10000 + this.coord.y * 100 + this.coord.x);
		$(s).empty();			
		$(s).removeClass('floor');
		$(s).removeClass('highlightFloor');
		$(s).removeClass('wall');
		$(s).removeClass('highlightWall');
		if (this.isWall)
			$(s).addClass(this.highlighted ? 'highlightWall' : 'wall');
		else
			$(s).addClass(this.highlighted ? 'highlightFloor' : 'floor');
		this.sortCells();
		var i = 0;
		while (i < this.cells.length && !this.cells[i++].draw());
	},
	setDefault: function() {
		this.highlighted = false;
		for (var i = 0; i < this.cells.length; ++i)
			this.cells[i].setDefault();
	},
	getCells: function() {
		this.sortCells();
		return this.cells;
	},
	sortCells: function() {
		this.cells.sort(function(a, b){
			return b.zIndex - a.zIndex;
		});
	},
	pushCell: function(cell) {
		this.cells.push(cell);
	},
	deleteElement: function(elem) {
		for (var i = 0; i < this.cells.length; ++i)
			if (this.cells[i].__self == elem.__self && this.cells[i].id == elem.id){
				this.cells.splice(i, 1);
				break;
			}
	},
	changedCells: function(){
		var arr = [];
		for (var i = 0; i < this.cells.length; ++i)
			if (this.cells[i].coord.x != this.coord.x || this.cells[i].coord.y != this.coord.y){
				arr.push(this.cells[i]);
				this.cells.splice(i--, 1);
		}
		return arr;
	},
	findCell: function(c, id){
		for (var i = 0; i < this.cells.length; ++i)
			if (this.cells[i].__self == c && this.cells[i].id== id)//////
				return this.cells[i];
		return undefined;
	},
	mayPush: function(elem){
		for (var i = 0; i < this.cells.length; ++i)
			if (this.cells[i].zIndex >= elem.zIndex && this.cells[i].__self != Arrow)
				return false;
		return true;
	}
});

var Cell = $.inherit({
	__constructor: function(problem, coord, style, symbol, zIndex, points, dLife, id) {
		this.problem = problem;
		this.style = style;
		this.symbol = symbol;
		this.zIndex = zIndex ? zIndex : 0;
		this.points = points ? points : 0;
		this.dLife = dLife ? dLife : 0;
		this.coord = coord;
		this.id = (id != undefined) ? id : cellId[problem]++;
	},
	draw: function() {
		s = '#' + (this.problem * 10000 + this.coord.y * 100 + this.coord.x);
		$(s).append('<div class = "' + this.style + '" + style = "z-index:' + this.zIndex + '"></div>');
		return true;
	},
	setDefault: function() {
		this.highlighted = false;
		this.highlightOff();
	},
	highlightOn: function(){},
	highlightOff: function(){}
});

var Lock = $.inherit(Cell, {
	__constructor: function(problem, coord) {
		this.__base(problem, coord, 'lock', '#_', 11);
		this.locked = true;
	},
	setDefault: function() {
		this.locked = true;
		this.isWall = true;
		this.style = 'lock';
		this.__base();
	},
	setUnlocked: function() {
		this.locked = false;
		this.isWall = false;
		this.style = 'floor';
	},
	highlightOn: function(){
		if (this.locked)
			this.style = 'highlightedLock';
		this.__base();
	},
	highlightOff: function(){
		if (this.locked)
			this.style = 'lock';
		this.__base();
	}
});

var Key = $.inherit(Cell, {
	__constructor: function(problem, coord, locks) {
		this.__base(problem, coord, 'key', '._', 1);
		this.found = false;
		this.locks = locks;
	},
	setDefault: function() {
		this.found = false;
		this.__base();
	},
	draw: function() {
		if (!this.found)
			this.__base();
		else
			return false;
		return true;
	}
});

var Arrow = $.inherit(Cell,{
	__constructor : function(problem, coord,  dir) {
		this.__base(problem, coord, dirs[dir], dir, 3);
		this.dir = dir;
		this.initCoord = coord;
		this.initDir = dir;
		this.dead = false;
	},
	setDefault: function(){
		this.dir = this.initDir;
		this.coord = this.initCoord;
		this.style = dirs[this.initDir];
		this.dead = false;
		this.__base();
	},
	draw: function() {
		this.style = dirs[this.dir];
		if (!this.dead)
			this.__base();
		else
			return false;
		return true;
	},
	move: function(d) {
		var dx = changeDir[d][this.dir].dx;
		var dy = changeDir[d][this.dir].dy;
		this.dir = changeDir[d][this.dir].curDir;
		this.coord = new Coord(this.coord.x + dx, this.coord.y + dy); 
	}
});

var Prize = $.inherit(Cell,{
	__constructor : function(problem, coord, style, symbol, zIndex, points, dLife, name) {
		this.__base(problem, coord, style, symbol, zIndex, points, dLife, prizeId[problem]++);
		this.name = name;
		this.eaten = false;
	},
	setDefault: function(){
		this.eaten = false;
		this.__base();
	},
	draw: function() {
		if (!this.eaten)
			this.__base();
		else
			return false;
		return true;
	}
});

var Box = $.inherit(Cell,{
	__constructor : function(problem, coord, style, symbol, zIndex, points, dLife, name) {
		this.__base(problem, coord, style, symbol, zIndex, points, dLife, boxId[problem]++);
		this.name = name;
		this.initCoord = coord;
	},
	move: function(dx, dy) {
		this.coord = new Coord(this.coord.x, this.coord.y);
	},
	setDefault: function() {
		this.coord = this.initCoord;
		this.__base();
	}
});

var Monster = $.inherit(Cell,{
	__constructor : function(problem, coord, style, symbol, zIndex, points, dLife, path, looped, die) {
		this.__base(problem, coord, style, symbol, zIndex, points, dLife, monsterId[problem]++);
		this.path = new Array();
		for (var i = 0; i < path.length; ++i)
			this.path[i] = {'x': path[i].x, 'y': path[i].y, 'startX': path[i].x, 'startY': path[i].y,
							'dir': path[i].dir, 'initCnt': path[i].initCnt, cnt: 0};
		this.looped = looped;
		this.die = die;
		this.pathIndex = 0;
	},
	setDefault: function() {
		for (var i = 0; i < this.path.length; ++i){
			this.path[i].x = this.path[i].startX;
			this.path[i].y = this.path[i].startY;
			this.path[i].cnt = 0;
		}
		this.pathIndex = 0;
		this.coord = new Coord(this.path[0].x, this.path[0].y);
		this.__base();
	},
	tryNextStep: function() {
		var x = this.coord.x, y = this.coord.y, dir = this.path[this.pathIndex].dir;
		if (/*(this.pathIndex >= this.path.length || */this.pathIndex == this.path.length - 1 && 
				this.path[this.pathIndex].cnt == this.path[this.pathIndex].initCnt){
			if (!this.looped)
				return;
			x = this.path[0].startX;
			y = this.path[0].startY;
			dir = this.path[0].dir;
		}
		else
			if (this.path[this.pathIndex].cnt == this.path[this.pathIndex].initCnt)
				dir = this.path[this.pathIndex + 1].dir;
		x = x + changeDir.forward[dirs[dir]].dx;
		y = y + changeDir.forward[dirs[dir]].dy;			
		return new Coord(x, y);
	},
	nextStep: function() {
		if /*(this.pathIndex >= this.path.length || */(this.pathIndex == this.path.length - 1 && 
				this.path[this.pathIndex].cnt == this.path[this.pathIndex].initCnt){
			if (!this.looped)
				return;
			this.setDefault();
		}
		else
			if (this.path[this.pathIndex].cnt == this.path[this.pathIndex].initCnt)
				++this.pathIndex;
		this.path[this.pathIndex].x += changeDir.forward[dirs[this.path[this.pathIndex].dir]].dx;
		this.path[this.pathIndex].y += changeDir.forward[dirs[this.path[this.pathIndex].dir]].dy;
		++this.path[this.pathIndex].cnt;
		this.coord.x = this.path[this.pathIndex].x;
		this.coord.y = this.path[this.pathIndex].y;
	}
});