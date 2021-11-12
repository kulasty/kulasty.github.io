"use strict";

function DebugOverlay_Render(game){
    if (document.getElementById("overlay").classList.contains("hidden")){
        return;
    }
    if (cnt_frame&1){
        return;
    }
        
    gx_overlay.clearRect(0, 0, 800, 800);            

    var astar = game.navAtlas[game.player.name];
    
    for(let p of game.objects.solid){
        gx_circle(gx_overlay,
            p.globalPosition.x, p.globalPosition.y, p.radius, 'rgba(255,128,255,0.7)',
            p.globalRotation, p.globalRotation + PI2-0.1
        );

    }

    let planetindex = function(p){
        for(let i in game.planets){
            if (game.planets[i]===p) return i;
        }
        return -1;
    }

    let prediction = undefined;
    let actor = undefined;
    {
        //let atlas_name_map = {"fox":fox, "star": star, "prince": prince, "sheep": sheep}
        //actor = atlas_name_map[atlas_name];
        actor = game.player;
        
        let angle = actor.rotation-PI05; //Math.atan2(v.y,v.x)+Math.PI;
        prediction = astar.getDestinationFromPlanet(getTruePlanet(actor),angle);

        if (prediction!==undefined){
            let p = prediction.dst;
            if (p!==undefined){
                prediction = p;
                gx_disk(gx_overlay,
                        p.globalPosition.x, p.globalPosition.y, p.radius, 'rgba(255,255,0,0.3)',
                        p.globalRotation, p.globalRotation + PI2-0.1
                    );
            }
        }
    }

    for(let p of game.planets){
        //let p = planets[0];
        let seg = [];
        let gx = gx_overlay;
        for(let hit of astar.maps[p]){
            let dst = hit.dst;
            let k = hit.k;
            seg.push(hit);
            if (seg.length>1){                        
                gx.beginPath();
                var [h1,h2] = seg;
                let k1 = h1.k + 0.01;
                let k2 = h2.k - 0.01;
                if (k1<k2){
                    let style = 'rgba(128,128,255,0.3)'
                    let r2 = 40+planetindex(h1.dst)*5;
                    if (h1.dst===undefined){
                        style = 'rgba(255,128,128,0.3)'
                        r2 = 120;
                    }
                    if (h1.dst===p){
                        style = 'rgba(128,255,128,0.3)'
                        r2 = 30;
                    }
                    if (p===getTruePlanet(actor) &&  h1.dst===prediction){
                        style = 'rgba(255,255,128,0.3)'
                    }

                    let k2a = Math.max(k1,k2- 4.0/(p.radius+10));
                    let k2b = Math.max(k1,k2- 4.0/(p.radius+r2));                        

                    gx.arc(p.globalPosition.x,p.globalPosition.y,p.radius+10,k1,k2a,false);
                    gx.arc(p.globalPosition.x,p.globalPosition.y,p.radius+r2,k2b,k1,true);
                    gx.closePath();                        
                    gx.strokeStyle = style;
                    gx.stroke();
                    gx.fillStyle = style;
                    gx.fill();
                }
                seg.shift();
                
            }                    
        }
    }

    {
        let actors = game.actors;
        for(let a of actors){                    
            if (a===undefined || a.behaviour instanceof BeaJump == false){
                continue;
            }
            let p = a.behaviour.p2 || a.behaviour.p1;
            let x1 = a.globalPosition.x;
            let y1 = a.globalPosition.y;
            let x2 = p.globalPosition.x;
            let y2 = p.globalPosition.y;
            let v = MathEx.vector(p.globalPosition, a.globalPosition);
            let r = MathEx.vlength(v);
            x1 -= v.x/r*a.radius;
            y1 -= v.y/r*a.radius;
            x2 += v.x/r*p.radius;
            y2 += v.y/r*p.radius;
            
            gx_line(gx_overlay, x1, y1, x2, y2, 'rgba(255,128,255,0.3)');
        }
    }            
}
