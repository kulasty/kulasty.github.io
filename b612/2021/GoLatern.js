class RenderLatern {
    constructor(){
        this.cmul = V4_SOLIDWHITE;
        this.cadd = V4_TRANSBLACK;
        this.blur = 0.;
    }
    Render(go){
        go.scale = 0.7;
        renderContext.RenderSprite(go,renderContext.texas["latern"],this.cmul,this.cadd,this.blur); // FIXME        
        if (go.lit>0){
            let r = go.rotation;
            let c = 1;
            go.scale = 4.7;
            renderContext.RenderGlow(go,renderContext.texas["latern_lit"],[1.,1.,1.,c],[0.,0.,0.,0.],1.3); // FIXME // blur as glow power, FIXME
            go.rotation = r;
        }
    }
}

class GoLatern extends GoActor {
    constructor(){
        super("latern");
        this.renderer = new RenderLatern();        
        this.lit = -2; // HAXOR
    }
}