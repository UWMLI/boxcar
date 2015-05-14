var GamePlayScene = function(game, stage)
{
  var self = this;

  var clicker;
  var dragger;
  var hoverer;
  var drawer;

  var Car = function(s)
  {
    var self = this;

    var pt = [];
    self.t = 0; //t on spline
    self.s = s; //spline
    self.on = true;

    self.pos = [0,0];
    self.ppo = [0,0]; //projected position
    self.map = [0,0]; //map of projection back to spline
    self.dir = [0,0]; self.spd = 0;
    self.vel = [0,0]; //derivable from dir+spd
    self.pve = [0,0]; //projected vel
    self.acc = [0,0];
    self.frc = [0,0];

    self.x = self.pos[0];
    self.y = self.pos[1];
    self.r = 10; //radius (const)
    self.m = 10; //mass   (const)
    self.e = 0;  //energy

    var copy = function(a,b)
    {
      b[0] = a[0];
      b[1] = a[1];
      return b;
    }
    var lensqr = function(vec)
    {
      return vec[0]*vec[0]+vec[1]*vec[1];
    }
    var len = function(vec)
    {
      return Math.sqrt(lensqr(vec));
    }
    var iseq = function(a,b)
    {
      return a[0] == b[0] && a[1] == b[1];
    }
    var addr = [0,0];
    var add = function(a,b)
    {
      addr[0] = a[0]+b[0];
      addr[1] = a[1]+b[1];
      return addr;
    }
    var subr = [0,0];
    var sub = function(a,b)
    {
      subr[0] = a[0]-b[0];
      subr[1] = a[1]-b[1];
      return subr;
    }
    var scalmul = function(vec,scal)
    {
      vec[0] *= scal;
      vec[1] *= scal;
      return vec;
    }
    var scaldiv = function(vec,scal)
    {
      vec[0] /= scal;
      vec[1] /= scal;
      return vec;
    }
    var norm = function(vec)
    {
      scaldiv(vec,len(vec));
      return vec;
    }
    var dot = function(a,b)
    {
      return a[0]*b[0]+a[1]*b[1];
    }
    var cosangle = function(a,b)
    {
      return dot(a,b)/(len(a)*len(b));
    }
    var proja = [0,0];
    var projb = [0,0];
    var proj = function(a,b)
    {
      return scalmul(norm(copy(b,projb)),len(a)*cosangle(a,b));
    }

    self.resetOnSpline = function()
    {
      self.t = 0;
      self.pos = self.s.ptForT(self.t);
      copy(sub(self.s.ptForT(self.t+0.0001),self.pos),self.dir);
      norm(self.dir);
      self.on = true;
    }
    self.resetOnSpline();
    self.applyEnergy = function(e)
    {
      //?
    }
    self.applyForce = function(f)
    {
      self.frc[0] += f*self.dir[0];
      self.frc[1] += f*self.dir[1];
    }
    self.applyForce(1);

    self.collidesCar = function(ob)
    {
      return (Math.abs(self.pos[0]-ob.x) < self.r &&
              Math.abs(self.pos[1]-ob.y) < self.r);
    }
    self.collidesInRect = function(x,y,w,h)
    {
      return(self.pos[0]+self.r > x && self.pos[0]-self.r < x+w &&
             self.pos[1]+self.r > y && self.pos[1]-self.r < y+h);
    }
    self.collidesOutRect = function(x,y,w,h)
    {
      return(self.pos[0]-self.r < x || self.pos[0]+self.r > x+w ||
             self.pos[1]-self.r < y || self.pos[1]+self.r > y+h);
    }

    var otherobs = [];
    var prin = function(canv,thing,vec,y)
    {
      //console.log(thing+"("+vec[0]+","+vec[1]+")");
      stage.drawCanv.context.fillText(thing+"("+vec[0]+","+vec[1]+") : "+len(vec),10,y);
    }
    var prinall = function(canv)
    {
      canv.context.fillStyle = "#000000";
      prin(canv,"pos",self.pos,10);
      prin(canv,"ppo",self.ppo,30);
      prin(canv,"map",self.map,50);
      prin(canv,"dir",self.dir,70);
      prin(canv,"vel",self.vel,90);
      prin(canv,"pve",self.pve,110);
      prin(canv,"acc",self.acc,130);
      prin(canv,"frc",self.frc,150);
    }
    self.tick = function()
    {
      if(isNaN(self.pos[0]))
      {
        console.log("whu");
      }
      self.resolveCollisions(otherobs);
      self.resolveForces();
      self.resolveAccelleration();
      self.resolveVelocity();
    }
    self.resolveCollisions = function(obs)
    {
    }
    self.resolveForces = function()
    {
      self.acc[0] += self.frc[0]/self.m;
      self.acc[1] += self.frc[1]/self.m;

      self.frc[0] = 0;
      self.frc[1] = 0;
    }
    self.resolveAccelleration = function()
    {
      self.vel[0] += self.acc[0];
      self.vel[1] += self.acc[1];

      self.e = self.m*lensqr(self.vel)/2;

      self.acc[0] = 0;
      self.acc[1] = 0;
    }
    self.resolveVelocity = function()
    {
      if(self.vel[0] == 0 && self.vel[1] == 0) return;
      if(self.on)
      {
        var vlen = len(self.vel);
        copy(add(self.pos,self.vel),self.ppo);
        var tmp_t = self.s.tForPt(self.ppo,self.t,vlen/100,10);
        copy(self.s.ptForT(tmp_t),self.map);
        if(iseq(self.map,self.pos)) return;
        if(lensqr(sub(self.map,self.ppo)) > 1000)
          self.on = false;
        else
        {
          copy(proj(self.vel,sub(self.map,self.pos)),self.pve);
          var fric = len(sub(self.pve,self.vel));
          //self.vel = scalmul(self.pve,100*fric);
          copy(self.pve,self.vel);

          copy(add(self.pos,self.pve),self.pos);

          self.t = self.s.tForPt(self.pos,tmp_t,vlen,10);
          copy(self.s.ptForT(self.t),self.pos);
          copy(sub(self.s.ptForT(self.t+0.0001),self.pos),self.dir);
          if(self.dir[0] < 0)
            console.log('wait');
          norm(self.dir);

          copy(proj(self.vel,self.dir),self.vel);
        }
      }
      if(!self.on)
      {
        self.pos[0] += self.vel[0];
        self.pos[1] += self.vel[1];
      }
    }

    self.draw = function(canv)
    {
      prinall(canv);
      canv.context.beginPath();
      canv.context.arc(self.pos[0],self.pos[1],self.r,0,2*Math.PI);
      canv.context.stroke();
    }
  };

  var c;
  var s;

  self.ready = function()
  {
    s = new Spline(
     derivePtsFromPtsMode([
      [240,15],
      [305,12],
      [405,25],
      [452,68],
      [514,148],
      [524,200],
      [472,285],
      [423,284],
      [376,235],
      [345,187],
      [261,145],
      [236,175],
      [218,248],
      [176,272],
      [65,260],
      [39,197],
      [30,86],
      [84,96] ], PTS_MODE_CUBIC_BEZIER, true),
    4,1);
    c = new Car(s);

    var pt = s.ptForT(0);
    c.x = pt[0];
    c.y = pt[1];
  };

  self.tick = function()
  {
    c.tick();
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    c.draw(canv);
  };

  self.cleanup = function()
  {
  };

};

