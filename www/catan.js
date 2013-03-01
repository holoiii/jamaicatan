function Catan() {
  this.paper = Raphael(document.getElementById("board"), 700, 700);
  this.startNewGame();
}

_.extend(Catan.prototype, {
  startNewGame: function() {
    this.board = new Board();
    this.board.draw(this.paper);
    this.players = [new Player('Steve'), new Player('Carl')];
  }
})

function Board() {
  this.resourceTiles = this.generateResourceTiles();
  this.generateChanceTiles(this.inOrderTiles());
}

_.extend(Board.prototype, {
  generateResourceTiles: function() {
    //valid tile types and counts
    var tileTypes = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5];
    var tiles = {};
    //fills map array with tiles
    for (var rowNum = 1; rowNum < 6; rowNum++) {
      var xStartCoord = (5 % rowNum == 0) ? 1 : 0; //1, 0, 0, 0, 1
      var length = (rowNum % 2) + 4 - (xStartCoord * 2); //3, 4, 5, 4, 3
      for (var x = xStartCoord; x < xStartCoord + length; x++) {
        tileTypes = _.shuffle(tileTypes);
        tiles[[x,rowNum - 1]] = new resourceTile(tileTypes.pop(), x, rowNum - 1);
      }
    }
    _.each(tiles, function(tile) {
      tile.buildNeighbors();
    });
    return tiles;
  },

  generateChanceTiles: function(resourceTiles) {
    var chanceTiles = [
      ['A', 5,  4],
      ['B', 2,  1],
      ['C', 6,  5],
      ['D', 3,  2],
      ['E', 8,  5],
      ['F', 10, 3],
      ['G', 9,  4],
      ['H', 12, 1],
      ['I', 11, 2],
      ['J', 4,  3],
      ['K', 8,  5],
      ['L', 10, 3],
      ['M', 9,  4],
      ['N', 4,  3],
      ['O', 5,  4],
      ['P', 6,  5],
      ['Q', 3,  2],
      ['R', 11, 2]
    ]
    _.each(this.scopedResourceTiles(resourceTiles), function(tile) {
      var placedTile = chanceTiles.shift();
      tile.chanceTile = new chanceTile(tile, placedTile[0], placedTile[1], placedTile[2]);
    });
  },

  draw: function(paper) {
    //draw tiles
    _.each(this.resourceTiles, function(tile) {
      tile.draw(paper);
    });
    //draw chance tiles and nodes (split up so no overlap)
    _.each(this.scopedResourceTiles(this.resourceTiles), function(tile) {
      if(tile.type != 5) {
        tile.chanceTile.draw(paper);
        _.each(tile.nodes, function(node) {
          node.draw(paper);
        });
      }
    })
  },

  inOrderTiles: function() {
    var startTile = this.resourceTiles[[1,0]];
    startTile.flagged = true;
    startTile.dir = 0;
    return _.compact(_.flatten([startTile, this.nextInOrderTile(startTile)]));
  },

  nextInOrderTile: function(startTile) {
    //try bottom left first, go CC
    if(!startTile) {
      return;
    }

    var nextTile;

    //even
    if(startTile.y % 2 == 0) {
      var xShiftB = -1;
      var xShiftT = 0;
    } else { //odd
      var xShiftB = 0;
      var xShiftT = 1;
    }

    var bottomLeft  = this.resourceTiles[[startTile.x     + xShiftB, startTile.y + 1]];
    var bottomRight = this.resourceTiles[[startTile.x + 1 + xShiftB, startTile.y + 1]];
    var right       = this.resourceTiles[[startTile.x + 1          , startTile.y    ]];
    var topRight    = this.resourceTiles[[startTile.x     + xShiftT, startTile.y - 1]];
    var topLeft     = this.resourceTiles[[startTile.x - 1 + xShiftT, startTile.y - 1]];
    var left        = this.resourceTiles[[startTile.x - 1         , startTile.y    ]];

    if((!bottomLeft || bottomLeft.flagged) && startTile.dir == 0) {
      startTile.dir = 1;
    }

    if((!bottomRight || bottomRight.flagged) && startTile.dir == 1) {
      startTile.dir = 2;
    }

    if((!right || right.flagged) && startTile.dir == 2) {
      startTile.dir = 3;
    }

    if((!topRight || topRight.flagged) && startTile.dir == 3) {
      startTile.dir = 4;
    }

    if((!topLeft || topLeft.flagged) && startTile.dir == 4) {
      startTile.dir = 5;
    }

    if((!left || left.flagged) && startTile.dir == 5) {
      startTile.dir = 0;
    }

    if(bottomLeft && !bottomLeft.flagged && startTile.dir == 0) {
      nextTile = bottomLeft;
      nextTile.dir = 0;
    } else if (bottomRight && !bottomRight.flagged && startTile.dir == 1) {
      nextTile = bottomRight;
      nextTile.dir = 1;
    } else if (right && !right.flagged && startTile.dir == 2) {
      nextTile = right;
      nextTile.dir = 2;
    } else if (topRight && !topRight.flagged && startTile.dir == 3) {
      nextTile = topRight;
      nextTile.dir = 3;
    } else if (topLeft && !topLeft.flagged && startTile.dir == 4) {
      nextTile = topLeft;
      nextTile.dir = 4;
    } else if (left && !left.flagged && startTile.dir == 5) {
      nextTile = left;
      nextTile.dir = 5;
    }

    if(nextTile) {
      nextTile.flagged = true;
    }

    return [nextTile, this.nextInOrderTile(nextTile)];
  },

  scopedResourceTiles: function(resourceTiles) {
    //Collection without robber tile
    return _.reject(resourceTiles, function(tile) {
      return tile.type == 5;
    });
  }
});

