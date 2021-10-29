class EfStar extends Effect {
    static instance = new EfStar();
    Apply(star){
        star.rotation = Math.sin(star.k*20.)+star.k*2;
        let cf = Math.sin(star.k*5)
        cf = Math.pow(cf,100);
        star.scale = star.s+cf*0.05;
        let c = cf*0.5+0.5;
        star.renderer.cmul = [1,1,1,c];
        c= Math.pow(c,10.);
        star.renderer.cadd = [c*0.3,c*0.3,c*0.4,0];
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
        this.renderer = new RenderSprite("star");
        this.behaviour = BhStar.instance;
        this.effect = EfStar.instance;
        this.k = 0;
    }
}
