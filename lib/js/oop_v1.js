// initial settings
var settings ={
	width:500,
	height:500,
	hUnits:10,
	unitH:55,
	unitW:20,
	speed:2,
	uSize:2,
	uRange:5,
	gRange:2,
	view:12,
	resurrection:300,
	fingerSize:10
}

pawns=[];

uID=0;
ID=0;


//canvas itself
c = document.getElementsByTagName ('canvas')[0];  

//helper functions
c.addEventListener("mousedown", getPosition, false);

function getPosition(event)
{
	var e = document.getElementById("convert");
	var convert = e.options[e.selectedIndex].value;
		
	var x = new Number();
    var y = new Number();
	x = event.clientX + document.body.scrollLeft +document.documentElement.scrollLeft;
	y = event.clientY + document.body.scrollTop +document.documentElement.scrollTop;

	x -= c.offsetLeft;
	y -= c.offsetTop;
	
	for (var ID=0;ID<pawns.length;ID++){
		if(pawns[ID].x<=x+settings.fingerSize && pawns[ID].x>=x-settings.fingerSize && pawns[ID].y<=y+settings.fingerSize && pawns[ID].y>=y-settings.fingerSize){
			pawns[ID].human=0;
			pawns[ID].type=convert;
			break;
		}
	}
}

// variable operators
var operators= {
    '>': function(a, b) { return a > b; },
    '<': function(a, b) { return a < b; }
    // ...
};

//and two-dimensional graphic context of the canvas
ctx = c.getContext('2d');  

// apply settings to canvas
c.width = settings.width;  
c.height = settings.height;


function pawn() {
	this.x=Math.floor((Math.random()* (settings.width-100))+50);
	this.y=Math.floor((Math.random()* (settings.height-100))+50); 
	this.size=3;
	this.speed=settings.speed;
	this.direction=0; 
	this.decision=0;
	this.collision=1;
	this.bool = (Math.floor(Math.random() * 2) == 0);
	this.synapse=Math.floor(Math.random() * 350)+100; 
	this.choice=Math.floor(Math.random()*2) == 1 ? 1 : -1;
	this.decisionLog = [];
	this.type = 0;
	this.frame = 0;
	this.animrate = 2;
}

function genpawns() {
	for (var i=0;i<settings.hUnits;i++){
	var newpawn = pawns.push(new pawn) - 1;
	pawns[newpawn].human=1;
	}
};

