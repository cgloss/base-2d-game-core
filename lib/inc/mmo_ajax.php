<script type="text/javascript">
// <SETUP>
  // initial configurations
  // initial settings
var width = 500; 
var height = 500;
var gLoop = 0;

rightDown = false;
leftDown = false;
upDown = false;
downDown = false;

lurker=[];

uID=0;
ID=0;


//set rightDown or leftDown if the right or left keys are down
function onKeyDown(evt) {
	if (evt.keyCode == 37) leftDown = true;
	else if (evt.keyCode == 39) rightDown = true;
	if (evt.keyCode == 38) upDown = true;
	else if (evt.keyCode == 40) downDown = true;
}

//and unset them when the right or left key is released
function onKeyUp(evt) {
	if (evt.keyCode == 37) leftDown = false;
	else if (evt.keyCode == 39) rightDown = false;
	if (evt.keyCode == 38) upDown = false;
	else if (evt.keyCode == 40) downDown = false;
}

$(document).keydown(onKeyDown);
$(document).keyup(onKeyUp);
  
//canvas itself
c = $('#mmo')[0];   

//and two-dimensional graphic context of the canvas
ctx = c.getContext('2d');  

// apply settings to canvas
c.width = width;  
c.height = height;

function genLurker() {
	lurker.push([(width/2), (height/2), 10, 1]);
};

function drawLurker() {
	//draw a lurker
	ctx.beginPath();
	
	ctx.moveTo(lurker[ID][0], lurker[ID][1] - lurker[ID][2]);
  
  ctx.bezierCurveTo(
    lurker[ID][0] + lurker[ID][2], lurker[ID][1] - lurker[ID][2],
    lurker[ID][0] + lurker[ID][2], lurker[ID][1] + lurker[ID][2],
    lurker[ID][0], lurker[ID][1] + lurker[ID][2]);

  ctx.bezierCurveTo(
    lurker[ID][0] - lurker[ID][2], lurker[ID][1] + lurker[ID][2],
    lurker[ID][0] - lurker[ID][2], lurker[ID][1] - lurker[ID][2],
    lurker[ID][0], lurker[ID][1] - lurker[ID][2]);
 
  ctx.fillStyle = 'rgba(0, 0, 0, ' + lurker[ID][3] + ')';
  ctx.fill();
  ctx.closePath();
};

function moveLurker() {		
	if (rightDown){ lurker[uID][0] += 5;}
	else if (leftDown){ lurker[uID][0] -= 5;}
	if (upDown){lurker[uID][1] -= 5;}
	else if (downDown){lurker[uID][1] += 5;}
	
	$('#pos').load("/lib/inc/update.php", {uID:uID, posX:lurker[uID][0], posY:lurker[uID][1]});

	drawLurker();	
};

genLurker();

function gameLoop() {
	ctx.clearRect(0,0,width,height);
	moveLurker();  
	drawLurker();
	gLoop = setTimeout(gameLoop, 1000 / 45);
}  
gameLoop();
</script>