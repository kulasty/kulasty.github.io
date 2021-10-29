
function CreateGraphics2d()
{
	var cv = $("#display2d");
	var canvas = cv[0];	
	var cx = parseInt(cv.css('width'));
	var cy = parseInt(cv.css('height'));;
	canvas.width = cx;
	canvas.height = cy;
	canvas.mozImageSmoothingEnabled = true; //https://developer.mozilla.org/en/Canvas_tutorial/Using_images
	if (!canvas.getContext)
	    return null;
	debug("Canvas2d: "+cx+"x"+cy);	
	return canvas.getContext("2d");	
}

var txr2d = { planet: new Image(), prince: new Image(), prince2 : new Image(), rose: new Image(), rose2: new Image() }
for(var i=0;i<txr2d.length;i++)
    txr2d[i].style.backgroundColor = "#f0f";
txr2d.planet.src = 'planet.png';
txr2d.planet.onload = function(){this.loaded = true; };
txr2d.prince.src = 'prince.png';
txr2d.prince.onload = function(){this.loaded = true; };
txr2d.prince2.src = 'prince2.png';
txr2d.prince2.onload = function(){this.loaded = true; };
txr2d.rose.src = 'rose.png';
txr2d.rose.onload = function(){this.loaded = true; };
txr2d.rose2.src = 'rose2.png';
txr2d.rose2.onload = function(){this.loaded = true; };

var PlanetRendererCanvas2d = 
{
	gx : null,	
	GetContext : function(){
		var that = PlanetRendererCanvas2d;	
		if (!that.gx) that.gx = CreateGraphics2d();
		return that.gx;
	},
	BeginScene : function(){        
		var that = PlanetRendererCanvas2d;	
		var gx = that.GetContext();
		if (!gx) return;
		
		var canvas = $("#display2d");
		
		gx.fillStyle = canvas.css("background-color");
		gx.fillRect(0,0,canvas[0].width,canvas[0].height);		
	},
	UpdateSprite : function (o, what, tx, ty)
	{		
	
		var that = PlanetRendererCanvas2d;	
		var gx = that.GetContext();
		if (!gx) return;
		
		try{
		
		if (txr2d[what].loaded)
		{
			var sx = o.Radius*2*tx;
			var sy = o.Radius*2*ty;
			var px = o.World.X;
			var py = o.World.Y;			
			gx.save();			
			gx.translate(px,py);
			gx.rotate(o.Rotation+Math.PI/2);			
			gx.translate(-sx/2,-sy/2);			
			var tex = txr2d[what];
			
			gx.drawImage(tex,0,0,tex.width,tex.height,0,0,sx,sy);
			
			gx.restore();
			}
		}catch(e){debug(""+e); throw e;}
	}
};

debug("LoadLib: Renderer.Canvas2d");
