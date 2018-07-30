
// initial settings
var settings ={
    width:960,
    height:640,
    num:10,
    imgHeight:55,
    imgWidth:20,
    unitSpeed:2,
    unitSize:4,
    hitSize:5,
    groupingRange:5,
    detectionRange:12,
    attnSpan:800,
    attnSpanMin:300,
    coneLength: 25,
    coneWidth: 10,
    fingerSize: 10,
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
// c.addEventListener("mousedown", unitInteraction, false);

function unitInteraction(e){  
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
    var found = false;
    // todo 
    // this should really use the global cordinate system to determine finger click
    for (var ID=0;ID<unitInstances.length;ID++){
        if(unitInstances[ID].x<=x+settings.fingerSize && unitInstances[ID].x>=x-settings.fingerSize && unitInstances[ID].y<=y+settings.fingerSize && unitInstances[ID].y>=y-settings.fingerSize){
            found = unitInstances[ID];
            break;
        }
    }
    if(found){
        var unitNeighbors = findNeighbors(unitInstances[ID]);
        
        for(var i = unitNeighbors.length - 1; i >= 0; i--) {
            if(typeof unitInstances[unitNeighbors[i]] != 'undefined'){
               swarmifyUnit(unitInstances[unitNeighbors[i]]);
            }
        }
    }
}

function wallifyUnit(single){
    single.speed = 0;
    single.size = settings.unitSize*4;
    single.fill = '#fff';
    single.stroke = '#fff';
    single.dead = true;
}

// todo 
// should have been able to just reinitialize the unit rather then explicitly set
function swarmifyUnit(single){
    single.speed = 1;
    single.size = settings.unitSize;
    single.fill = settings.fill;
    single.stroke = settings.stroke;
    single.dead = false;
}

function findNeighbors(single){
    //var xyCoords = coordID(single).split(/x|y/).filter(Boolean);
    var xArr = [];
    var yArr = [];
    var neighborArr = [];
    var range = single.size;
    // build x coords arr
    for (var i = range; i >= 0; i--){
        xArr.push(single.x-range+i);
    }
    // build y coords arr
    for (var i = range; i >= 0; i--){
        yArr.push(single.y-range+i);
    }
    // build all possible combos of x y arrs
    for(var i = 0; i < xArr.length; i++){
         for(var j = 0; j < yArr.length; j++){
            var potentialMatch = 'x'+xArr[i]+'y'+yArr[j];
            // check is a coord ID exists in thei frame for this potential combo
            if(typeof gps[potentialMatch] != "undefined"){
                neighborArr.push(gps[potentialMatch].index);
            }
         }
    }
    return neighborArr;
    
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
        console.log(player);
        if (evt.keyCode == 38) Object.assign(player, {direction:1,unitSpeed:2}) // up
        if (evt.keyCode == 39) Object.assign(player, {direction:2,unitSpeed:2}) // right
        if (evt.keyCode == 40) Object.assign(player, {direction:3,unitSpeed:2}) // down
        if (evt.keyCode == 37) Object.assign(player, {direction:4,unitSpeed:2}) // left
        evt.preventDefault();
    }
}

//and unset them when the right or left key is released
function onKeyUp(evt) {
    if ([38,39,40,37].indexOf(evt.keyCode) !== -1){
        Object.assign(player, {unitSpeed:0});
    }
}


document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);


function Unit(){
    this.x = settings.width/2;
    this.y = settings.height/2; 
    this.size = settings.unitSize;
    this.unitSpeed = settings.unitSpeed;
    this.direction = 0; 
    this.decision = 0;
    this.collision = 0;
    this.bool = (Math.floor(Math.random() * 2) == 0);
    this.choice = Math.floor(Math.random()*2) == 1 ? 1 : -1;
    this.decisionLog = [];
    this.type = 0;
    this.frame = 0;
    this.animrate = 2;
    this.fill = settings.fill;
    this.stroke = settings.stroke;
}

