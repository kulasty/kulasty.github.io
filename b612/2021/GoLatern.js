"use strict";

class RenderLatern {
    constructor(){
        this.cmul = V4_SOLIDWHITE;
        this.cadd = V4_TRANSBLACK;
        this.blur = 0.;
    }
    Render(go){
        renderContext.RenderQuad(
            renderContext.texas["latern"],
            {...go.globalPosition,_z: go.z_1},
            0.7,
            go.globalRotation,
            this.cmul,this.cadd,this.blur,           
            BLEND_NORMAL
        );

        if (go.lit>0)
        renderContext.RenderQuad(
            renderContext.texas["latern_lit"],
            {...go.globalPosition,_z: go.z_1},
            4.7,
            go.globalRotation,
            this.cmul,this.cadd,1.3,
            BLEND_GLOW
        );

    }
}

class GoLatern extends GoActor {
    constructor(){
        super("latern");
        this.renderer = new RenderLatern();        
        this.lit = -2; // HAXOR
    }
}