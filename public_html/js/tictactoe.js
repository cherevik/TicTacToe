var TicTacToe = Class.extend({
   
    size: 6, 
    depth: 3,
    
    cellsize: 0, 
    model: null, 
    canvas: null,
    
    EMPTY: 0, 
    CROSS: 1, 
    CIRCLE: 2,
    
    HUMAN: 1,
    COMPUTER: 2,
    
    turn: 1,
    
    LOST: -Math.pow(2, 53), 
    WON: Math.pow(2, 53),
    TIED: 0,
    
    maxlen: 4,
    
    // initializes the game 
    init: function(canvas) {
        var self = this; 
        
        // this is the canvas we will be drawing on 
        this.canvas = canvas; 
        this.canvas.addEventListener("mousedown", function(e) {
            self.doMouseDown(e); 
        }, false); 
        
        // calculate the size of each cell in pixels 
        // we need this for drawing the board 
        this.cellsize = this.canvas.width / this.size; 
        
        // initialize the game model 
        // this is the representation of the state of the game 
        // it consists of a two-dimensional array 
        // each cell in the array can be 
        // 0 - empty 
        // 1 - cross 
        // 2 - circle 
        // we initialize the array with zeros 
        this.model = new Array(); 
        for (var i = 0; i < this.size; i ++) {
            var col = new Array(); 
            this.model.push(col); 
            for (var j = 0; j < this.size; j ++) {
                col.push(this.EMPTY); 
            }
        }
        
        // draw the empty board 
        this.draw();
    }, 
    
    getContext: function() {
        return this.canvas.getContext("2d");
    }, 
    
    // draws the board based on the state of the game stored in the model 
    draw: function() {
        
        // clear the canvas
        this.getContext().clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // draw the grid 
        var ctx = this.getContext(); 
        ctx.lineWidth = 2; 
        ctx.strokeStyle = "#333";
        for (var i = 1; i < this.size; i ++) {
            // vertical 
            ctx.beginPath(); 
            ctx.moveTo(this.cellsize * i, 0); 
            ctx.lineTo(this.cellsize * i, this.canvas.height); 
            ctx.stroke();
            
            // horizontal 
            ctx.beginPath(); 
            ctx.moveTo(0, this.cellsize * i); 
            ctx.lineTo(this.canvas.width, this.cellsize * i); 
            ctx.stroke(); 
        }
        
        // draw items in the grid 
        for (var i = 0; i < this.size; i ++) {
            for (var j = 0; j < this.size; j ++) {
                var item = this.model[i][j]; 
                switch (item) {
                    case this.EMPTY: 
                        break; 
                    case this.CIRCLE: 
                        this.drawCircle(i, j); 
                        break; 
                    case this.CROSS: 
                        this.drawCross(i, j); 
                        break; 
                }
            }
        }
    },
    
    centerOfCell: function(i, j) {
        return {
            x : this.cellsize * i + this.cellsize/2,
            y : this.cellsize * j + this.cellsize/2
        };
    },
    
    cellCoor : function(x, y) {
        return {
            h : Math.floor(x / this.cellsize), 
            v : Math.floor(y / this.cellsize)
        };
    },
    
    drawCircle: function(i, j) {
        var r = this.cellsize * 0.3;
        var c = this.centerOfCell(i, j); 
        var ctx = this.getContext(); 
        ctx.lineWidth = 20; 
        ctx.strokeStyle = "#00aa00"; 
        ctx.beginPath(); 
        ctx.arc(c.x, c.y, r, 0, 2 * Math.PI, false);
        ctx.stroke(); 
    },
    
    drawCross: function(i, j) {
        var r = this.cellsize * 0.35;
        var c = this.centerOfCell(i, j); 
        var ctx = this.getContext(); 
        ctx.lineWidth = 20; 
        ctx.strokeStyle = "#0000ff"; 
        ctx.save(); 
        ctx.translate(c.x, c.y); 
        ctx.rotate(Math.PI/4); 
        ctx.beginPath(); 
        ctx.moveTo(0, -r); 
        ctx.lineTo(0, r); 
        ctx.stroke(); 
        ctx.beginPath(); 
        ctx.moveTo(-r, 0); 
        ctx.lineTo(r, 0); 
        ctx.stroke(); 
        ctx.restore(); 
    },
    
    doMouseDown: function(event) {
        var rect = this.canvas.getBoundingClientRect();        
        var x = event.clientX - rect.left; 
        var y = event.clientY - rect.top; 
        var c = this.cellCoor(x, y); 
        
        if (this.model[c.h][c.v] == 0 && this.turn == this.HUMAN) {
            // reflect the human move on the board 
            this.turn = this.COMPUTER;
            this.model[c.h][c.v] = this.HUMAN; 
            this.draw();
            
            var value = this.evaluatePosition(this.model); 
            if (value != this.LOST && value != this.WON) {
                // let the computer make its move 
                var self = this; 
                setTimeout(function() {
                    var move = self.getNextMove(); 
                    if (move) {
                        self.model = self.makeMove(self.model, move, self.COMPUTER); 
                        self.draw();

                        // if the game is not over, give control back to human 
                        var value = self.evaluatePosition(self.model); 
                        if (value != self.LOST && value != self.WON) {
                            self.turn = self.HUMAN;
                        }
                    }
                }, 10); 
            }
        }
    }, 
    
    generateMoves: function(model) {
        var rv = new Array(); 
        for (var i = 0; i < this.size; i ++) {
            for (var j = 0; j < this.size; j ++) {
                if (model[i][j] == this.EMPTY) {
                    rv.push({h: i, v: j}); 
                }
            }
        }
        return rv;  
    }, 
    
    cloneModel: function(model) {
        var rv = new Array(); 
        for (var i = 0; i < this.size; i ++) {
            var col = new Array(); 
            rv.push(col); 
            for (var j = 0; j < this.size; j ++) {
                col.push(model[i][j]); 
            }
        }
        return rv; 
    },
    
    makeMove: function(model, move, role) {
        if (model[move.h][move.v] == this.EMPTY) {
            var m = this.cloneModel(model); 
            m[move.h][move.v] = role; 
            return m; 
        }
        return null;
    }, 
    
    getNextMove: function() {
        var nextMove = null; 
        var moves = this.generateMoves(this.model); 
        var bestValue = this.LOST; 
        for (var i = 0; i < moves.length; i ++) {
            var model = this.makeMove(this.model, moves[i], this.COMPUTER); 
            var value = this.minimax(model, this.HUMAN, this.depth); 
            if (value > bestValue) {
                nextMove = moves[i];
                bestValue = value; 
                if (bestValue == this.WON) {
                    return nextMove; 
                }
            } else if (value == bestValue && Math.random() > 0.5) {
                nextMove = moves[i];
            }
        }
        // playing for a tie 
        return nextMove; 
    },
    
    minimax: function(m, role, depth) {
        // check if we have reached a leaf node 
        var bestValue = this.evaluatePosition(m); 
        if (depth == 0 || bestValue == this.WON || bestValue == this.LOST) {
            return bestValue; 
        }
        
        var d = this.depth - depth; 
        var moves = this.generateMoves(m); 
        if (role == this.COMPUTER && moves.length > 0) {
            // in this node we are playing to maximize the result 
            bestValue = this.LOST; 
            for (var i = 0; i < moves.length; i ++) {
                var model = this.makeMove(m, moves[i], role); 
                var val = this.minimax(model, role == this.HUMAN ? this.COMPUTER : this.HUMAN, (depth-1)); 
                if (val > bestValue) {
                    bestValue = val;
                }
                if (bestValue == this.WON) {
                    return bestValue; 
                }
            }
        } else if (role == this.HUMAN && moves.length > 0) {
            // in this node we are playing to minimize the result 
            bestValue = this.WON; 
            for (var i = 0; i < moves.length; i ++) {
                var model = this.makeMove(m, moves[i], role); 
                var val = this.minimax(model, role == this.HUMAN ? this.COMPUTER : this.HUMAN, (depth-1)); 
                if (val < bestValue) {
                    bestValue = val;
                }
                if (bestValue == this.LOST) {
                    return bestValue;
                }
            }
        }

        // we reached a tie ... 
        return bestValue;
    },
    
    evaluateSequence: function(player, count) {
        if (count < 2 || player == this.EMPTY) {
            return 0;
        }
        if (count == this.maxlen) {
            return player == this.COMPUTER ? this.WON : this.LOST;
        } else {
            var score = Math.pow(10, count); 
            return player == this.COMPUTER ? score : -score;
        }
    },
    
    evaluatePosition: function(model) {
        var totalScore = 0; 
        
        // process columns 
        for (var i = 0; i < this.size; i ++) {
            // initialize the player to none 
            // and the count of items in a sequnce to zero 
            var player = this.EMPTY; 
            var count = 0; 
            for (var j = 0; j < this.size; j ++) {
                if (model[i][j] != player) {
                    score = this.evaluateSequence(player, count); 
                    if (score == this.WON || score == this.LOST) {
                        return score; 
                    }
                    totalScore += score; 
                    count = 1; 
                    player = model[i][j];
                } else if (player != this.EMPTY) {
                    count ++;
                }
            }
            var score = this.evaluateSequence(player, count); 
            if (score == this.WON || score == this.LOST) {
                return score; 
            }
            totalScore += score; 
        }
        
        // process rows 
        for (var j = 0; j < this.size; j ++) {
            var player = this.EMPTY; 
            var count = 0; 
            for (var i = 0; i < this.size; i ++) {
                if (model[i][j] != player) {
                    score = this.evaluateSequence(player, count); 
                    if (score == this.WON || score == this.LOST) {
                        return score; 
                    }
                    totalScore += score; 
                    count = 1; 
                    player = model[i][j];
                } else if (player != this.EMPTY) {
                    count ++;
                }
            }
            var score = this.evaluateSequence(player, count); 
            if (score == this.WON || score == this.LOST) {
                return score; 
            }
            totalScore += score; 
        }
        
        return totalScore;
    }
});

