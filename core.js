/**
 *  Base 2d game classes
 *
 *  Classes -
 *      Core handles configuration settings, contexting, and initial generation of instances
 *      Controls adds event listeners for player controls
 *      Render draws unit instances after processing, view cones, and sprites
 *      Unit base class for unit type classes and all unit logic based on configuration of specific classes which extend it
 *
 *  [@cgloss](https://github.com/cgloss)
*/

// TODOS
// push units
// z index zooming for topography
// trail following

// Mechanics
// hit points
// stats
// roll for hit

// Design
// update graphics
// action animateion
// tool in hand animation

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
      velocity:2,
      unitSize:4,
      hitSize:5,
      fill: 'rgba(186, 85, 211, .9)',
      config: [
        { class:Gremlin, count:5, leash: 100 },
        { class:Gremlin, count:5, leash: 200 },
        { class:Gremlin, count:5, leash: 300 },
        { class:Gremlin, count:5 },
        { class:Player, count:1 }
      ]
    };

    for(let i=0;i<680;i++){
      this.settings.config.push({ class:Wall, count:1, x:99+i, y:200, z:1, fill:'rgba(255, 255, 255, 1)',size:2});
    }

    this.c = canvas;
    // 2d graphic context for canvas
    this.ctx = this.c.getContext('2d');
    // apply settings to canvas
    this.c.width = this.settings.width;
    this.c.height = this.settings.height;

    this.gps = {};

    // letiable operators
    this.operators = {
      '>': function(a, b){ return a > b; },
      '<': function(a, b){ return a < b; }
      // ...
    };

    this.generate = {
      add: function(config){
        this.instances(config);
      },
      units: function(config){
        for(let i=0;i<config.length;i++){
          this.instances(config[i]);
        }
        return;
      },
      instances: function(config){
        let unit = null;
        for(let i=0;i<config.count;i++){
          unit = new config.class(self,config);
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
          if (this.gps[key].unit instanceof FootPrint){

          }else{
            // delete the current position of unit from the mastor record
            delete this.gps[key];
          }
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

class Controls {
  constructor(C){
    this.C = C;
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  onKeyDown(e) {

    //set rightDown or leftDown if the right or left keys are down
    if ([38,39,40,37].indexOf(e.keyCode) !== -1){
      if (e.keyCode == 38) Object.assign(this.C.player, {direction:1,velocity:4}) // up
      if (e.keyCode == 39) Object.assign(this.C.player, {direction:2,velocity:4}) // right
      if (e.keyCode == 40) Object.assign(this.C.player, {direction:3,velocity:4}) // down
      if (e.keyCode == 37) Object.assign(this.C.player, {direction:4,velocity:4}) // left
      e.preventDefault();
    }

    // set interactive
    if ([49].indexOf(e.keyCode) !== -1){
      if (e.keyCode == 49) {
        let pos = this.C.player.futurePosition(15);
        this.C.generate.add({ class:Wall, count:1, x:pos.x, y:pos.y, z:this.C.player.z, fill:'rgba(255, 255, 255, 1)', size:5 });
      }
      e.preventDefault();
    }
  }

  //and unset them when the right or left key is released
  onKeyUp(e) {
    if ([38,39,40,37].indexOf(e.keyCode) !== -1){
      Object.assign(this.C.player, {velocity:0,frame:0});
    }
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

    if(this.inanimate) {return this;}

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
    }else if(this.C.isOdd(this.direction)){
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

  // will need to pass these unitarrays or gps into this or will fail
  coordID(location=this){
    return 'x'+ Math.floor(location.x) + 'y' + Math.floor(location.y) + 'z' + location.z;
  };

  getDefault(key){
    let objClass = this.constructor;
    let inst = new objClass(this.C);
    return inst[key];
  }

  // todo work on this methods performance, the prior iteration using array instead of gps was faster.
  findNeighbors(proximity=1){
    if(this instanceof FootPrint){
      return;
    }
    let coordInRange = [];
    let neighborArr = [];
    let range = this.size*proximity;
    let selfId = this.coordID();

    // console.log(selfId);

    // build x/y coords arr
    for (let i = range; i >= 0; i--){
      for (let j = range; j >= 0; j--){
      // build key list
      coordInRange.push('x'+((this.x+(range/2))-i)+'y'+((this.y+(range/2))-j)+'z'+this.z);
      }
    }
    // ignore self
    delete coordInRange[selfId];

    for(let i = 0; i < coordInRange.length; i++){
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

  locateRelativeDirection(unit){
    let dir = {x:unit.x,y:unit.y};

    // set default of current direction
    if(this.direction){
      if(this.direction == 1 || this.direction == 3){
        dir.y = this.direction;
      }
      if(this.direction == 2 || this.direction == 4){
        dir.x = this.direction;
      }
    }

    if(this.y > unit.y){
      dir.y = 1; // down
    }
    if(this.x < unit.x){
      dir.x = 2; // left
    }
    if(this.y < unit.y){
      dir.y = 3; // up
    }
    if(this.x > unit.x){
      dir.x = 4; // right
    }
    return dir;
  }

  futurePosition(ahead = this.velocity*2) {
    // returns estimated future postion {x,y}
    let futurePos = {x:this.x,y:this.y}
    switch(this.direction)
    {
    //up
    case 1:
      futurePos.y = this.y - (ahead);
      futurePos.x = this.x + this.choice;
      break;
    //right
    case 2:
      futurePos.x = this.x + (ahead);
      futurePos.y = this.y - this.choice;
      break;
    //down
    case 3:
      futurePos.y = this.y + (ahead);
      futurePos.x = this.x - this.choice;
      break;
    //left
    case 4:
      futurePos.x = this.x - (ahead);
      futurePos.y = this.y + this.choice;
      break;
    default:
      futurePos.x = this.x;
      futurePos.y = this.y;
    }
    return futurePos;
  }

  pastPosition(back = this.velocity*2) {
    // returns estimated past postion {x,y}
    let pastPos = {x:this.x,y:this.y}
    switch(this.direction)
    {
    //up
    case 3:
      pastPos.y = this.y - (back);
      pastPos.x = this.x + this.choice;
      break;
    //right
    case 4:
      pastPos.x = this.x + (back);
      pastPos.y = this.y - this.choice;
      break;
    //down
    case 1:
      pastPos.y = this.y + (back);
      pastPos.x = this.x - this.choice;
      break;
    //left
    case 2:
      pastPos.x = this.x - (back);
      pastPos.y = this.y + this.choice;
      break;
    default:
      pastPos.x = this.x;
      pastPos.y = this.y;
    }
    return pastPos;
  }

  plotCourse(target) {
    if(target.y < this.y){
      this.direction = 1;
    }
    if(target.x < this.x){
      this.direction = 4;
    }
    if(target.y > this.y){
      this.direction = 3;
    }
    if(target.x > this.x){
      this.direction = 2;
    }
    return;
  }

  move() {
    if(this.inanimate) {return this;}

    if(this.timestamp  % 10 == 0 && this.velocity > 1){
        this.C.generate.add({ class:FootPrint, count:1, x:this.x-1, y:this.y-1, z:this.z-1, fill:'rgba(255, 255, 255, .03)', size:1 });
        this.C.generate.add({ class:FootPrint, count:1, x:this.x+1, y:this.y+1, z:this.z-1, fill:'rgba(255, 255, 255, .03)', size:1 });
    }
    if(!(this instanceof Player)){

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

    if(this.wall != 0){

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

  turnAround() {
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

  rollDice() {
    if(this.inanimate) {return this;}

    // check for pulse
    if(!this.dead){

      //initial collision detect
      if(this.x<=this.size||this.x>=this.C.c.width-this.size||this.y<=this.size||this.y>=this.C.c.height-this.size){

        this.collision+=1;
        if(this.collision <= 1){
          this.wall = this.direction;
        }
        this.turnAround();

      }else{

        //collision reset
        this.collision=0;
        this.wall = null;

        let collision = this.findNeighbors(4); // to account for size of both self and any colliders

        if(collision.length){
          // remnant, clean up isle 520
          for (let collider of collision){
            if(collider instanceof FootPrint) {
              continue;
            }
            // this.bool=collider.bool;
            this.collision+= 1;
            this.wall = this.locateRelativeDirection(collider);
            if(this.wall.y == this.direction || this.wall.x == this.direction){
              this.velocity = 0;
              this.turnAround();
              this.direction = 0;
              this.plotCourse(this.pastPosition(10))
            }
          }
        }
        //negate player
        if(!(this instanceof Player)){

          // rng velocity set
          if(!collision.length){
            this.velocity= Math.floor(Math.random() * this.C.settings.velocity)+1;

            // todo this should be run 1 time, and in the process as its running we assing the proximity, and check against the letious needs
            // new grouping base on gps
            let group = this.findNeighbors(this.groupingRange);
            if(group.length){
              for (let leader of group){
                if(!leader instanceof Player || !leader.inanimate && !leader.collision){
                  this.direction = leader.direction;
                  this.velocity=leader.velocity;
                  this.bool=leader.bool;
                  break;
                }
              }
            }

            let pursuit = this.findNeighbors(this.detectionRange);
            if(pursuit.length>=1){
              for (let pursue of pursuit){
                if(!pursue.inanimate){
                  // check if neighbor is 'on the menu'
                  if(this.prey.includes(pursue.constructor.name)){
                    // console.log(pursuit);
                    this.velocity = pursue.velocity > this.velocity ? pursue.velocity-1 : this.velocity;
                    this.pursuit = pursue;
                    break;
                  }
                }
              }
            }
            // handle unit changes and persistance of pursuit
            if(this.pursuit){
              // console.log(this.pursuit);
              // for testing only, though could make a diff sprite frame for in pursuit
              this.fill = 'red';
              this.plotCourse(this.pursuit.futurePosition());
              this.persistance -= 1;
              if(this.persistance < 1){
                this.pursuit = false;
                this.fill = this.C.settings.fill;
                this.persistance = this.C.rng(this.getDefault('persistance'));
              }
            }

            // handle start position leashing
            if(this.leash && !this.pursuit && group.length < 2 && this.checkProximity(this,this.startPos)>this.leash){
              // console.log('off leash');
              this.plotCourse(this.startPos);
            }

          }else{
            if (this.choice) {
              this.move();
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

// Unit Classes

// example player class
class Player extends Unit{
  constructor(C){
    super(C);
    this.x = C.settings.width/2;
    this.y = C.settings.height/2;
    this.z = 1;
    this.size = C.settings.unitSize*2;
    this.velocity = 0;
    this.direction = 0;
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

// example unit class
class Gremlin extends Unit{
  constructor(C,config = {}){
    super(C);
    this.x = Math.floor(Math.random() * C.settings.width);
    this.y = Math.floor(Math.random() * C.settings.height);
    this.z = 1;
    this.size = C.settings.unitSize;
    this.velocity = C.settings.velocity;
    this.direction = 0;
    this.collision = 0;
    this.bool = (Math.floor(Math.random() * 2) == 0);
    this.choice = Math.floor(Math.random()*2) == 1 ? 1 : -1;
    this.decisionLog = [];
    this.startPos = {x:this.x,y:this.y};
    this.leash = config.leash | 0;
    this.frame = 0;
    this.animrate = 2;
    this.fill = C.settings.fill;
    this.persistance = 100;
    this.groupingRange = 10;
    this.detectionRange = 15;
    this.prey = ['Player'];
  }
}

class Wall extends Unit{
  constructor(C,config){
    super(C);
    this.x = config.x;
    this.y = config.y;
    this.z = config.z;
    this.inanimate = true;
    this.size = config.size;
    this.fill = config.fill;
  }
}

class FootPrint extends Unit{
  constructor(C,config){
    super(C);
    this.x = config.x;
    this.y = config.y;
    this.z = config.z;
    this.inanimate = true;
    this.size = config.size;
    this.fill = config.fill;
  }
}