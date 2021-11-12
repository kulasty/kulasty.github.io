"use strict";

class Camera {

    constructor(mixcoef, changespeed){
        this.ox = 0;
        this.oy = 0;
        this.target = undefined;
        this.cf = 0;
        this.opacity = 1.0;
        this.mixcoef = mixcoef;
        this.zoom = 1.0;
        this.t_zoom = 1.0;
        this.changespeed = changespeed;
    }

    Update(){
        let oo, target = this.target;
        if (target!==undefined){
            oo = target.globalPosition;
        }else{
            oo = {x:400,y:400};            
        }
        const cf = this.cf;
        this.ox = MathEx.lerp( 0, MathEx.lerp(this.ox,-(oo.x-400),cf), this.mixcoef);
        this.oy = MathEx.lerp( 0, MathEx.lerp(this.oy,-(oo.y-400),cf), this.mixcoef);        
        this.zoom = MathEx.lerp(this.zoom, this.t_zoom, cf);
        const zoomof = (400./this.zoom-400.)
        this.zx = this.ox + zoomof;
        this.zy = this.oy + zoomof;
        this.cf = Math.min(this.cf+this.changespeed,0.1);
    }

    setTarget(target){
        if (target!==this.target){
            this.cf = 0;
        }
        this.target = target;
    }

}
