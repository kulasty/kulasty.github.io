"use strict";

class Camera {

    constructor(){
        this.ox = 0;
        this.oy = 0;
        this.target = undefined;
        this.cf = 0;
    }

    Update(){
        let target = this.target;
        if (target===undefined){
            return;
        }
        let oo = target.globalPosition;
        const cf = this.cf;
        this.ox = MathEx.lerp(this.ox,-(oo.x-400),cf);
        this.oy = MathEx.lerp(this.oy,-(oo.y-400),cf);
        this.cf = Math.min(this.cf+0.001,0.1);
    }

    setTarget(target){
        if (target!==this.target){
            this.cf = 0;
        }
        this.target = target;
    }

}