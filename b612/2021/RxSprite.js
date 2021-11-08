"use strict";

class RenderSprite {
    constructor(textureName){
        this.textureName = textureName;
        this.cmul = V4_SOLIDWHITE;
        this.cadd = V4_TRANSBLACK;
        this.blur = 0.;
    }
    Render(go){      
       renderContext.RenderQuad(
            renderContext.texas[this.textureName],
            {...go.globalPosition,_z: go.z_1},
            go.scale,
            go.globalRotation,
            this.cmul,this.cadd,this.blur,           
            BLEND_NORMAL
        );
    }    
}
