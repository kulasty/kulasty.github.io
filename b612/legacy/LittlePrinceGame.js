var LittlePrinceGame = function()
{
var that = {
	root: null,
	prince: null,
	rose: null,
	planets: [],
	rnd: {
		NextDouble: function() { return Math.random(); },
		Next: function(range) { return Math.random()*range; }
	},
	vplayer: new Vector(0,0),
	gravity: new Vector(0,0.1),
	CreateDefault: function()
	{
		var game = new LittlePrinceGame();
		game.root = new Planetoid(new Vector(100,100),0,null);
		game.root.DeltaRotation = 0;
		game.planets = [];
		for(var u = 0; u<4; u++)
		for(var v = 0; v<3; v++)
		{
			var x = u*120+game.rnd.NextDouble()*20-10;
			var y = v*120+game.rnd.NextDouble()*20-10;
			if ((Math.round(v)%2)==1) x+=60;
			var r = 10 + game.rnd.Next(30);
			var p = new Planetoid(new Vector(x,y), r, game.root);
			var d = ((Math.round(u)%2)==1)?-1:1;
			p.DeltaRotation = ((game.rnd.NextDouble()*0.1)+0.1)*d;
			game.planets.push(p);
		}
		game.prince = new Planetoid(new Vector(150,-50),15, game.root);
		game.rose = new Planetoid(new Vector(0,0), 15, null);
		PlanetEngine.AdvanceAll(game.root, 0);
		game.rose.SetNewParent(game.planets[0]);
		game.rose.DeltaRotation = game.planets[0].DeltaRotation;
		game.prince.SetNewParent(game.root);
		PlanetEngine.AdvanceAll(game.root, 0);
		return game;
	},
	Advance: function(dt)
	{
		PlanetEngine.AdvanceAll(this.root, dt);			

        if (this.prince.Parent == this.root)
        {            
            dt /= 0.25;
            this.prince.Move(this.vplayer,dt);
            if (this.prince.Location.Y > 500 || this.prince.Location.X > 500 || this.prince.Location.X < -50)
            {                                    
                this.vplayer = new Vector(0, 0);
                this.prince.Location.Y = -50;
                this.prince.Location.X = 150;
                //NtFellOff();
            }                
            this.vplayer.X += this.gravity.X * dt;
            this.vplayer.Y += this.gravity.Y * dt;
        }

        var col = PlanetEngine.FindCollision(this.prince, this.root);
        if (col)
        {
            if (col == this.rose || col.Children.contains(this.rose))
            {
                //throw "got rose";
                var n = Math.floor(this.rnd.Next(this.planets.length-1));
                debug("got rose! next: " + n);
                this.rose.SetNewParent(this.planets[n]);
                this.rose.DeltaRotation = this.rose.Parent.DeltaRotation;
                //NtGatherRose();                    
            }
            else
            {                
                if (col!=this.prince.Parent)
                {
                    debug("Collision!");
                    this.prince.SetNewParent(col);
                    this.prince.DeltaRotation = col.DeltaRotation;
                }
            }
        }
		
	},
    Jump : function()
    {        
        var parent = this.prince.Parent;
        if (parent == this.root)
        {
            debug('no jump!');
            return;
            }
        debug('jump!');   
        var dx = this.prince.World.X - parent.World.X;
        var dy = this.prince.World.Y - parent.World.Y;
        var dr = Math.sqrt(dx * dx + dy * dy) * 0.3;
        dx /= dr;
        dy /= dr;
        this.vplayer = new Vector(dx, dy);
        //debug('v: ' + this.vplayer);
        this.prince.SetNewParent(this.root);

    }
	
};
return that;
}