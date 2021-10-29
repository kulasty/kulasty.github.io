var PlanetRendererHtml = 
{
	sprites : [],
	BeginScene : function() {},
	UpdateSprite : function (o, what, tx, ty)
	{
		var key = o.GetHashCode();
		var sprite = PlanetRendererHtml.sprites[key];			
		if (sprite === undefined)
		{
		    var r = o.Radius * 2;
			sprite = document.createElement("img");
			//sprite.style.backgroundColor = "#f0f";
			sprite.className = "sprite";
			document.getElementById("display").appendChild(sprite);
			sprite.src = what+".png";
			PlanetRendererHtml.sprites[key] = sprite;		
			var cx = r*tx;
			var cy = r*ty;
			sprite.style.width = cx+"px";			
			sprite.style.height = cy+"px";			
			sprite.width = cx+"px";			
			sprite.height = cy+"px";			
		}
		
		var R = o.Radius;
		
		var px = (o.World.X-R);
		var py = (o.World.Y-R);
		if (what=="prince") px+=8;
		if (what=="rose") px+=8;
		sprite.style.left = ""+px+"px";
		sprite.style.top = ""+py+"px";

        var rad = o.Rotation+Math.PI/2;
        
		var rotate = 'rotate('+rad+'rad)';

// IE		        
        var costheta = Math.cos(rad);
        var sintheta = Math.sin(rad);	
        
        var M11, M12, M21, M22;
		
		M11 = costheta;
		M12 = -sintheta;
		M21 = sintheta;
		M22 = costheta;        
        
		sprite.style.left = ""+px+"px";
		sprite.style.top = ""+py+"px";
        

		$(sprite).css({
		    'transform': rotate,
		    '-moz-transform': rotate,
		    '-o-transform': rotate,
		    '-webkit-transform': rotate,
		    '-ms-transform': rotate,
            'filter': 'progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11='+M11+', M12='+M12+', M21='+M21+', M22='+M22+')',
            '-ms-filter': '"progid:DXImageTransform.Microsoft.Matrix(SizingMethod=\'auto expand\', M11='+M11+', M12='+M12+', M21='+M21+', M22='+M22+')"'

		});
	}
};

debug("LoadLib: Renderer.Html/Css");
