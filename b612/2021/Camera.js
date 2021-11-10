"use strict";

class Camera {

    constructor(mixcoef){
        this.ox = 0;
        this.oy = 0;
        this.target = undefined;
        this.cf = 0;
        this.opacity = 1.0;
        this.mixcoef = mixcoef;
        this.zoom = 1.0;
        this.t_zoom = 1.0;
    }

    Update(){
        let target = this.target;
        let oo = {x:400,y:400};
        if (target!==undefined){
            oo = target.globalPosition;
        }        
        const cf = this.cf;
        this.ox = MathEx.lerp( 0, MathEx.lerp(this.ox,-(oo.x-400),cf), this.mixcoef);
        this.oy = MathEx.lerp( 0, MathEx.lerp(this.oy,-(oo.y-400),cf), this.mixcoef);        
        this.zoom = MathEx.lerp(this.zoom, this.t_zoom, cf);
        this.cf = Math.min(this.cf+0.01,0.2);
    }

    setTarget(target){
        if (target!==this.target){
            this.cf = 0;
        }
        this.target = target;
    }

}