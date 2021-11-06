"use strict";

function _createGraphics2d(domid, width, height)
{
	var canvas = document.getElementById(domid);    
    canvas.width = width;
    canvas.height = height;
	return canvas.getContext("2d");;	
}

function gx_circle(gx,ox,oy,r,c,k1=0,k2=PI2){
    gx.beginPath();
    gx.arc(ox, oy, r, k1, k2, false);
    //gx.fillStyle = c;
    //gx.fill();
    gx.lineWidth = 2;
    gx.strokeStyle = c;
    gx.stroke();        
}

function gx_disk(gx,ox,oy,r,c,k1=0,k2=PI2){
    gx.beginPath();
    gx.arc(ox, oy, r, k1, k2, false);
    gx.fillStyle = c;
    gx.fill();
    //gx.lineWidth = 2;
    //gx.strokeStyle = c;
    //gx.stroke();        
}

function gx_line(gx, x1, y1, x2, y2, c){
    gx.beginPath();
    gx.strokeStyle = c;
    gx.lineWidth = 1;
    gx.moveTo(x1,y1);
    gx.lineTo(x2,y2);
    gx.stroke();
}

function _createTexture(filename){
    var img = new Image();
    img.onload = function(){ this.loaded = true; }
    img.src = "./assets/"+filename;
    return img;
}

function _bakePlanet(planet){
    const tx = txr2d.planet;
    const width = tx.width;
    const height = tx.height;
	let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
	let gx = canvas.getContext("2d");
                
    const px = width/2;
    const py = height/2;

    //gx.fillStyle = "#f00";//"#abf";
    //gx.fillRect(0,0,width,height);
    canvas.loaded = true;

    for(let i in planet.lay_out){
        let k = planet.lay_out[i];
        _renderTexture(gx,txr2d.planet,k,1,px,py);
    }
    
    for(let i in planet.lay_in){
        let k = planet.lay_in[i];
        _renderTexture(gx,txr2d.details,k,1,px,py);
    }

    return canvas;
}

function _renderTexture(gx,tex,k,s,ox,oy){
    if (!tex.loaded){
        return;
    }    
    let sx = tex.width*s;
    let sy = tex.height*s;
    gx.save();    
    gx.translate(ox,oy);
    gx.rotate(k);
    gx.translate(-sx/2,-sy/2)
    gx.drawImage(tex,0,0,tex.width,tex.height,0,0,sx,sy);
    gx.restore();
}
