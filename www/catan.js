function Catan() {
  this.paper = Raphael(document.getElementById("board"), 500, 500);
  this.board = new Board();
  this.board.draw(this.paper);
}

function Board() {
  this.tiles = this.generateTiles();
}

_.extend(Board.prototype, {
  generateTiles: function() {
    //valid tile types and counts
    var tileTypes = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5];
    var tiles = {};
    //fills map array with tiles
    for (var rowNum = 1; rowNum < 6; rowNum++) {
      var xStartCoord = (5 % rowNum == 0) ? 1 : 0; //1, 0, 0, 0, 1
      var length = (rowNum % 2) + 4 - (xStartCoord * 2); //3, 4, 5, 4, 3
      for (var x = xStartCoord; x < xStartCoord + length; x++) {
        tileTypes = _.shuffle(tileTypes);
        tiles[[x,rowNum]] = new Tile(tileTypes.pop(), x, rowNum - 1);
      }
    }
    return tiles;
  },

  draw: function(paper) {
    //draws map depending on where tiles are in array
    _.each(this.tiles, function(tile) {
      tile.draw(paper);
    }, this);
  },

  inOrderTiles: function() {
    
  }
});

function Tile(type, x, y) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.color = this.tileColor();
}

_.extend(Tile.prototype, {
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

    var hexagon = paper.path(path);
    hexagon.attr({fill: this.color});
  }
});

function chanceTile(tile, letter, number) {
  this.tile = tile;
  this.letter = letter;
  this.number = number;
}