class Core {
    constructor(canvas) {
        let self = this;
        this.settings ={
            width:882, // .9 of 100% upscale in css
            height:576, // .9 of 100% upscale in css
            imgHeight:55,
            imgWidth:20,
            coneLength: 25,
            coneWidth: 10,
            velocity:1,
            unitSize:4,
            hitSize:5,
            fill: 'rgba(186, 85, 211, .9)',
            config: [
                { class:Gremlin, count:30 },
                { class:Player, count:1 }
            ]
        };

        this.c = canvas;
        // 2d graphic context for canvas
        this.ctx = this.c.getContext('2d'); 
        // apply settings to canvas
        this.c.width = this.settings.width;  
        this.c.height = this.settings.height;

        this.gps = {};

        // variable operators
        this.operators = {
            '>': function(a, b){ return a > b; },
            '<': function(a, b){ return a < b; }
            // ...
        };

        this.generate = {
            units: function(config){
                for(var i=0;i<config.length;i++){
                    this.instances(config[i]);
                }
                return;
            },
            instances: function(type){
                let unit = null;
                for(var i=0;i<type.count;i++){
                    unit = new type.class(self);
                    self.gps[unit.coordID()] = {unit:unit};
                }
                if(unit instanceof Player){
                    self.player = unit;
                }
                return;
            }
        }
        
        this.init = this.generate.units(this.settings.config);
    }

    isOdd(num){ return num % 2; };

    rng(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }

    render() {
        for (let key in this.gps){
            // temp store unit from the next move
            let unit = this.gps[key].unit.rollDice();
            let id = unit.coordID();

            // check to prevent overlap
            if(typeof this.gps[id] == "undefined"){
                // reinsert unit into mastor record at new coord id
                this.gps[id] = {unit:unit};
                // verify that the entry is the same id before deletion
                if(unit._id === this.gps[key].unit._id){
                    // delete the current position of unit from the mastor record
                    delete this.gps[key];
                    // render this unit at its new position
                    unit.render();
                    continue;
                }
            }

            this.gps[key].unit.render();
        }
        return;
    }

}

class Render {
    constructor(C){
        this.C = C;
    }
    render(){
        this.C.ctx.beginPath();
        this.C.ctx.moveTo(this.x, this.y - this.size);
        this.C.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI, false);
        this.C.ctx.fillStyle = this.fill;    
        this.C.ctx.fill();
        this.C.ctx.closePath();
        if(!this.dead){
            this.drawCone();
        }
        
        //sprite drw animation
        if(!this.dead && this.sprite){
            this.C.ctx.drawImage(this.img,this.frame,0,20,60,this.x-(this.C.settings.imgWidth/2),this.y-this.C.settings.imgHeight,20,60);
            this.animrate = (this.animrate) ? this.animrate-1 : 2;
            if(!this.animrate && this.velocity){
                this.frame = (this.frame<60) ? this.frame+20 : 0;
            }
        }
        return this;
    }
    setSprite(){
        if(!this.sprite || !this.direction){
            return;
        }
        let spriteMap = [
            null,
            'up',
            'right',
            'down',
            'left',
        ];
        this.img.src = this.sprite[spriteMap[this.direction]];
        return;
    }
    drawCone(){
        // detectionRange cone draw
        this.C.ctx.beginPath();
        this.C.ctx.moveTo(this.x, this.y);
        
        let obj = {
            W:this.C.settings.coneWidth,
            L:this.C.settings.coneLength,
            align: 1
        };

        switch(this.direction){
            //up
            case 1:
                // assign up sprite
                this.setSprite();
                break;
            //right
            case 2:
                obj.align = -1;
                if(this.choice == 1 && this.bool){
                    obj.align = 1;
                }
                // assign right sprite
                this.setSprite();
              break;
            //down
            case 3:
                obj.align = -1;
                // assign down sprite
                this.setSprite();
              break;
            //left
            case 4:
                if(this.choice == 1 && this.bool){
                    obj.align = -1;
                }
                // assign left sprite
                this.setSprite();
              break;
            default:
              //do nothing
        }
        this.conePath(obj);

        this.C.ctx.lineTo(this.x, this.y);  
        this.C.ctx.fillStyle = 'rgba(255, 255, 0, .02)';
        this.C.ctx.fill();
        
        this.C.ctx.lineWidth = 1;
        this.C.ctx.strokeStyle = 'rgba(255, 255, 0, .05)';
        this.C.ctx.stroke();
        this.C.ctx.closePath();
        return;
    }

    conePath(obj){
        if(this.bool){
            this.C.ctx.lineTo(this.x+(obj.L * this.choice) * obj.align, this.y+(obj.W * (obj.align * -1)));
            this.C.ctx.lineTo(this.x+(obj.W * this.choice) * obj.align, this.y+(obj.L * (obj.align * -1)));
        }else if(core.isOdd(this.direction)){
            this.C.ctx.lineTo(this.x+(obj.W * (obj.align * -1)), this.y+(obj.L * (obj.align * -1)));
            this.C.ctx.lineTo(this.x+(obj.W * obj.align), this.y+(obj.L * (obj.align * -1)));
        }else{
            this.C.ctx.lineTo(this.x+(obj.L * (obj.align * -1)), this.y+(obj.W * (obj.align * -1)));
            this.C.ctx.lineTo(this.x+(obj.L * (obj.align * -1)), this.y+(obj.W * obj.align));
        }
        return;
    }
}

