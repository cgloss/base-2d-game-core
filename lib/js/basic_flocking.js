// initial settings
var width = 500; 
var height = 500;
var gLoop = 0;

lurker=[];

lUnits=25;

uID=0;
ID=0;
size=3;
speed=3;
decision=700;
 
//canvas itself
c = $('#mmo')[0];   

//and two-dimensional graphic context of the canvas
ctx = c.getContext('2d');  

// apply settings to canvas
c.width = width;  
c.height = height;

function genLurker() {
	for (var i=0;i<lUnits;i++){
	lurker.push([Math.floor((Math.random()* (width - size))+1), Math.floor((Math.random()* (height - size))+1), size, .05, 0, 0, 0, true, Math.floor(Math.random()*2) == 1 ? 1 : -1]);
	}
};

function drawLurker() {
	for (var ID=0;ID<lUnits;ID++){
		//draw a lurker
		ctx.beginPath();
		
		ctx.moveTo(lurker[ID][0], lurker[ID][1] - lurker[ID][2]);
	  
		ctx.arc(lurker[ID][0], lurker[ID][1], lurker[ID][2], 0, 2 * Math.PI, false);
		
		ctx.lineWidth = size*2;
		ctx.strokeStyle = 'rgba(187, 0, 0, .01)';
		ctx.stroke();
		
	 // patient 0
	 lurker[0][3] = 1;
		
	  ctx.fillStyle = 'rgba(0, 0, 0, ' + lurker[ID][3] + ')';
	  ctx.fill();
	  ctx.closePath();
	}
};


function rollDice() {
	for (var ID=0;ID<lUnits;ID++){
		lurker[ID][6] += Math.floor(Math.random() * 4)+1;  
		lurker[ID][7]=true;
		if(lurker[ID][0]<size*5){
			lurker[ID][4] = 2;
			moveLurker(ID,lurker[ID][4]);
		}else if(lurker[ID][0]>c.width-size*5){
			lurker[ID][4] = 4;
			moveLurker(ID,lurker[ID][4]);
		}else if(lurker[ID][1]<size*5){
			lurker[ID][4] = 3;
			moveLurker(ID,lurker[ID][4]);
		}else if(lurker[ID][1]>c.height-size*5){
			lurker[ID][4] = 1;
			moveLurker(ID,lurker[ID][4]);
		}else{
			//collision detect
			lurker[ID][7]=false;
			
			for (var i=0;i<lUnits;i++){
				if(lurker[ID][0]<=lurker[i][0]+size*2 && lurker[ID][0]>=lurker[i][0]-size*2 && lurker[ID][1]<=lurker[i][1]+size*2 && lurker[ID][1]>=lurker[i][1]-size*2){
				lurker[ID][4] = lurker[i][4];
				}
			}
			
			
			if(lurker[ID][6]>decision){
				lurker[ID][8]=lurker[ID][8]*-1;
				lurker[ID][6]=0;
				lurker[ID][5]=0;
				lurker[ID][4]=0;
				moveLurker(ID,lurker[ID][4]);
			}else{
				if(lurker[ID][4]==0){
					moveLurker(ID,Math.floor(Math.random() * 4)+1);
				}else{
					moveLurker(ID,lurker[ID][4]);  
				}
				
				if(lurker[ID][5]==0){
					lurker[ID][5] = Math.floor(Math.random() * 360)* Math.floor(Math.random()*2) == 1 ? 1 : -1;
				}
			}
		}
	}
}

function moveLurker($id,$dir) {		
	
	var adj = lurker[$id][5];
	
	// if collision turn
	if(lurker[$id][7]==true){
	if(lurker[$id][0]>c.width-size*5){adj=$dir;$dir-=lurker[$id][8];}else{adj=$dir;}
	if(lurker[$id][1]>c.height-size*5){adj=$dir;}else{adj=$dir; $dir+=lurker[$id][8];}
	
	}
	
	switch($dir)
	{
	//up
	case 1:
	  lurker[$id][1] -= speed;
	  lurker[$id][0] += adj;
	  lurker[$id][4] = 1;
	  break;
	//right
	case 2:
	  lurker[$id][0] += speed;
	  lurker[$id][1] += adj;
	  lurker[$id][4] = 2;
	  break;
	//down
	case 3:
	  lurker[$id][1] += speed;
	  lurker[$id][0] += adj;
	  lurker[$id][4] = 3;
	  break;
	//left
	case 4:
	  lurker[$id][0] -= speed;
	  lurker[$id][1] += adj;
	  lurker[$id][4] = 4;
	  break;
	default:
	  //do nothing
	}
	drawLurker();	
};

genLurker();

function gameLoop() {
	ctx.clearRect(0,0,width,height);
	rollDice();  
	drawLurker();
	gLoop = setTimeout(gameLoop, 1000 / 45);
	$('#pos').html(lurker[uID][0]+'/'+lurker[uID][1]+'::'+lurker[uID][6]+'{'+lurker[uID][4]+'}');
}  
gameLoop();