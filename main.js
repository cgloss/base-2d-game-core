
// initial settings
var settings ={
    width:960,
    height:640,
    num:10,
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
}

// instances array
unitInstances=[];

//canvas itself
c = document.getElementsByTagName ('canvas')[0];  

// variable operators
var operators = {
    '>': function(a, b) { return a > b; },
    '<': function(a, b) { return a < b; }
    // ...
};

// odd chk
function isOdd(num) { return num % 2;}

//and two-dimensional graphic context of the canvas
ctx = c.getContext('2d');  

// apply settings to canvas
c.width = settings.width;  
c.height = settings.height;

//helper functions
c.addEventListener("mousedown", unitInteraction, false);

function unitInteraction(e){  
    var x = e.offsetX;
    var y = e.offsetY;
    var clicked = findNearest({x:x,y:y});
    console.log(clicked);
}


function findNeighbors(single,proximity=1){
    //var xyCoords = coordID(single).split(/x|y/).filter(Boolean);
    var xArr = [];
    var yArr = [];
    var neighborArr = [];
    var range = (single.size*proximity)*2;
    var selfId = coordID(single);
    // build x coords arr
    for (var i = range; i >= 0; i--){
        xArr.push(single.x-range+i);
    }
    // build y coords arr
    for (var i = range; i >= 0; i--){
        yArr.push(single.y-range+i);
    }
    // console.log(xArr);
    // console.log(yArr);
    // build all possible combos of x y arrs
    for(var i = 0; i < xArr.length; i++){
         for(var j = 0; j < yArr.length; j++){
            var potentialMatch = 'x'+xArr[i]+'y'+yArr[j];
            if(potentialMatch==selfId){
                continue;
            }
            // check is a coord ID exists in thei frame for this potential combo
            if(typeof gps[potentialMatch] != "undefined"){
                neighborArr.push(gps[potentialMatch].index);
            }        
         }
    }
    return neighborArr;
    
}

function findNearest(location){
    var xArr = [];
    var yArr = [];
    var range = 20;
    var selfId = coordID(location);
    // build x coords arr
    for (var i = range; i >= 0; i--){
        xArr.push(location.x-range+i);
    }
    // build y coords arr
    for (var i = range; i >= 0; i--){
        yArr.push(location.y-range+i);
    }
    for(var i = 0; i < xArr.length; i++){
         for(var j = 0; j < yArr.length; j++){
            var potentialMatch = 'x'+xArr[i]+'y'+yArr[j];
            // check is a coord ID exists in thei frame for this potential combo
            if(typeof gps[potentialMatch] != "undefined"){
                return gps[potentialMatch];
            }        
         }
    }    
}

function checkProximity(single,location){
    let distX =  Math.abs(single.x - location.x);
    let distY =  Math.abs(single.y - location.y);
    return Math.ceil(distX + distY);  
}