class Unit extends Render{
    constructor(C){
        super(C);
        this.C = C;
        this.img = new Image();
        // random unique id
        this._id = (Date.now().toString(36) + Math.random().toString(36).substr(2, 9)).toUpperCase();
        this.timestamp = Date.now();
    }

    // will need to pass thes unitarrays or gps into this or will fail
    coordID(location=this){
        return 'x'+ Math.floor(location.x) + 'y' + Math.floor(location.y);
    };

    getDefault(key){
        let objClass = this.constructor;
        let inst = new objClass(this.C);
        return inst[key];
    }

    // this things perf is shit, fix it.
    findNeighbors(proximity=1){
        var coordInRange = [];
        var neighborArr = [];
        var range = this.size*proximity;
        var selfId = this.coordID();
        
        // build x/y coords arr
        for (var i = range; i >= 0; i--){
            for (var j = range; j >= 0; j--){
            // build key list
            coordInRange.push('x'+((this.x+(range/2))-i)+'y'+((this.y+(range/2))-j));
            }
        }

        // ignore self
        delete coordInRange[selfId];

        for(var i = 0; i < coordInRange.length; i++){
            // check is a coord ID exists
            if(this.C.gps.hasOwnProperty(coordInRange[i])){
            //if(typeof this.C.gps[coordInRange[i]] != "undefined"){
                // ensure that any remnant instance of this id is not pushed
                if(this.C.gps[coordInRange[i]].unit._id !== this._id){
                    neighborArr.push(this.C.gps[coordInRange[i]].unit);
                }
            } 
        }
        return neighborArr;   
    };

    checkProximity(single,location){
        let distX =  Math.abs(single.x - location.x);
        let distY =  Math.abs(single.y - location.y);
        return Math.ceil(distX + distY);  
    }

    plotCourse(single,location){
        // could add a check for which of the last, in order to ensure the course is more direct rather then boxy
        if(location.y < single.y){
            single.direction = 1;
            single.y -= single.velocity;
        }
        if(location.x < single.x){
            single.direction = 4;
            single.x -= single.velocity;
        }
        if(location.y > single.y){
            single.direction = 3;
            single.y += single.velocity;
        }
        if(location.x > single.x){
            single.direction = 2;
            single.x += single.velocity;
        }
        return single;
    }

