
var PlanetEngine = 
{
	Add: function(a,b) { return new Vector(a.X + b.X, a.Y + b.Y);},
	Length: function(a) { return Math.sqrt(a.X * a.X + a.Y * a.Y); },
	Distance: function(a, b)
        {
            var x = a.X - b.X;
            var y = a.Y - b.Y;
            return Math.sqrt(x * x + y * y);
        },
	FindCollision: function(a, root)
	{
		if (a!=root)
		{
			var distance = PlanetEngine.Distance(a.World, root.World);
			var R = a.Radius + root.Radius;
			if (distance < R)
				return root;
		}
		for(var i=0; i< root.Children.length; i++)
		{
			var ch = root.Children[i];
			var c = PlanetEngine.FindCollision(a, ch);
			if (c!=null) return c;
		}
		return null;
	},
	Surface: function(center, rad, rot)
	{
		return new Vector(
	                (Math.cos(rot) * rad + center.X),
        	        (Math.sin(rot) * rad + center.Y));
	},
	Advance: function(p, dt)
	{
            // update rotation
            p.Rotation += p.DeltaRotation * dt;

            // if parent is not null, compute position based on parent rotation
            // here: hard link is assumed; no orbit-velocity implemented
            if (p.Parent != null)
            {
                var r = p.Parent.Radius + PlanetEngine.Length(p.Location);
                p.World = PlanetEngine.Surface(p.Parent.World, r, p.Parent.Rotation + p.RefRotation);
            }
            else
            {
                p.World = p.Location;
            }
	},
	AdvanceAll: function(p, dt)
	{
		PlanetEngine.Advance(p, dt);
		for(var i in p.Children)
			PlanetEngine.AdvanceAll(p.Children[i], dt);
	}
};
