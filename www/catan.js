function Catan() {
  this.paper = Raphael(document.getElementById("board"), 700, 700);
  this.board = new Board();
  this.board.draw(this.paper);
}

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
      tile.chanceTile = new chanceTile(placedTile[0], placedTile[1], placedTile[2]);
    });
  },

  draw: function(paper) {
    //draws map depending on where tiles are in array
    _.each(this.resourceTiles, function(tile) {
      tile.draw(paper);
      if(tile.type != 5) {
        tile.chanceTile.draw(tile, paper);
      }
    }, this);
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
  this.color = this.tileColor();
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

  draw: function(paper) {
    var width = paper.width / 5
    var height = paper.height / 8;
    var halfWidth = width / 2;
    var halfHeight = height / 2;
    var oneAndHalfHeight = halfHeight + height;
    var twiceHeight = height * 2;

    //even
    if (this.y % 2 == 0) {
      var startX = this.x * width;
    } else { //odd
      var startX = this.x * width + halfWidth;
    }

    var pointTopLeft = {
      x: startX,
      y: this.y * oneAndHalfHeight + halfHeight
    }

    var pointTop = {
      x: startX + halfWidth,
      y: this.y * oneAndHalfHeight
    }

    var pointTopRight = {
      x: startX + width,
      y: this.y * oneAndHalfHeight + halfHeight
    }

    var pointBottomRight = {
      x: startX + width,
      y: this.y * oneAndHalfHeight + oneAndHalfHeight
    }

    var pointBottom = {
      x: startX + halfWidth,
      y: this.y * oneAndHalfHeight + twiceHeight
    }

    var pointBottomLeft = {
      x: startX,
      y: this.y * oneAndHalfHeight + oneAndHalfHeight
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

function chanceTile(letter, number, dots) {
  this.letter = letter;
  this.number = number;
  this.dots = dots;
}

_.extend(chanceTile.prototype, {
  draw: function(tile, paper) {
    var boundingBox = tile.mapElm.getBBox();
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