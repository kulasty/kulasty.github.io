"use strict;"

class RenderSprite {
    constructor(textureName){
        this.textureName = textureName;
        this.cmul = [1,1,1,1];
        this.cadd = [0,0,0,0];
    }
    Render(go){
       rx.RenderSprite(go,rx.texas[this.textureName],this.cmul,this.cadd);
    }
}
