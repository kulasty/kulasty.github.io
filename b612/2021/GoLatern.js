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
            let c = Math.sin(perfmon.time*0.001);
            c = c*0.25+0.8;
            let s = Math.random();
            go.scale = 4.4+s*0.1;
            let r = go.rotation;
            let k = perfmon.time*0.001;
            Math.seedrandom(Math.floor(perfmon.time/100));
            go.rotation = r + Math.sin(k+Math.random()-0.5)*0.5;
            c = 1;
            renderContext.RenderGlow(go,renderContext.texas["latern_lit"],[1,1,1,c],[0,0,0,0],0.); // FIXME
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