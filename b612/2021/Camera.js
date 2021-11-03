"use strict";

class Camera {

    constructor(mixcoef){
        this.ox = 0;
        this.oy = 0;
        this.target = undefined;
        this.cf = 0;
        this.opacity = 1.0;
        this.mixcoef = mixcoef;
    }

    Update(){
        let target = this.target;
        if (target===undefined){
            return;
        }
        let oo = target.globalPosition;
        const cf = this.cf;
        this.ox = MathEx.lerp( 0, MathEx.lerp(this.ox,-(oo.x-400),cf), this.mixcoef);
        this.oy = MathEx.lerp( 0, MathEx.lerp(this.oy,-(oo.y-400),cf), this.mixcoef);
        this.cf = Math.min(this.cf+0.001,0.1);
    }

    setTarget(target){
        if (target!==this.target){
            this.cf = 0;
        }
        this.target = target;
    }

}