    futurePosition() {
        // returns estimated future postion {x,y}
        let futurePos = {x:this.x,y:this.y}
        switch(this.direction)
        {
        //up
        case 1:
            futurePos.y = this.y - (this.velocity**2);
            futurePos.x = this.x + this.choice;
          break;
        //right
        case 2:
            futurePos.x = this.x + (this.velocity**2);
            futurePos.y = this.y - this.choice;
          break;
        //down
        case 3:
            futurePos.y = this.y + (this.velocity**2);
            futurePos.x = this.x - this.choice;
          break;
        //left
        case 4:
            futurePos.x = this.x - (this.velocity**2);
            futurePos.y = this.y + this.choice;
          break;
        default:
            futurePos.x = this.x;
            futurePos.y = this.y;
        }
        return futurePos;
    }

    pursuitCourse(target) {
        // var distance = (target.x - self.x)+(target.y - self.y);
        if(target.y < this.y){
            this.direction = 1;
            this.y -= this.velocity;
        }
        if(target.x < this.x){
            this.direction = 4;
            this.x -= this.velocity;
        }
        if(target.y > this.y){
            this.direction = 3;
            this.y += this.velocity;
        }
        if(target.x > this.x){
            this.direction = 2;
            this.x += this.velocity;
        }
        return;     
    }

   move() {          
        if(this instanceof Unit){

            this.decisionLog.push(this.direction);
     
            if(this.decisionLog.length > 3){
                this.decisionLog.splice(0, 1);
            }
            
            if(this.decisionLog.indexOf(this.direction)){
                this.bool = !this.bool;
            }
            
            if(this.collision){
                this.bool = !this.bool;
            }
        }
        
        if(!this.change && this.wall != 0){
            
            switch(this.direction){
                //up
                case 1:
                  this.y -= this.velocity;
                  if(this.bool){
                  this.x += this.choice;
                  }
                  break;
                //right
                case 2:
                  this.x += this.velocity;
                  if(this.bool){
                  this.y -= this.choice;
                  }
                  break;
                //down
                case 3:
                  this.y += this.velocity;
                  if(this.bool){
                  this.x -= this.choice;
                  }
                  break;
                //left
                case 4:
                  this.x -= this.velocity;
                  if(this.bool){
                  this.y += this.choice;
                  }
                  break;
                default:
                  //do nothing
                  this.direction=Math.floor(Math.random() * 4)+1;
            }
        
        }
        // update timestamp for current 'move'
        this.timestamp = Date.now();
        return;
    }

    rollDice() {
        // check for pulse
        if(!this.dead){
        
            this.decision += Math.floor(Math.random() * 4)+1;
            
            //initial collision detect
            if(this.x<=this.size||this.x>=core.c.width-this.size||this.y<=this.size||this.y>=core.c.height-this.size){

                this.collision+=1;
                if(this.collision <= 1){
                    this.wall = this.direction;
                }
                
                if(this instanceof Unit){
                    switch(this.wall){
                        case 0:
                        this.direction=Math.floor(Math.random() * 4)+1;
                        break;
                        case 1:
                        this.direction=3;
                        break;
                        case 2:
                        this.direction=4;
                        break;
                        case 3:
                        this.direction=1;
                        break;
                        case 4:
                        this.direction=2;
                        break; 
                    }
                }
                            
            }else{
                
                //collision reset 
                this.collision=0;
                this.wall = null;
                
                //negate player
                if(!(this instanceof Player)){

                    // rng velocity set
                    this.velocity= Math.floor(Math.random() * core.settings.velocity)+1;

                    // new collision base on gps
                    var collision = this.findNeighbors(3); // set to 3 to account for size of both self and any colliders
                    if(collision.length){
                        for (var collider of collision){
                            this.bool=!collider.bool;
                            this.collision+= 1;
                            this.wall = this.direction;
                            this.velocity = 0; 
                            break;
                        }
                    }
// todo this should be run 1 time, and in the process as its running we assing the proximity, and check agains the various needs
                    // new grouping base on gps
                    // var grouping = findNeighbors(this,settings.groupingRange);
                    // if(grouping.length){
                    //     for (i of grouping){
                    //         if(arr[i] instanceof Unit){
                    //             this.direction = arr[i].direction;   
                    //             this.decision=arr[i].decision;
                    //             this.velocity=arr[i].velocity;
                    //             this.bool=arr[i].bool;
                    //             break;
                    //         }
                    //     }
                    // }
                    
                    var pursuit = this.findNeighbors(this.detectionRange);
                    if(pursuit.length>=1){
                        // console.log(pursuit);
                        for (var pursue of pursuit){
                            if(pursue instanceof Player){
                                this.pursuit = pursue;
                                break;
                            }
                        }
                    }
                    // handle unit changes and persistance of pursuit
                    if(this.pursuit){
                        // console.log(this.pursuit);
                        // for testing only, though could make a diff sprite frame for in pursuit
                        this.fill = 'red';
                        this.pursuitCourse(this.pursuit.futurePosition());
                        this.persistance -= 1;
                        if(this.persistance < 1){
                            this.pursuit = false;
                            this.fill = core.settings.fill;
                            this.persistance = this.C.rng(this.getDefault('persistance'));
                        }
                    }

                }
                            
            }
            
            if(this.collision >= 1 || this.wall != this.direction){
                this.bool=!this.bool;
            }
            this.move();
        }

        return this;
    }
}

