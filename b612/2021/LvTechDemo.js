"use strict";

function Level_makeTechDemo(game){
    // setup planets
    let planets = [];
    game.planets = planets;
    for(let y=0;y<3;y++){
        var nx = 3;
        if (y==1) {nx = 4;}
        for(let x=0;x<nx;x++)    
        {
            let p = new GoPlanet(`level1-${x}-${y}`,(x+1-(y%2)*0.5)*200,(y-1+0.5)*230+400-230*0.5);
            p.position.x+=Math.random()*20-10;
            p.position.y+=Math.random()*20-10;
            planets.push(p)
            game.objects.solid.push(p);
        }
    }        

    let navAtlas = {}
    game.navAtlas = navAtlas;

    // create navmaps
    let actors = ['star','prince','fox','sheep'];
    for(let actorname of actors){
        var astar = new NavMap();
        console.log("NavMap",actorname);
        astar.process(planets, new GoActor(actorname)); // radius required
        navAtlas[actorname] = astar;        
    }

    // create "posters"
    //-----------------------------------------------------------------------

    // frost
    function frost_slow(){
        time_multiplier = Math.max(0.2,time_multiplier - 0.3);
        console.log("time_multiplier",time_multiplier);
    }
    function frost_speed(){
        time_multiplier = Math.min(1,time_multiplier + 0.3);
        console.log("time_multiplier",time_multiplier);
    }

    for(let i=0;i<3;i++){
        let frost = new GoActor("frost");
        game.objects.solid.push(frost);
        frost.spawnAtPlanet(planets[5],MathEx.randomAngle());    
        frost.queue = [];
        frost.addHandler(GameEvent.TOUCHDOWN,frost_slow);
        frost.addHandler(GameEvent.JUMP,frost_speed);
    }
    planets[5].queue = [];
    planets[5].addHandler(GameEvent.TOUCHDOWN,frost_slow);
    planets[5].addHandler(GameEvent.JUMP,frost_speed);    

    // retro
    let retro = new GoActor("retro");
    game.objects.solid.push(retro);
    retro.spawnAtPlanet(planets[planets.length-1],MathEx.randomAngle())

    // scarf
    let scarf = new GoActor("scarf");
    game.objects.solid.push(scarf);
    scarf.spawnAtPlanet(planets[planets.length-2],MathEx.randomAngle());

    // bush
    let bush = new GoActor("bush");
    game.objects.solid.push(bush);
    bush.spawnAtPlanet(planets[planets.length-3],MathEx.randomAngle());

    // portal
    let portal = new GoPortal();
    game.objects.solid.push(portal);
    portal.spawnAtPlanet(planets[0],0);
    portal.effect = new EfBlink();

    // box
    let box = new GoActor("box");
    game.objects.solid.push(box);
    box.spawnAtPlanet(planets[1],MathEx.randomAngle());
    box.radius*=0.7;

    GameObject.UpdateAll(game.objects.solid);

    // create "actors"
    //-----------------------------------------------------------------------

    let star = new GoActor("star")    
    game.objects.solid.push(star);
    star.spawnAtPlanet(planets[planets.length-4],MathEx.randomAngle());    

    let prince = new GoActor("prince");    
    //game.objects.solid.push(prince);
    prince.spawnAtPlanet(scarf,scarf.globalRotation+Math.PI);    

    let fox = new GoActor("fox");
    //game.objects.solid.push(fox);
    fox.spawnAtPlanet(bush,bush.globalRotation+Math.PI)   

    let sheep = new GoActor("sheep");
    //game.objects.solid.push(sheep);
    sheep.spawnAtPlanet(box,box.globalRotation+Math.PI);

    let rose = new GoActor("rose");
    game.objects.solid.push(rose);
    rose.effect = new EfBlink();
    rose.spawnAtPlanet(planets[3],MathEx.randomAngle());

    let rose_index = game.objects.solid.length;

    // put lattern last as it glows

    let latern = new GoLatern();
    game.objects.solid.push(latern);
    latern.spawnAtPlanet(planets[4],MathEx.randomAngle());    

    let me = planets[4];
    me.addHandler(GameEvent.TOUCHDOWN,function(){
        latern.lit+=1;
    });
    me.addHandler(GameEvent.JUMP,function(){
        latern.lit-=1;
    });

    latern.addHandler(GameEvent.TOUCHDOWN, function(me){
        me.lit+=1;
    });
    latern.addHandler(GameEvent.JUMP, function(me){
        me.lit-=1;
    });


    // setup logic
    let player = star;
    player.addHandler(GameEvent.JUMP,function(){
        console.log("Player.JUMP");
        //navigator.vibrate(30);
        //synth.triggerAttack("C3");        
    });
    player.addHandler(GameEvent.TOUCHDOWN,function(that,args){
        console.log("Player.TDOWN",args);
        //navigator.vibrate(30);
        //synth.triggerRelease();
        
        let planet = getPlanet(that);
        if (planet===getPlanet(retro) || planet===retro){
            let mode = RM_HIRES;
            if (renderMode == mode) mode = RM_RETRO;
            setRenderMode(mode);
        }    
    });

    player.addHandler(GameEvent.TOUCHDOWN, function(){
        let rosePlanet = getTruePlanet(rose);        
        if (rosePlanet!==undefined && rosePlanet === getTruePlanet(player)){
            rose.jump();
        }

        let portalPlanet = getTruePlanet(portal);
        if (portalPlanet!==undefined && portalPlanet === getTruePlanet(player)){
            follow_player = true;
            cam_front.t_zoom = 1.5;
            console.log('camera on player');
        }
    });

    player.addHandler(GameEvent.JUMP, function(){
        let portalPlanet = getTruePlanet(portal);
        if (portalPlanet!==undefined && portalPlanet === getTruePlanet(player)){
            follow_player = false;
            cam_front.t_zoom = 1;
            console.log('camera on front');
        }
    });

    rose.addHandler(GameEvent.TOUCHDOWN, function(){
        let rosePlanet = getTruePlanet(rose)
        if (rosePlanet!==undefined && rosePlanet === getTruePlanet(player)){
            rose.jump();
        }
    })

    fox.controller = new GocFollow(prince);
    sheep.controller = new GocFollow(star);
    prince.controller = new GocFollow(rose);

    player.addHandler(GameEvent.TOUCHDOWN, function(){
        if (getTruePlanet(player) === getTruePlanet(box) && game.objects.solid.indexOf(sheep)<0){
            game.objects.solid.splice(rose_index,0,sheep);
            sheep.Update();
            sheep.jump();
        }                
        if (getTruePlanet(player) === getTruePlanet(bush) && game.objects.solid.indexOf(fox)<0){
            game.objects.solid.splice(rose_index,0,fox);
            fox.Update();
            fox.jump();
        }                
        if (getTruePlanet(player) === getTruePlanet(scarf) && game.objects.solid.indexOf(prince)<0){
            game.objects.solid.splice(rose_index,0,prince);
            prince.Update();
            prince.jump();
        }                
    })

    GameObject.UpdateAll(game.objects.solid);

    game.player = player;
    game.actors = [prince, rose, fox, sheep];
    for(let actor of game.actors){
        actor.navMap = navAtlas[actor.name];
    }
    game.actors.latern = latern;
}
