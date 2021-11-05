"use strict";

class EfStar extends Effect {
    static instance = new EfStar();
    Apply(star){
        star.rotation = Math.sin(star.k*20.)+star.k*2;
        const cf = Math.pow( Math.sin(star.k*5.0), 100.0);
        star.scale = star.s+cf*0.05;
        const c_mul = cf*0.5+0.5;
        star.renderer.cmul = [1,1,1,c_mul];
        const c_add = Math.pow(c_mul,10.)*0.3;
        star.renderer.cadd = [c_add,c_add,c_add,0];
    }
}

class BhStar {
    static instance = new BhStar();
    Update(star){
        star.k+=0.004;
        return this;
    }
}

class GoStar extends GameObject {
    static Renderer = new RenderSprite("star");
    constructor(){
        super();        
        this.renderer = GoStar.Renderer; //new RenderSprite("star");
        this.behaviour = BhStar.instance;
        this.effect = EfStar.instance;
        this.k = 0;
    }
}