class Player extends Unit{
    constructor(C){
        super(C);
        this.x = C.settings.width/2;
        this.y = C.settings.height/2; 
        this.size = C.settings.unitSize*2;
        this.velocity = 0;
        this.direction = 0; 
        this.decision = 0;
        this.collision = 0;
        this.bool = 0;
        this.choice = 0;
        this.decisionLog = [];
        // bool set to player type
        this.type = 1;
        this.frame = 0;
        this.animrate = 2;
        this.fill = 'rgba(18, 173, 42, 1)';
        // sprite
        this.sprite = {
            up: "lib/img/mysprites_tileset_walk_up.png",
            right: "lib/img/mysprites_tileset_walk_right.png",
            down: "lib/img/mysprites_tileset_walk_down.png",
            left: "lib/img/mysprites_tileset_walk_left.png",
        };
    }
}

class Gremlin extends Unit{
    constructor(C){
        super(C);
        this.x = Math.floor(Math.random() * C.settings.width);
        this.y = Math.floor(Math.random() * C.settings.height); 
        this.size = C.settings.unitSize;
        this.velocity = C.settings.velocity;
        this.direction = 0; 
        this.decision = 0;
        this.collision = 0;
        this.bool = (Math.floor(Math.random() * 2) == 0);
        this.choice = Math.floor(Math.random()*2) == 1 ? 1 : -1;
        this.decisionLog = [];
        this.startPos = {x:this.x,y:this.y};
        this.leash = 200;
        this.frame = 0;
        this.animrate = 2;
        this.fill = C.settings.fill;
        this.persistance = 100;
        this.groupingRange = 5;
        this.detectionRange = 15;
    }
}

class Controls {
    constructor(C){
        this.player = C.player;
        document.addEventListener("keydown", this.onKeyDown.bind(this));
        document.addEventListener("keyup", this.onKeyUp.bind(this));
    }
    //set rightDown or leftDown if the right or left keys are down
    onKeyDown(e) {
        if ([38,39,40,37].indexOf(e.keyCode) !== -1){
            if (e.keyCode == 38) Object.assign(this.player, {direction:1,velocity:4}) // up
            if (e.keyCode == 39) Object.assign(this.player, {direction:2,velocity:4}) // right
            if (e.keyCode == 40) Object.assign(this.player, {direction:3,velocity:4}) // down
            if (e.keyCode == 37) Object.assign(this.player, {direction:4,velocity:4}) // left
            e.preventDefault();
        }
    }

    //and unset them when the right or left key is released
    onKeyUp(e) {
        if ([38,39,40,37].indexOf(e.keyCode) !== -1){
            Object.assign(this.player, {velocity:0,frame:0});
        }
    }
}

var core = new Core(document.getElementsByTagName ('canvas')[0]);
let userControls = new Controls(core);

