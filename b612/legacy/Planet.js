var _array = [];
if (!_array.indexOf)
    Array.prototype.indexOf = function(s){
        for(var i=0;i<this.length;i++) if (this[i]==s) return i;
        return -1;
    }

Array.prototype.remove = function(s){
    var i = this.indexOf(s);
    this.splice(i, 1);
}

Array.prototype.contains = function(s){
    return this.indexOf(s)!=-1;
}

var Vector = function(x,y)
{
	return { X:x, Y:y, toString: function() { return this.X+":"+this.Y; } };
}

var PlanetoidCounter = 0;

var Planetoid = function(loc, rad, parent){
var that = {

// members
	Location:	loc,
	World: 		new Vector(0,0),
	Radius:		rad,
	Rotation:	0.0,
	DeltaRotation:	0.1,
	RefRotation:	0.0,
	Parent:		parent,
	Children:	[],

	hash: 0,

// gears
	GetHashCode : function(){ return this.hash; },

	Move: function(d){
		this.Location.X += d.X;
		this.Location.Y += d.Y;
		this.RefRotation = Math.atan2(this.Location.Y,this.Location.X);			
	},			

	SetNewParent: function(newParent){
		if (this.Parent!=null)
			this.Parent.Children.remove(this);
		this.Parent = newParent;
		if (this.Parent == null)
			return;
		this.Parent.Children.push(this);
		var nx = this.World.X - this.Parent.World.X;
		var ny = this.World.Y - this.Parent.World.Y;
		if (this.Parent.Radius > 0)
		{
			var r = Math.sqrt(nx*nx+ny*ny);
			nx/=r;
			ny/=r;
			// add something (1 here) to avoid unnecessary collision
			this.Location = new Vector(nx * (this.Radius + 1), ny * (this.Radius + 1));
			this.Rotation = Math.atan2(ny, nx);
		}
		else
		{
			this.Location = new Vector(nx, ny);
		}
		this.RefRotation = Math.atan2(this.Location.Y, this.Location.X) - this.Parent.Rotation;
	}
	
};

if (parent!=null)
{
	parent.Children.push(that);
	that.Move(new Vector(0,0));
}

that.hash = PlanetoidCounter++;

return that;
}

