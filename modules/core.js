class Core {
    constructor(canvas) {
        let self = this;
        this.settings ={
            width:960,
            height:640,
            imgHeight:55,
            imgWidth:20,
            velocity:2,
            unitSize:4,
            hitSize:5,
            groupingRange:5,
            detectionRange:12,
            coneLength: 25,
            coneWidth: 10,
            fill: 'rgba(186, 85, 211, .9)',
            stroke: 'rgba(153, 50, 204, .1)',
            config: [
                { class:Gremlin, count:10 },
                { class:Player, count:1 }
            ]
        };

        this.c = canvas;
        // 2d graphic context for canvas
        this.ctx = this.c.getContext('2d'); 
        // apply settings to canvas
        this.c.width = this.settings.width;  
        this.c.height = this.settings.height;

        this.unitInstances = new Array();

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
            },
            instances: function(type){
                for(var i=0;i<type.count;i++){
                    self.unitInstances.push(new type.class(self));
                }
            }
        }

        this.init = this.generate.units(this.settings.config);
    }

    isOdd(num){ return num % 2; };

}

class Unit {
    constructor(C){
    }

    // will need to pass thes unitarrays or gps into this or will fail
    coordID(location=this){
        return 'x'+ Math.floor(location.x) + 'y' + Math.floor(location.y);
    };