// // wrote this in a haze a while back.. I think the intent is to go toward or away from another based on bool
// function disposition(disp,arr,ID,i){
        
//         if(disp){
//         var l = '<';
//         var g = '>';
//         }else{
//         var l = '>';
//         var g = '<';    
//         }
        
//         // possibilities
//         if((arr[ID].direction==1 && arr[i].direction == 1 && operators[l](arr[ID].y, arr[i].y)) || arr[ID].direction==3 && arr[i].direction == 3 && operators[g](arr[ID].y, arr[i].y) || (arr[ID].direction==1 && arr[i].direction == 3 && operators[g](arr[ID].y, arr[i].y)) || (arr[ID].direction==2 && arr[i].direction == 4 && operators[g](arr[ID].y, arr[i].y)) || (arr[ID].direction==3 && arr[i].direction == 1 && operators[g](arr[ID].y, arr[i].y)) || (arr[ID].direction==3 && arr[i].direction == 2 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==3 && arr[i].direction == 4 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 2 && operators[l](arr[ID].y, arr[i].y))){
//             arr[ID].direction=3;                
//         }
//         if((arr[ID].direction==1 && arr[i].direction == 1 && operators[g](arr[ID].y, arr[i].y)) || arr[ID].direction==3 && arr[i].direction == 3 && operators[l](arr[ID].y, arr[i].y) || (arr[ID].direction==1 && arr[i].direction == 2 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==1 && arr[i].direction == 3 && operators[l](arr[ID].y, arr[i].y)) || arr[ID].direction==1 && arr[i].direction == 4 && operators[g](arr[ID].x, arr[i].x) || (arr[ID].direction==3 && arr[i].direction == 1 && operators[l](arr[ID].y, arr[i].y))){
//             arr[ID].direction=1;                
//         }
//         if((arr[ID].direction==2 && arr[i].direction == 2 && operators[g](arr[ID].x, arr[i].x)) || arr[ID].direction==4 && arr[i].direction == 4 && operators[l](arr[ID].x, arr[i].x) || (arr[ID].direction==1 && arr[i].direction == 2 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 1 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 3 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 4 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==3 && arr[i].direction == 2 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 1 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 2 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 3 && operators[g](arr[ID].x, arr[i].x))){
//             arr[ID].direction=2;                
//         }
//         if((arr[ID].direction==2 && arr[i].direction == 2 && operators[l](arr[ID].x, arr[i].x)) || arr[ID].direction==4 && arr[i].direction == 4 && operators[g](arr[ID].x, arr[i].x) || (arr[ID].direction==1 && arr[i].direction == 4 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 1 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 3 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 4 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==3 && arr[i].direction == 4 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 1 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 2 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 3 && operators[l](arr[ID].x, arr[i].x))){
//             arr[ID].direction=4;                
//         }
// }

function timeLoop() {
    core.ctx.clearRect(0,0,core.c.width,core.c.height);
    core.render();
} 
let init = setInterval(timeLoop, 1000 / 60);

// //helper functions
// core.c.addEventListener("mousedown", unitInteraction, false);

// function unitInteraction(e){  
//     var x = e.offsetX;
//     var y = e.offsetY;
//     var clicked = findNearest({x:x,y:y});
//     console.log(clicked);
// }

// findNearest(location){
//         var xArr = [];
//         var yArr = [];
//         var range = 20;
//         var selfId = this.coordID(location);
//         // build x coords arr
//         for (var i = range; i >= 0; i--){
//             xArr.push(location.x-range+i);
//         }
//         // build y coords arr
//         for (var i = range; i >= 0; i--){
//             yArr.push(location.y-range+i);
//         }
//         for(var i = 0; i < xArr.length; i++){
//              for(var j = 0; j < yArr.length; j++){
//                 var potentialMatch = 'x'+xArr[i]+'y'+yArr[j];
//                 // check is a coord ID exists in thei frame for this potential combo
//                 if(typeof gps[potentialMatch] != "undefined"){
//                     return gps[potentialMatch];
//                 }        
//              }
//         }    
//     }
