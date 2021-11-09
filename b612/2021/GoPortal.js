class RenderPortal {
    constructor(){
        this.cmul = V4_SOLIDWHITE;
        this.cadd = V4_TRANSBLACK;
        this.blur = 0.;
    }
    Render(go){

        if (go.turned){
            let cf = Math.cos(perfmon.time*0.002);
            cf = Math.pow(cf,50.);
            renderContext.RenderQuad(
                renderContext.texas["portal_on"],
                {...go.globalPosition,_z: go.z_1},
                0.7+this.cadd[1]*0.3,
                go.globalRotation*0.5,
                this.cmul,this.cadd,2.3,
                BLEND_GLOW
            );
        }

        renderContext.RenderQuad(
            renderContext.texas["portal"],
            {...go.globalPosition,_z: go.z_1},
            0.7,
            go.globalRotation,
            this.cmul,this.cadd,this.blur,           
            BLEND_NORMAL
        );
    }
}

class GoPortal extends GoActor {
    constructor(){
        super("portal");
        this.renderer = new RenderPortal();        
        this.turned = true;
    }
}