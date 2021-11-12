"use strict";

// make background
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function Level_makeStars(game){
    let backgroundCollection = game.objects.background;
    let bg = new GameObject();
    backgroundCollection.push(bg);
    bg.renderer = new RenderSprite("bg");
    bg.position = {x:400,y:400};
    bg.scale = 2;
    bg.z_1 = 0.1;
    bg.effect = new Effect();
    bg.effect.cadd = [0,0,0,0.5];
        
    let stars = [];

    Math.seedrandom("starfield");
    for(let i=0;i<50;i++){
        let go = new GoStar();
        backgroundCollection.push(go);
        go.position = {x:MathEx.randRange(10,790), y:MathEx.randRange(10,790)};
        go.s = MathEx.randRange(0.03,0.075);
        go.k = MathEx.randomAngle();       
        go.z_1 = MathEx.randRange(0.2,0.7); 
        stars.push(go);
    }

    let piasecki = [[174,215],[326,259],[370,325],[430,379],[600,450],[535,524],[406,468]];
    for(let i in piasecki){
        let [x,y] = piasecki[i];
        let go = new GoStar();
        backgroundCollection.push(go);
        go.position = {x:x,y:y+20};
        go.s = 0.2;
        go.k = MathEx.randomAngle(); //-i*0.05;
        go.z_1 = 0.2; 
    }
}    
