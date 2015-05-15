var depthtesta = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
var depthtestb = [[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0],[0,0]];
var GamePlayScene = function(game, stage)
{
  var self = this;

  var clicker;
  var dragger;
  var hoverer;
  var drawer;

  var ForceBtn = function()
  {
    var self = this;

    self.x = 0;
    self.y = 0;
    self.w = 100;
    self.h = 100;

    self.click = function(evt)
    {
      c.applyForce(10);
    }

    self.draw = function(canv)
    {
      canv.context.strokeRect(self.x,self.y,self.w,self.h);
    }
  }

  var Track = function(s)
  {
    var self = this;

    self.s = s;

    self.canv = new Canv({width:stage.drawCanv.canvas.width,height:stage.drawCanv.canvas.height});
    var stampSpline = function(c,s,r,w)
    {
      var pt = [0,0];
      c.context.lineWidth = w;
      c.context.beginPath();

      pt = s.ptForT(0);
      c.context.moveTo(pt[0],pt[1]);
      for(var i = 1; i < r; i++)
      {
        pt = s.ptForT(i/r);
        c.context.lineTo(pt[0],pt[1]);
      }
      pt = s.ptForT(1);
      c.context.lineTo(pt[0],pt[1]);

      c.context.stroke();
    }
    self.refreshCanv = function()
    {
      self.canv.clear();
      self.canv.context.strokeStyle = "#999999";
      stampSpline(self.canv,self.s,1000,20);
      self.canv.context.strokeStyle = "#000000";
      stampSpline(self.canv,self.s,1000,1);
    }
    self.refreshCanv();

    self.draw = function(canv)
    {
      self.canv.blitTo(canv);
    }
  }

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
    self.ffr = [0,0]; //force of friction

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

    var drawArrow = function(canv,from,to)
    {
      canv.context.beginPath();
      canv.context.moveTo(from[0],from[1]);
      canv.context.lineTo(to[0],to[1]);
      /*
      var arrow = [0,0];
      var arrow2 = [0,0];
      copy(sub(to,from),arrow);
      arrow2[0] = -arrow[1];
      arrow2[1] = arrow[0];
      copy(add(arrow2,to),arrow);
      canv.context.moveTo(to[0],to[1]);
      canv.context.lineTo(arrow[0],arrow[1]);
      */
      canv.context.stroke();
    }

    var drawPt = function(canv,pt,r)
    {
      canv.context.beginPath();
      canv.context.arc(pt[0],pt[1],r,0,2*Math.PI);
      canv.context.stroke();
    }

    self.resetOnSpline = function()
    {
      self.t = 0;
      copy(self.s.ptForT(self.t),self.pos);
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
      stage.drawCanv.context.fillText(thing+"("+vec[0]+","+vec[1]+") : "+len(vec),10,y);
    }
    var prinall = function(canv)
    {
      canv.context.fillStyle = "#000000";

      canv.context.strokeStyle = "#000000";
      drawPt(canv,self.pos,2);
      prin(canv,"pos",self.pos,10);

      canv.context.strokeStyle = "#0000FF";
      drawPt(canv,self.ppo,2);
      prin(canv,"ppo",self.ppo,30);

      canv.context.strokeStyle = "#00FF00";
      drawPt(canv,self.map,5);
      prin(canv,"map",self.map,50);

      canv.context.strokeStyle = "#00FFFF";
      drawArrow(canv,self.pos,add(self.pos,scalmul(copy(self.dir,[0,0]),100)));
      prin(canv,"dir",self.dir,70);

      canv.context.strokeStyle = "#FF0000";
      drawArrow(canv,self.pos,add(self.pos,scalmul(copy(self.vel,[0,0]),10)));
      prin(canv,"vel",self.vel,90);

      canv.context.strokeStyle = "#FF00FF";
      drawArrow(canv,self.pos,add(self.pos,scalmul(copy(self.pve,[0,0]),10)));
      prin(canv,"pve",self.pve,110);

      canv.context.strokeStyle = "#FFFF00";
      drawArrow(canv,self.pos,add(self.pos,scalmul(copy(self.acc,[0,0]),10)));
      prin(canv,"acc",self.acc,130);

      canv.context.strokeStyle = "#000000";
      drawArrow(canv,self.pos,add(self.pos,scalmul(copy(self.frc,[0,0]),10)));
      prin(canv,"frc",self.frc,150);

      canv.context.strokeStyle = "#000000";
      drawArrow(canv,self.pos,add(self.pos,scalmul(copy(self.ffr,[0,0]),10)));
      prin(canv,"ffr",self.ffr,170);
    }
    self.tick = function()
    {
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
      self.frc[0] += self.ffr[0];
      self.frc[1] += self.ffr[1];
      self.acc[0] += self.frc[0]/self.m;
      self.acc[1] += self.frc[1]/self.m;

      self.frc[0] = 0;
      self.frc[1] = 0;
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
        if(false)//(lensqr(sub(self.map,self.ppo)) > 1000)
          self.on = false;
        else
        {
          copy(proj(self.vel,sub(self.map,self.pos)),self.pve);
          copy(sub(self.pve,self.vel),self.ffr);
          copy(self.pve,self.vel);

          copy(add(self.pos,self.pve),self.pos);

          self.t = self.s.tForPt(self.pos,tmp_t,vlen,10);
          copy(self.s.ptForT(self.t),self.pos);
          copy(sub(self.s.ptForT(self.t+0.0001),self.pos),self.dir);
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

      drawPt(canv,self.pos,self.r);
    }
  };

  var t;
  var c;
  var s;
  var f;

  self.ready = function()
  {
    clicker = new Clicker({source:stage.dispCanv.canvas});

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
    t = new Track(s);
    c = new Car(s);

    f = new ForceBtn();
    clicker.register(f);

    var pt = s.ptForT(0);
    c.x = pt[0];
    c.y = pt[1];
  };

  self.tick = function()
  {
    clicker.flush();
    c.tick();
  };

  self.draw = function()
  {
    var canv = stage.drawCanv;
    t.draw(canv);
    c.draw(canv);
    f.draw(canv);

/*
      //Debug Spline

      canv.context.strokeStyle = "#FF0000";
      for(var i = 0; i < depthtesta.length; i++)
        drawPt(canv,depthtesta[i],2);
      canv.context.strokeStyle = "#00FF00";
      for(var i = 0; i < depthtestb.length; i++)
        drawPt(canv,depthtestb[i],2);

      for(var i = 0; i < s.pts.length; i++)
      {
        if(i%3 == 0) canv.context.strokeStyle = "#FF0000";
        drawPt(canv,s.pts[i],2);
        canv.context.strokeStyle = "#888888";
      }
      for(var i = 0; i < s.derivedPts.length; i++)
      {
        for(var j = 0; j < s.derivedPts[i].length; j++)
        {
          for(var k = 0; k < s.derivedPts[i][j].length-1; k++)
          {
            canv.context.beginPath();
            canv.context.moveTo(s.derivedPts[i][j][k][0],s.derivedPts[i][j][k][1]);
            canv.context.lineTo(s.derivedPts[i][j][k+1][0],s.derivedPts[i][j][k+1][1]);
            canv.context.stroke();
          }
        }
      }
  */

  };

  self.cleanup = function()
  {
  };

};

