"use strict";

class Game{
    static currentGame = undefined;
    constructor(){
        this.objects = {
            solid: [],
            background: []
        }
    }
    onclick(){
        this.player.jump();
    }
    Render(){
        if (this.actors.latern!==undefined) {
            let t = this.actors.latern.globalPosition;
            for(let p of this.planets){
                const pos = p.globalPosition;
                p.lightRotation = Math.PI*0.7+Math.atan2(t.y-pos.y,t.x-pos.x);
            }
        }else{        
            if (game.planets!==undefined)
            for(let p of game.planets){
                const pos = p.globalPosition;
                const t = mouse;
                p.lightRotation = Math.PI*0.7+Math.atan2(t.y-pos.y,t.x-pos.x);
            }
        }
    
    }
}