function plotCourse(single,location){
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

function pursuitCourse(self,target) {
    // var distance = (target.x - self.x)+(target.y - self.y);
    var futurePos = {x:null,y:null};
    // todo create a list of direction commands for pursuit based on distance and future position
    // console.log(distance);

    switch(target.direction)
    {
    //up
    case 1:
        futurePos.y = target.y - (target.velocity*2);
        futurePos.x = target.x + target.choice;
      break;
    //right
    case 2:
        futurePos.x = target.x + (target.velocity*2);
        futurePos.y = target.y - target.choice;
      break;
    //down
    case 3:
        futurePos.y = target.y + (target.velocity*2);
        futurePos.x = target.x - target.choice;
      break;
    //left
    case 4:
        futurePos.x = target.x - (target.velocity*2);
        futurePos.y = target.y + target.choice;
      break;
    default:
        futurePos.x = target.x;
        futurePos.y = target.y;
    }

    if(futurePos.y < self.y){
        self.direction = 1;
        self.y -= self.velocity + target.velocity;
    }
    if(futurePos.x < self.x){
        self.direction = 4;
        self.x -= self.velocity + target.velocity;
    }
    if(futurePos.y > self.y){
        self.direction = 3;
        self.y += self.velocity + target.velocity;
    }
    if(futurePos.x > self.x){
        self.direction = 2;
        self.x += self.velocity + target.velocity;
    }
    
}

// user interactions 
// c.onmousemove = function(e) {
//     // check if user is drawling or spawning
//     if (!c.isDrawing && !c.isSpawning) {
//        return;
//     }
//     var single = new Unit;
//     single.x = e.pageX - this.offsetLeft;
//     single.y = e.pageY - this.offsetTop;
//     single.bool = 0;
//     if(e.movementY < 0){
//         single.direction = 1;
//     }
//     // todo need dir modifiers for bool and choice based on movement
//     // will require +2 for each potential choice 1 or -1 modifier

//     if(e.movementX > 0){
//         single.direction = 2;
//     }
//     if(e.movementY > 0){
//         single.direction = 3;
//     }
//     if(e.movementX < 0){
//         single.direction = 4;
//     }
//     if(c.isDrawing){
//         c.isSpawning = false;
//         clearTimeout(heldTimeout);
//         wallifyUnit(single);
//     }
//     unitInstances.push(single);

// }

// c.onmousedown = function(e) {
//     c.isDrawing = true;
//     heldTimeout = setTimeout(function(){
//         c.isDrawing = false;
//         c.isSpawning = true;
//     }, 1000);
// };
// c.onmouseup = function(e) {
//     c.isDrawing = false;
//     c.isSpawning = false;
//     clearTimeout(heldTimeout);
// };

//set rightDown or leftDown if the right or left keys are down
function onKeyDown(evt) {
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
function onKeyUp(evt) {
    if ([38,39,40,37].indexOf(evt.keyCode) !== -1){
        Object.assign(player, {velocity:0});
    }
}


document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);


function Unit(){
    this.x = Math.floor(Math.random() * settings.width);
    this.y = Math.floor(Math.random() * settings.height); 
    this.size = settings.unitSize;
    this.velocity = settings.velocity;
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
    this.fill = settings.fill;
    this.stroke = settings.stroke;
    this.persistance = Math.floor(Math.random() * 100)+1;
}

function Player(){
    this.x = settings.width/2;
    this.y = settings.height/2; 
    this.size = settings.unitSize*2;
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
    this.stroke = settings.stroke;
}

function genunitInstances(){
    for(var i=0;i<settings.num;i++){
        unitInstances.push(new Unit);
    }
};

function drawUnit(unit){
    //draw a units
    ctx.beginPath();
        
    ctx.moveTo(unit.x, unit.y - unit.size);
      
    ctx.arc(unit.x, unit.y, unit.size, 0, 2 * Math.PI, false);
        
    ctx.lineWidth = unit.size;    
    ctx.strokeStyle = unit.stroke;
    ctx.stroke();

    ctx.fillStyle = unit.fill;    
    ctx.fill();
    ctx.closePath();
    
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
    }else if(isOdd(obj.unit.direction)){
        obj.ctx.lineTo(obj.unit.x+(obj.W * (obj.align * -1)), obj.unit.y+(obj.L * (obj.align * -1)));
        obj.ctx.lineTo(obj.unit.x+(obj.W * obj.align), obj.unit.y+(obj.L * (obj.align * -1)));
    }else{
        obj.ctx.lineTo(obj.unit.x+(obj.L * (obj.align * -1)), obj.unit.y+(obj.W * (obj.align * -1)));
        obj.ctx.lineTo(obj.unit.x+(obj.L * (obj.align * -1)), obj.unit.y+(obj.W * obj.align));
    }
}

function drawCone(unit){
    // detectionRange cone draw
    ctx.beginPath();
    ctx.moveTo(unit.x, unit.y);
    
    var W = settings.coneWidth;
    var L = settings.coneLength;
    obj = {
        ctx:ctx,
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

    ctx.lineTo(unit.x, unit.y);  
    ctx.fillStyle = 'rgba(255, 255, 0, .05)';
    ctx.fill();
    
    ctx.lineWidth = unit.size;
    ctx.strokeStyle = 'rgba(255, 255, 0, .09)';
    ctx.stroke();
    ctx.closePath();
}

function coordID(unit){
    return 'x'+ Math.floor(unit.x) + 'y' + Math.floor(unit.y);
}

function drawUnitsLoop(arr) {
    for (var ID=0;ID<arr.length;ID++){
        drawUnit(arr[ID]);
        // build coordinate index id
        gps[coordID(arr[ID])] = {index:ID, unit:arr[ID]};
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
            if(arr[ID].x<=arr[ID].size||arr[ID].x>=c.width-arr[ID].size||arr[ID].y<=arr[ID].size||arr[ID].y>=c.height-arr[ID].size){

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
                    arr[ID].velocity= Math.floor(Math.random() * settings.velocity)+.5;

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
                    
                    var pursuit = findNeighbors(arr[ID],settings.detectionRange);
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
                        pursuitCourse(arr[ID],player);
                        arr[ID].persistance -= 1;
                        if(arr[ID].persistance < 1){
                            arr[ID].pursuit = false;
                            arr[ID].fill = settings.fill;
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

// spawn player
unitInstances.push(new Player);
// id the player for all use
let player = unitInstances.find(unit => unit instanceof Player);
genunitInstances();
// global pos obj array
gps={};

function timeLoop() {
    ctx.clearRect(0,0,c.width,c.height);
    //ctx.globalAlpha = 0.2;
    rollDice(unitInstances);
    // global pos obj array
    gps={};
    drawUnitsLoop(unitInstances);
    //console.log(unitInstances[0]);
    //console.log(Object.keys(gps).length);
} 
let init = setInterval(timeLoop, 1000 / 30);