function resourceTile(type, x, y) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.neighbors = [];
  this.color = this.tileColor();
  //there will be overlap between tiles, this is ok/desirable!
  this.nodes = this.generateNodes();
}

_.extend(resourceTile.prototype, {
  tileColor: function() {
    var color = '';
    switch(this.type) {
      case 0: //brick
        color = 'red';
        break;
      case 1: //wheat
        color = 'yellow';
        break;
      case 2: //ore
        color = 'gray';
        break;
      case 3: //wood
        color = 'green';
        break;
      case 4: //sheep
        color = 'teal';
        break;
      case 5: //robber
        color = 'black';
    }
    return color;
  },

  buildNeighbors: function() {
    //check each neighbor, if exists, push to
  },

  generateNodes: function() {
    var nodes = []
    for(var i = 0; i < 6; i++) {
      nodes.push(new Node(this, i));
    }
    return nodes;
  },

  draw: function(paper) {
    var margin = 15;
    this.width = (paper.width - 30) / 5
    this.height = (paper.height - 30) / 8;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    var oneAndHalfHeight = this.halfHeight + this.height;
    var twiceHeight = this.height * 2;

    //even
    if (this.y % 2 == 0) {
      var startX = this.x * this.width + margin;
    } else { //odd
      var startX = this.x * this.width + this.halfWidth + margin;
    }

    var pointTopLeft = {
      x: startX,
      y: this.y * oneAndHalfHeight + this.halfHeight + margin
    }

    var pointTop = {
      x: startX + this.halfWidth,
      y: this.y * oneAndHalfHeight + margin
    }

    var pointTopRight = {
      x: startX + this.width,
      y: this.y * oneAndHalfHeight + this.halfHeight + margin
    }

    var pointBottomRight = {
      x: startX + this.width,
      y: this.y * oneAndHalfHeight + oneAndHalfHeight + margin
    }

    var pointBottom = {
      x: startX + this.halfWidth,
      y: this.y * oneAndHalfHeight + twiceHeight + margin
    }

    var pointBottomLeft = {
      x: startX,
      y: this.y * oneAndHalfHeight + oneAndHalfHeight + margin
    }

    var path =
      "M" + pointTopLeft.x + "," + pointTopLeft.y +
      "L" + pointTop.x + "," + pointTop.y +
      "L" + pointTopRight.x + "," + pointTopRight.y +
      "L" + pointBottomRight.x + "," + pointBottomRight.y +
      "L" + pointBottom.x + "," + pointBottom.y +
      "L" + pointBottomLeft.x + "," + pointBottomLeft.y +
      "L" + pointTopLeft.x + "," + pointTopLeft.y

    this.mapElm = paper.path(path);
    this.mapElm.attr({fill: this.color});
  }
});

function chanceTile(tile, letter, number, dots) {
  this.tile = tile;
  this.letter = letter;
  this.number = number;
  this.dots = dots;
}

_.extend(chanceTile.prototype, {
  draw: function(paper) {
    var boundingBox = this.tile.mapElm.getBBox();
    var x = boundingBox.x + boundingBox.width / 2;
    var y = boundingBox.y + boundingBox.height / 2;
    var tileContent = paper.set();

    //circle
    this.mapElm = paper.circle(x, y, 25).attr({fill: 'tan'});
    //letter
    tileContent.push(paper.text(x, y - 15, this.letter));
    //number
    tileContent.push(paper.text(x, y, this.number).attr({'font-size': 20, 'font-weight': 'bold'}));

    for(var i = 0; i < this.dots; i++) {
      var stepSize = i * 10;
      var xStart = x - (this.dots * i + this.dots * 2);
      tileContent.push(paper.circle(xStart + stepSize, y + 15, 1).attr({fill: 'black'}));
    }
    //red highlighting
    if(_.contains([6, 8], this.number)) {
      tileContent.attr({fill: 'red', stroke: 'red'});
    }
  }
});

function Node(tile, position) {
  this.tile = tile;
  //0, 1, 2, 3, 4, 5 (BL, B, BR, TR, T, TL)
  this.position = position;
}

_.extend(Node.prototype, {
  draw: function(paper) {
    var boundingBox = this.tile.mapElm.getBBox();
    var x = boundingBox.x + boundingBox.width / 2;
    var y = boundingBox.y + boundingBox.height / 2;
    var nodeSet = paper.set();
    var nodeRadius = 15;
    switch(this.position) {
      case 0: //BL
        nodeSet.push(paper.circle(x - this.tile.halfWidth, y + this.tile.halfHeight, nodeRadius));
        break;
      case 1: //B
        nodeSet.push(paper.circle(x, y + this.tile.height, nodeRadius));
        break;
      case 2: //BR
        nodeSet.push(paper.circle(x + this.tile.halfWidth, y + this.tile.halfHeight, nodeRadius));
        break;
      case 3: //TR
        nodeSet.push(paper.circle(x + this.tile.halfWidth, y - this.tile.halfHeight, nodeRadius));
        break;
      case 4: //T
        nodeSet.push(paper.circle(x, y - this.tile.height, nodeRadius));
        break;
      case 5: //TL
        nodeSet.push(paper.circle(x - this.tile.halfWidth, y - this.tile.halfHeight, nodeRadius));
        break;
    }
    nodeSet.attr({fill: 'pink', 'fill-opacity': 0.0, 'stroke-width': 0});
    nodeSet.hover(
      function(e) {
        this.attr({'fill-opacity': 1});
      },
      function(e) {
        this.attr({'fill-opacity': 0});
      }
    );
  }
});

function Player(nam e) {
  this.name = name;
}
