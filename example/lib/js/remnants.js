// initialization
function initialize(){    
    if(handler){
        clearInterval(handler);
        delete userControls;
        delete core;
        console.log('reset');
    }
    handler = setInterval(timeLoop, 1000 / 60);

    let core = new Core(document.getElementsByTagName ('canvas')[0]);
    let userControls = new Controls(core);
    
    function timeLoop() {
        core.ctx.clearRect(0,0,core.c.width,core.c.height);
        core.render();
    }
}
var handler;