function drawunits(arr) {
	for (var ID=0;ID<arr.length;ID++){
		//draw a zeds
		ctx.beginPath();
			
		ctx.moveTo(arr[ID].x, arr[ID].y - arr[ID].size);
		  
		ctx.arc(arr[ID].x, arr[ID].y, arr[ID].size, 0, 2 * Math.PI, false);
			
		ctx.lineWidth = arr[ID].size*settings.uSize;	
		
		if(arr[ID].human && !arr[ID].change){
		ctx.strokeStyle = 'rgba(80, 153, 80, .1)';
		ctx.fillStyle = 'rgba(0, 153, 0, .3)';	
		}else if(arr[ID].change > 0 || arr[ID].dead){
		ctx.strokeStyle = 'rgba(255, 255, 255, .2)';
		ctx.fillStyle = 'rgba(0, 0, 0, .3)';
		}else{		
			if(arr[ID].type == 1){
			ctx.strokeStyle = 'rgba(255, 153, 0, .2)';
			ctx.fillStyle = 'rgba(255, 0, 0, .3)';
			}else if(arr[ID].type == 2){
			ctx.strokeStyle = 'rgba(0, 153, 255, .2)';
			ctx.fillStyle = 'rgba(0, 0, 255, .3)';
			}else if(arr[ID].type == 3){
			ctx.strokeStyle = 'rgba(153, 153, 153, .2)';
			ctx.fillStyle = 'rgba(153, 153, 153, .3)';
			}else if(arr[ID].type == 4){
			ctx.strokeStyle = 'rgba(0, 0, 0, .2)';
			ctx.fillStyle = 'rgba(0, 0, 0, .3)';
			}
		}
			
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
		
		var img=new Image();
		// assign default sprite
		img.src = "lib/img/mysprites_tileset_walk_down.png";
		
		if(!arr[ID].change){
		// view cone draw
		ctx.beginPath();
		ctx.moveTo(arr[ID].x, arr[ID].y);
				
		switch(arr[ID].direction)
			{
			//up
			case 1:
				if(arr[ID].bool){
				  // modify cone for angle choice
				  if(arr[ID].choice == -1){
					ctx.lineTo(arr[ID].x-25, arr[ID].y-10);
					ctx.lineTo(arr[ID].x-10, arr[ID].y-25);
				  }else if(arr[ID].choice == 1){
					ctx.lineTo(arr[ID].x+25, arr[ID].y-10);
					ctx.lineTo(arr[ID].x+10, arr[ID].y-25);
				  }
				}else{
					ctx.lineTo(arr[ID].x-10, arr[ID].y-25);
					ctx.lineTo(arr[ID].x+10, arr[ID].y-25);
				}
				// assign up sprite
				img.src = "lib/img/mysprites_tileset_walk_up.png";
			  break;
			//right
			case 2:
				if(arr[ID].bool){
				  // modify cone for angle choice
				  if(arr[ID].choice == -1){
					ctx.lineTo(arr[ID].x+25, arr[ID].y+10);
					ctx.lineTo(arr[ID].x+10, arr[ID].y+25);
				  }else if(arr[ID].choice == 1){
					ctx.lineTo(arr[ID].x+25, arr[ID].y-10);
					ctx.lineTo(arr[ID].x+10, arr[ID].y-25);
				  }
				}else{
					ctx.lineTo(arr[ID].x+25, arr[ID].y+10);
					ctx.lineTo(arr[ID].x+25, arr[ID].y-10);
				}
				// assign right sprite
				img.src = "lib/img/mysprites_tileset_walk_right.png";
			  break;
			//down
			case 3:
				if(arr[ID].bool){
				  // modify cone for angle choice
				  if(arr[ID].choice == -1){
					ctx.lineTo(arr[ID].x+25, arr[ID].y+10);
					ctx.lineTo(arr[ID].x+10, arr[ID].y+25);
				  }else if(arr[ID].choice == 1){
					ctx.lineTo(arr[ID].x-25, arr[ID].y+10);
					ctx.lineTo(arr[ID].x-10, arr[ID].y+25);
				  }
				}else{
					ctx.lineTo(arr[ID].x+10, arr[ID].y+25);
					ctx.lineTo(arr[ID].x-10, arr[ID].y+25);
				}
				// assign down sprite
				img.src = "lib/img/mysprites_tileset_walk_down.png";
			  break;
			//left
			case 4:
				if(arr[ID].bool){
				  // modify cone for angle choice
				  if(arr[ID].choice == -1){
					ctx.lineTo(arr[ID].x-25, arr[ID].y-10);
					ctx.lineTo(arr[ID].x-10, arr[ID].y-25);
				  }else if(arr[ID].choice == 1){
					ctx.lineTo(arr[ID].x-25, arr[ID].y+10);
					ctx.lineTo(arr[ID].x-10, arr[ID].y+25);
				  }
				}else{
					ctx.lineTo(arr[ID].x-25, arr[ID].y-10);
					ctx.lineTo(arr[ID].x-25, arr[ID].y+10);
				}
				// assign left sprite
				img.src = "lib/img/mysprites_tileset_walk_left.png";
			  break;
			default:
			  //do nothing
			  ctx.lineTo(arr[ID].x+25, arr[ID].y+10);
			  ctx.lineTo(arr[ID].x+25, arr[ID].y-10);
			}
			ctx.lineTo(arr[ID].x, arr[ID].y);  
			ctx.fillStyle = 'rgba(255, 255, 0, .05)';
			ctx.fill();
			
			ctx.lineWidth = arr[ID].size*settings.uSize;
			ctx.strokeStyle = 'rgba(255, 255, 0, .09)';
			ctx.stroke();
			ctx.closePath();
		}
		// sprite drw
		if(!arr[ID].dead){
			ctx.drawImage(img,arr[ID].frame,0,20,60,arr[ID].x-(settings.unitW/2),arr[ID].y-settings.unitH,20,60);
			arr[ID].animrate = (arr[ID].animrate) ? arr[ID].animrate-1 : 2;
			if(!arr[ID].animrate){
			arr[ID].frame = (arr[ID].frame<60) ? arr[ID].frame+20 : 0;
			}
		}
	}
};

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
		
		// change countdown transformation
		if(typeof arr[ID].change != 'undefined'){
			arr[ID].change -= 1;
			if(arr[ID].change <= 100 && arr[ID].human){
				arr[ID].human = 0;
			}
			if(arr[ID].change <= 0){
				delete arr[ID].change;
			}
			continue;
		}
		
		// check for pulse (or bullet in dome)
		if(!arr[ID].dead){
		
			arr[ID].decision += Math.floor(Math.random() * 4)+1;
					
			//initial collision detect
			if(arr[ID].x<=arr[ID].size||arr[ID].x>=c.width-arr[ID].size||arr[ID].y<=arr[ID].size||arr[ID].y>=c.height-arr[ID].size){
			//if(arr[ID].x<=50||arr[ID].x>=450||arr[ID].y<=50||arr[ID].y>=450){
	
				arr[ID].collision+=1;
				if(arr[ID].collision <= 1){
					arr[ID].wall = arr[ID].direction;
				}
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
							
			}else{
				
				//collision reset 
				arr[ID].collision=0;
				arr[ID].wall = null;
				
				//speed set
				if(arr[ID].human){
					arr[ID].speed= Math.floor(Math.random() * settings.speed)+1;
				}else{
					if(!arr[ID].target){
					arr[ID].speed= Math.floor(Math.random() * settings.speed*.75);
					}
				}
				
				// grouping behavior
				for (var i=0;i<arr.length;i++){
					if(arr[ID].type == arr[i].type && (arr[i].collision < 1 || arr[ID].collision < 1) && !arr[ID].flight && ID!=i){
						var grp = settings.gRange;
						if(!arr[ID].human){grp+=1;}
						
						// in grp range
						if(arr[ID].x<=arr[i].x+arr[i].size*settings.gRange && arr[ID].x>=arr[i].x-arr[i].size*settings.gRange && arr[ID].y<=arr[i].y+arr[i].size*settings.gRange && arr[ID].y>=arr[i].y-arr[i].size*settings.gRange){
							arr[ID].direction = arr[i].direction;	
							arr[ID].synapse=arr[i].synapse;
							arr[ID].decision=arr[i].decision;
							if(arr[ID].speed<settings.speed){
							arr[ID].speed += Math.floor(Math.random() * arr[i].speed+.25)+.5;
							}
							if(arr[ID].human){
							arr[ID].bool== (Math.floor(Math.random() * 2) == 0);
							}else{
							arr[ID].bool=arr[i].bool;
							}
						}
					}
					
					// too close for comfort
					if(arr[ID].x<=arr[i].x+arr[i].size && arr[ID].x>=arr[i].x-arr[i].size && arr[ID].y<=arr[i].y+arr[i].size && arr[ID].y>=arr[i].y-arr[i].size && ID!=i){
						//collision 
						arr[i].speed+=arr[i].speed < 2 ? .25 : 0;
						arr[ID].speed-=arr[ID].speed > 0 ? .25 : 0;
						arr[i].bool=arr[ID].bool;
						arr[ID].bool=!arr[ID].bool;
						arr[ID].collision=1;
						arr[ID].wall = arr[ID].direction;
					}else{
						arr[ID].collision=0;
						arr[ID].wall = null;
					}
						
				}
							
				// interaction behaviors
				for (var i=0;i<arr.length;i++){			
					if(arr[ID].human && arr[i].human == 0 && ID!=i){
											
						// flight
						if((arr[ID].x<=arr[i].x+arr[i].size*settings.view && arr[ID].x>=arr[i].x-arr[i].size*settings.view && arr[ID].y<=arr[i].y+arr[i].size*settings.view && arr[ID].y>=arr[i].y-arr[i].size*settings.view) && arr[ID].collision < 1){
							
							arr[ID].flight = true;
							
							disposition(1,arr,ID,i);
								
							if(arr[ID].speed<settings.speed){
							arr[ID].speed+=1;
							}
							//arr[ID].bool=!arr[i].bool;
							
						}else{
							arr[ID].flight = false;
						}
						
						// infection
						if(arr[ID].x<=arr[i].x+arr[i].size && arr[ID].x>=arr[i].x-arr[i].size && arr[ID].y<=arr[i].y+arr[i].size && arr[ID].y>=arr[i].y-arr[i].size && !arr[i].change){
							arr[ID].direction = 0;
							arr[i].synapse=Math.floor(Math.random() * 700)+350;
							arr[ID].decision= 0;
							arr[ID].speed = 0;
							arr[ID].bool= 0;
							arr[ID].change = Math.floor(Math.random() * settings.resurrection)+60;
							arr[i].target=false;
							arr[ID].type = arr[i].type;
						}
					}
									
					if(arr[ID].human == 0 && arr[ID].type != arr[i].type && arr[ID].collision<1 && ID!=i){
						
						// conversion
						if(arr[ID].x<=arr[i].x+arr[i].size && arr[ID].x>=arr[i].x-arr[i].size && arr[ID].y<=arr[i].y+arr[i].size && arr[ID].y>=arr[i].y-arr[i].size && !arr[i].human && !arr[i].change){
							arr[ID].direction = 0;
							arr[i].synapse=Math.floor(Math.random() * 700)+350;
							arr[ID].decision= 0;
							arr[ID].speed = 0;
							arr[ID].bool= 0;
							arr[ID].change = Math.floor(Math.random() * settings.resurrection)+60;
							arr[i].target=false;
							if(arr[ID].type > 1){
								arr[ID].type = arr[i].type;
							}else{
								arr[ID].dead = true;
							}
						}
						
						// predation
						if(!arr[ID].target){
							if((arr[ID].x<=arr[i].x+arr[i].size*settings.view && arr[ID].x>=arr[i].x-arr[i].size*settings.view && arr[ID].y<=arr[i].y+arr[i].size*settings.view && arr[ID].y>=arr[i].y-arr[i].size*settings.view) && arr[ID].collision < 1){
								arr[ID].target=true;
								
								disposition(0,arr,ID,i);							
								
								
								if(arr[ID].type > 1){
									arr[ID].bool = !arr[i].bool;
								}else{
									arr[ID].choice = !arr[i].choice;
									arr[ID].bool = arr[i].bool;
									arr[ID].speed = arr[i].speed*.75;
									arr[ID].synapse=Math.floor(Math.random() * 700)+350;
								}
								arr[ID].decision= 0;
							}
						}// target check end
						
						// you fucked up, got too close...
							if(arr[ID].x<=arr[i].x+arr[i].size*settings.uRange && arr[ID].x>=arr[i].x-arr[i].size*settings.uRange && arr[ID].y<=arr[i].y+arr[i].size*settings.uRange && arr[ID].y>=arr[i].y-arr[i].size*settings.uRange){
								arr[ID].target=false;
								arr[ID].speed = arr[i].speed;
								arr[ID].bool = arr[i].bool;
								arr[ID].choice = !arr[i].choice;
								arr[ID].decision= 0;
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
	  arr[ID].y -= arr[ID].speed;
	  if(arr[ID].bool){
	  arr[ID].x += arr[ID].choice;
	  }
	  arr[ID].direction = 1;
	  break;
	//right
	case 2:
	  arr[ID].x += arr[ID].speed;
	  if(arr[ID].bool){
	  arr[ID].y -= arr[ID].choice;
	  }
	  arr[ID].direction = 2;
	  break;
	//down
	case 3:
	  arr[ID].y += arr[ID].speed;
	  if(arr[ID].bool){
	  arr[ID].x -= arr[ID].choice;
	  }
	  arr[ID].direction = 3;
	  break;
	//left
	case 4:
	  arr[ID].x -= arr[ID].speed;
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

genpawns();

function gameLoop() {
	ctx.clearRect(0,0,c.width,c.height);
	rollDice(pawns);
	drawunits(pawns);
	settings.fps = setTimeout(gameLoop, 1000 / 30);
	document.getElementById("pos").innerHTML =
	'<div>X:'+pawns[uID].x+'</div>'+
	'<div>Y:'+pawns[uID].y+'</div>'+
	'<div>SIZE:'+pawns[uID].size+'</div>'+
	'<div>SPEED:'+pawns[uID].speed+'</div>'+
	'<div>DIR:'+pawns[uID].direction+'</div>'+
	'<div>WALL:'+pawns[uID].wall+'</div>'+
	'<div>DEC:'+pawns[uID].decision+'</div>'+
	'<div>COL:'+pawns[uID].collision+'</div>'+
	'<div>BOOL:'+pawns[uID].bool+'</div>'+
	'<div>SYN:'+pawns[uID].synapse+'</div>'+
	'<div>FLIP:'+pawns[uID].choice+'</div>'
	;
}  
gameLoop();