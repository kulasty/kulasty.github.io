class RenderLatern {
    Render(go){
        renderContext.RenderSprite(go,renderContext.texas["latern"],this.cmul,this.cadd); // FIXME
        renderContext.RenderSprite(go,renderContext.texas["latern_lit"],this.cmul,this.cadd); // FIXME
    }
}

class GoLatern extends GoActor {
    constructor(){
        super("latern");
        this.renderer = new RenderLatern();
    }
}