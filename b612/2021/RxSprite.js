"use strict";

class RenderSprite {
    constructor(textureName){
        this.textureName = textureName;
        this.cmul = V4_SOLIDWHITE;
        this.cadd = V4_TRANSBLACK;
        this.blur = 0.;
    }
    Render(go){
       renderContext.RenderSprite(go,renderContext.texas[this.textureName],this.cmul,this.cadd,this.blur); // FIXME
    }
}