function Player(){
    this.x = settings.width/2;
    this.y = settings.height/2; 
    this.size = settings.unitSize*2;
    this.unitSpeed = 0;
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
            

            var indexID = coordID(arr[ID]);
            // new collision detection
            // if(indexID in gps){
            //     console.log(coordID(arr[ID]));
            // }else{
            //     console.log(indexID);
            // }

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
                if(!arr[ID] instanceof Player){
                    //unitSpeed set
                    arr[ID].unitSpeed= Math.floor(Math.random() * settings.unitSpeed)+.25;
                }
                
                // grouping behavior
                for (var i=0;i<arr.length;i++){
                    
                    // too close for comfort
                    if(arr[ID].x<=arr[i].x+arr[i].size && arr[ID].x>=arr[i].x-arr[i].size && arr[ID].y<=arr[i].y+arr[i].size && arr[ID].y>=arr[i].y-arr[i].size && ID!=i){
                        //collision 
                        arr[i].unitSpeed+=arr[i].unitSpeed < 2 ? .25 : 0;
                        arr[ID].unitSpeed-=arr[ID].unitSpeed > 0 ? .25 : 0;
                        arr[i].bool=arr[ID].bool;
                        arr[ID].bool=!arr[ID].bool;
                        arr[ID].collision=1;
                        arr[ID].wall = arr[ID].direction;
                    }else{
                        arr[ID].collision=0;
                        arr[ID].wall = null;
                    }

                    if(arr[ID].type == arr[i].type && (arr[i].collision < 1 || arr[ID].collision < 1) && ID!=i){
                        var grp = settings.groupingRange;
                        if(!arr[ID].human){grp+=1;}
                        
                        // in grp range
                        if(arr[ID].x<=arr[i].x+arr[i].size*settings.groupingRange && arr[ID].x>=arr[i].x-arr[i].size*settings.groupingRange && arr[ID].y<=arr[i].y+arr[i].size*settings.groupingRange && arr[ID].y>=arr[i].y-arr[i].size*settings.groupingRange){
                            arr[ID].direction = arr[i].direction;   
                            arr[ID].synapse=arr[i].synapse;
                            arr[ID].decision=arr[i].decision;
                            if(arr[ID].unitSpeed<settings.unitSpeed){
                            arr[ID].unitSpeed += Math.floor(Math.random() * arr[i].unitSpeed+.25)+.5;
                            }
                            if(arr[ID].human){
                            arr[ID].bool== (Math.floor(Math.random() * 2) == 0);
                            }else{
                            arr[ID].bool=arr[i].bool;
                            }
                        }
                    }
                        
                }
                            
            }
            
            // collider bool switch
            if(arr[ID].collision > 1 && arr[ID].wall != arr[ID].direction){
                arr[ID].bool=!arr[ID].bool;
                movearr(ID,arr[ID].direction,arr);
            }
            
            if(arr[ID].decision>arr[ID].synapse){
                    arr[ID].choice=arr[ID].choice*-1;
                    arr[ID].decision=0;
                    arr[ID].direction=0;
                    movearr(ID,arr[ID].direction,arr);
            }else{
                if(arr[ID].direction==0){
                    movearr(ID,Math.floor(Math.random() * 4)+1,arr);
                }else if(arr[ID].collision==0){
                    movearr(ID,arr[ID].direction,arr);  
                }
                
            }
        }
    }
}

function movearr(ID,dir,arr) {      
    
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
    
    if(!arr[ID].change && arr[ID].wall != 0){
        
    switch(dir)
    {
    //up
    case 1:
      arr[ID].y -= arr[ID].unitSpeed;
      if(arr[ID].bool){
      arr[ID].x += arr[ID].choice;
      }
      arr[ID].direction = 1;
      break;
    //right
    case 2:
      arr[ID].x += arr[ID].unitSpeed;
      if(arr[ID].bool){
      arr[ID].y -= arr[ID].choice;
      }
      arr[ID].direction = 2;
      break;
    //down
    case 3:
      arr[ID].y += arr[ID].unitSpeed;
      if(arr[ID].bool){
      arr[ID].x -= arr[ID].choice;
      }
      arr[ID].direction = 3;
      break;
    //left
    case 4:
      arr[ID].x -= arr[ID].unitSpeed;
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

function timeLoop() {
    // global pos obj array
    gps={};
    ctx.clearRect(0,0,c.width,c.height);
    //ctx.globalAlpha = 0.2;
    rollDice(unitInstances);
    drawUnitsLoop(unitInstances);
    settings.fps = setTimeout(timeLoop, 1000 / 30);
    //console.log(unitInstances[0]);
    //console.log(Object.keys(gps).length);
}  
timeLoop();