    findNeighbors(proximity=1){
        var xArr = [];
        var yArr = [];
        var neighborArr = [];
        var range = (this.size*proximity)*2;
        var selfId = this.coordID();
        // build x coords arr
        for (var i = range; i >= 0; i--){
            xArr.push(this.x-range+i);
        }
        // build y coords arr
        for (var i = range; i >= 0; i--){
            yArr.push(this.y-range+i);
        }
        // build all possible combos of x y arrs
        for(var i = 0; i < xArr.length; i++){
             for(var j = 0; j < yArr.length; j++){
                var potentialMatch = 'x'+xArr[i]+'y'+yArr[j];
                if(potentialMatch==selfId){
                    continue;
                }
                // check is a coord ID exists
                if(typeof gps[potentialMatch] != "undefined"){
                    neighborArr.push(gps[potentialMatch].index);
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
            single.y -= single.velocity*.05;
        }
        if(location.x < single.x){
            single.direction = 4;
            single.x -= single.velocity*.05;
        }
        if(location.y > single.y){
            single.direction = 3;
            single.y += single.velocity*.05;
        }
        if(location.x > single.x){
            single.direction = 2;
            single.x += single.velocity*.05;
        }
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
    }
}

class Player extends Unit{
    constructor(C){
        super();
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
        this.stroke = C.settings.stroke;
    }
}

class Gremlin extends Unit{
    constructor(C){
        super();
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
        this.stroke = C.settings.stroke;
        this.persistance = Math.floor(Math.random() * 100)+1;
    }
}

class Controls {
    constructor(){
        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);
    }
    //set rightDown or leftDown if the right or left keys are down
    onKeyDown(evt) {
        if ([38,39,40,37].indexOf(evt.keyCode) !== -1){
            // console.log(player);
            if (evt.keyCode == 38) Object.assign(player, {direction:1,velocity:2}) // up
            if (evt.keyCode == 39) Object.assign(player, {direction:2,velocity:2}) // right
            if (evt.keyCode == 40) Object.assign(player, {direction:3,velocity:2}) // down
            if (evt.keyCode == 37) Object.assign(player, {direction:4,velocity:2}) // left
            evt.preventDefault();
        }
    }

    //and unset them when the right or left key is released
    onKeyUp(evt) {
        if ([38,39,40,37].indexOf(evt.keyCode) !== -1){
            Object.assign(player, {velocity:0});
        }
    }
}


var core = new Core(document.getElementsByTagName ('canvas')[0]);
let userControls = new Controls();

function drawUnit(unit){
    //draw a units
    core.ctx.beginPath();
        
    core.ctx.moveTo(unit.x, unit.y - unit.size);
      
    core.ctx.arc(unit.x, unit.y, unit.size, 0, 2 * Math.PI, false);
        
    core.ctx.lineWidth = unit.size;    
    core.ctx.strokeStyle = unit.stroke;
    core.ctx.stroke();

    core.ctx.fillStyle = unit.fill;    
    core.ctx.fill();
    core.ctx.closePath();
    
    if(!unit.dead){
        drawCone(unit);
    }

    //var img=new Image();
    
    // assign default sprite
    //img.src = "path/to/sprite";
    
    //sprite drw animation
    // if(!unit.dead){
    //     ctx.drawImage(img,arr[ID].frame,0,20,60,arr[ID].x-(settings.imgWidth/2),arr[ID].y-settings.imgHeight,20,60);
    //     unit.animrate = (unit.animrate) ? unit.animrate-1 : 2;
    //     if(!unit.animrate){
    //         unit.frame = (unit.frame<60) ? unit.frame+20 : 0;
    //     }
    // }

}

function conePath(obj){
    if(obj.unit.bool){
        obj.ctx.lineTo(obj.unit.x+(obj.L * obj.unit.choice) * obj.align, obj.unit.y+(obj.W * (obj.align * -1)));
        obj.ctx.lineTo(obj.unit.x+(obj.W * obj.unit.choice) * obj.align, obj.unit.y+(obj.L * (obj.align * -1)));
    }else if(core.isOdd(obj.unit.direction)){
        obj.ctx.lineTo(obj.unit.x+(obj.W * (obj.align * -1)), obj.unit.y+(obj.L * (obj.align * -1)));
        obj.ctx.lineTo(obj.unit.x+(obj.W * obj.align), obj.unit.y+(obj.L * (obj.align * -1)));
    }else{
        obj.ctx.lineTo(obj.unit.x+(obj.L * (obj.align * -1)), obj.unit.y+(obj.W * (obj.align * -1)));
        obj.ctx.lineTo(obj.unit.x+(obj.L * (obj.align * -1)), obj.unit.y+(obj.W * obj.align));
    }
}

function drawCone(unit){
    // detectionRange cone draw
    core.ctx.beginPath();
    core.ctx.moveTo(unit.x, unit.y);
    
    var W = core.settings.coneWidth;
    var L = core.settings.coneLength;
    obj = {
        ctx:core.ctx,
        unit:unit,
        W:W,
        L:L,
        align: 1
    };

    switch(unit.direction)
        {
        //up
        case 1:
            // assign up sprite
            //img.src = "lib/img/mysprites_tileset_walk_up.png";
            break;
        //right
        case 2:
            obj.align = -1;
            if(unit.choice == 1 && unit.bool){
                obj.align = 1;
            }
            // assign right sprite
            //img.src = "lib/img/mysprites_tileset_walk_right.png";
          break;
        //down
        case 3:
            obj.align = -1;
            // assign down sprite
            //img.src = "lib/img/mysprites_tileset_walk_down.png";
          break;
        //left
        case 4:
            if(unit.choice == 1 && unit.bool){
                obj.align = -1;
            }
            // assign left sprite
            //img.src = "lib/img/mysprites_tileset_walk_left.png";
          break;
        default:
          //do nothing
    }
    conePath(obj);

    core.ctx.lineTo(unit.x, unit.y);  
    core.ctx.fillStyle = 'rgba(255, 255, 0, .05)';
    core.ctx.fill();
    
    core.ctx.lineWidth = unit.size;
    core.ctx.strokeStyle = 'rgba(255, 255, 0, .09)';
    core.ctx.stroke();
    core.ctx.closePath();
}

function drawUnitsLoop(arr) {
    for (var ID=0;ID<arr.length;ID++){
        drawUnit(arr[ID]);
        // build coordinate index id
       console.log(arr[ID]);
       // gps[arr[ID].coordID()] = {index:ID, unit:arr[ID]};
    }
}

function disposition(disp,arr,ID,i){
        
        if(disp){
        var l = '<';
        var g = '>';
        }else{
        var l = '>';
        var g = '<';    
        }
        
        // possibilities
        if((arr[ID].direction==1 && arr[i].direction == 1 && operators[l](arr[ID].y, arr[i].y)) || arr[ID].direction==3 && arr[i].direction == 3 && operators[g](arr[ID].y, arr[i].y) || (arr[ID].direction==1 && arr[i].direction == 3 && operators[g](arr[ID].y, arr[i].y)) || (arr[ID].direction==2 && arr[i].direction == 4 && operators[g](arr[ID].y, arr[i].y)) || (arr[ID].direction==3 && arr[i].direction == 1 && operators[g](arr[ID].y, arr[i].y)) || (arr[ID].direction==3 && arr[i].direction == 2 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==3 && arr[i].direction == 4 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 2 && operators[l](arr[ID].y, arr[i].y))){
            arr[ID].direction=3;                
        }
        if((arr[ID].direction==1 && arr[i].direction == 1 && operators[g](arr[ID].y, arr[i].y)) || arr[ID].direction==3 && arr[i].direction == 3 && operators[l](arr[ID].y, arr[i].y) || (arr[ID].direction==1 && arr[i].direction == 2 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==1 && arr[i].direction == 3 && operators[l](arr[ID].y, arr[i].y)) || arr[ID].direction==1 && arr[i].direction == 4 && operators[g](arr[ID].x, arr[i].x) || (arr[ID].direction==3 && arr[i].direction == 1 && operators[l](arr[ID].y, arr[i].y))){
            arr[ID].direction=1;                
        }
        if((arr[ID].direction==2 && arr[i].direction == 2 && operators[g](arr[ID].x, arr[i].x)) || arr[ID].direction==4 && arr[i].direction == 4 && operators[l](arr[ID].x, arr[i].x) || (arr[ID].direction==1 && arr[i].direction == 2 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 1 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 3 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 4 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==3 && arr[i].direction == 2 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 1 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 2 && operators[g](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 3 && operators[g](arr[ID].x, arr[i].x))){
            arr[ID].direction=2;                
        }
        if((arr[ID].direction==2 && arr[i].direction == 2 && operators[l](arr[ID].x, arr[i].x)) || arr[ID].direction==4 && arr[i].direction == 4 && operators[g](arr[ID].x, arr[i].x) || (arr[ID].direction==1 && arr[i].direction == 4 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 1 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 3 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==2 && arr[i].direction == 4 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==3 && arr[i].direction == 4 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 1 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 2 && operators[l](arr[ID].x, arr[i].x)) || (arr[ID].direction==4 && arr[i].direction == 3 && operators[l](arr[ID].x, arr[i].x))){
            arr[ID].direction=4;                
        }
}

function rollDice(arr) {
    for (var ID=0;ID<arr.length;ID++){

        // check for pulse
        if(!arr[ID].dead){
        
            arr[ID].decision += Math.floor(Math.random() * 4)+1;
            
            //initial collision detect
            if(arr[ID].x<=arr[ID].size||arr[ID].x>=core.c.width-arr[ID].size||arr[ID].y<=arr[ID].size||arr[ID].y>=core.c.height-arr[ID].size){

                arr[ID].collision+=1;
                if(arr[ID].collision <= 1){
                    arr[ID].wall = arr[ID].direction;
                }
                
                if(arr[ID] instanceof Unit){
                    switch(arr[ID].wall){
                        case 0:
                        arr[ID].direction=Math.floor(Math.random() * 4)+1;
                        break;
                        case 1:
                        arr[ID].direction=3;
                        break;
                        case 2:
                        arr[ID].direction=4;
                        break;
                        case 3:
                        arr[ID].direction=1;
                        break;
                        case 4:
                        arr[ID].direction=2;
                        break; 
                    }
                }
                            
            }else{
                
                //collision reset 
                arr[ID].collision=0;
                arr[ID].wall = null;
                
                //negate player
                if(arr[ID] instanceof Unit){
                    // rng velocity set
                    arr[ID].velocity= Math.floor(Math.random() * core.settings.velocity)+.5;

                    // new collision base on gps
                    // var collision = findNeighbors(arr[ID]);
                    // if(collision.length){
                    //     for (i of collision){
                    //         if(arr[i] instanceof Unit){
                    //             arr[ID].bool=!arr[i].bool;
                    //             arr[ID].collision=1;
                    //             arr[ID].wall = arr[i].direction;
                    //             arr[ID].velocity = arr[i].velocity > 0 ? (arr[i].velocity*.75) : settings.velocity;
                    //             break;
                    //         }
                    //     }
                    // }

                    // new grouping base on gps
                    // var grouping = findNeighbors(arr[ID],settings.groupingRange);
                    // if(grouping.length){
                    //     for (i of grouping){
                    //         if(arr[i] instanceof Unit){
                    //             arr[ID].direction = arr[i].direction;   
                    //             arr[ID].decision=arr[i].decision;
                    //             arr[ID].velocity=arr[i].velocity;
                    //             arr[ID].bool=arr[i].bool;
                    //             break;
                    //         }
                    //     }
                    // }
                    
                    var pursuit = arr[ID].findNeighbors(core.settings.detectionRange);
                    if(pursuit.length){
                        for (i of pursuit){
                            if(arr[i] instanceof Player){
                                arr[ID].pursuit = true;
                                break;
                            }
                        }
                    }
                    // handle unit changes and persistance of pursuit
                    if(arr[ID].pursuit){
                        // for testing only, though could make a diff sprite frame for in pursuit
                        arr[ID].fill = 'red';
                        arr[ID].pursuitCourse(arr[i].futurePosition());
                        arr[ID].persistance -= 1;
                        if(arr[ID].persistance < 1){
                            arr[ID].pursuit = false;
                            arr[ID].fill = core.settings.fill;
                            arr[ID].persistance = Math.floor(Math.random() * 100)+1;
                        }
                    }

                }
                            
            }

            // collider bool switch
            if(arr[ID].collision >= 1 && arr[ID].wall != arr[ID].direction){
                arr[ID].bool=!arr[ID].bool;
                movearr(ID,arr[ID].direction,arr);
                continue;
            }
            
            // negate player
            if(arr[ID] instanceof Unit && !arr[ID].pursuit){
                
                // // handle start position leashing
                // if(checkProximity(arr[ID],arr[ID].startPos)>arr[ID].leash){
                //     plotCourse(arr[ID],arr[ID].startPos);
                //     movearr(ID,arr[ID].direction,arr);
                //     continue;
                // }

                // no direction set
                if(arr[ID].direction==0){
                    movearr(ID,Math.floor(Math.random() * 4)+1,arr);
                }else if(arr[ID].collision==0){
                    movearr(ID,arr[ID].direction,arr);  
                }
                
            }else{ // dont add check for collision without accounting for the clearing of the collided 
                movearr(ID,arr[ID].direction,arr);
            }

        }
    }
}

function movearr(ID,dir,arr) {          
    if(arr[ID] instanceof Unit){

        arr[ID].decisionLog.push(dir);
 
        if(arr[ID].decisionLog.length > 3){
            arr[ID].decisionLog.splice(0, 1);
        }
        
        if(arr[ID].decisionLog.indexOf(dir)){
            arr[ID].bool = !arr[ID].bool;
        }
        
        if(arr[ID].collision){
            arr[ID].bool = !arr[ID].bool;
        }
    }
    
    if(!arr[ID].change && arr[ID].wall != 0){
        
    switch(dir)
    {
    //up
    case 1:
      arr[ID].y -= arr[ID].velocity;
      if(arr[ID].bool){
      arr[ID].x += arr[ID].choice;
      }
      arr[ID].direction = 1;
      break;
    //right
    case 2:
      arr[ID].x += arr[ID].velocity;
      if(arr[ID].bool){
      arr[ID].y -= arr[ID].choice;
      }
      arr[ID].direction = 2;
      break;
    //down
    case 3:
      arr[ID].y += arr[ID].velocity;
      if(arr[ID].bool){
      arr[ID].x -= arr[ID].choice;
      }
      arr[ID].direction = 3;
      break;
    //left
    case 4:
      arr[ID].x -= arr[ID].velocity;
      if(arr[ID].bool){
      arr[ID].y += arr[ID].choice;
      }
      arr[ID].direction = 4;
      break;
    default:
      //do nothing
      arr[ID].direction=0;
    }
    
    }
};

// id the player for all use
let player = core.unitInstances.find(unit => unit instanceof Player);

// global pos obj array
gps={};

function timeLoop() {
    core.ctx.clearRect(0,0,core.c.width,core.c.height);
    //ctx.globalAlpha = 0.2;
    rollDice(core.unitInstances);
    // global pos obj array
    gps={};
    drawUnitsLoop(core.unitInstances);
    //console.log(unitInstances[0]);
    //console.log(Object.keys(gps).length);
} 
let init = setInterval(timeLoop, 1000 / 30);

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
