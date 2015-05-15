var Spline = function(pts, chainlen, overlap) //Array of pts. Each nD pt takes the form of an n-length array. ex:[0,0] <- lol causes error in vim modeline
{
  var self = this;

  self.chainlen = (chainlen == 0) ? self.pts.length : chainlen; //num pts taken into account for any given t
  self.overlap = overlap; //num chains each pt can take part in (0 = each chain is disjoint)
  self.pts = pts;

  /*
  Popular combos:

  Continuous single-chain interpolation:
  chainlen - 0
  overlap  - 0

  Cubic Bezier:
  chainlen - 4
  overlap  - 1
  */

  self.interpAPt = interpAPtGen;

  self.t; //last calculated t
  self.derivedPts; //4D array- array of: all chains, all derived pts sets, set of pts, 'pt' AKA n-length array
  self.calculatedPt; //last calculated pt (identical to self.derivedPts[(chain_num_of_last_t)][self.chainlen-1][0]
  self.refreshSettings = function()
  {
    self.numchains = (self.pts.length-self.overlap)/(self.chainlen-self.overlap);

    //populate derivedPts arrays
    self.derivedPts = []; //each index = chain
    for(var i = 0; i < self.numchains; i++)
    {
      self.derivedPts[i] = []; //each index = layer of derivation
      for(var j = 0; j < self.chainlen; j++)
      {
        self.derivedPts[i][j] = []; //each index = pt
        for(var k = 0; k < self.chainlen-j; k++)
        {
          if(j == 0) self.derivedPts[i][j][k] = self.pts[(i*(self.chainlen-self.overlap))+k];
          else       self.derivedPts[i][j][k] = [];
        }
      }
    }

    //set specific interp algo based on dimension for slight performance gain
    if(self.pts.length > 0)
    {
      switch(self.pts[0].length)
      {
        case 1: self.interpAPt = interpAPt1D; break;
        case 2: self.interpAPt = interpAPt2D; break;
        case 3: self.interpAPt = interpAPt3D; break;
        case 4: self.interpAPt = interpAPt4D; break;
        case 5: self.interpAPt = interpAPt5D; break;
      }
    }
    else self.interpAPt = interpAPtGen;

    //set prev calc'd point to prevent false caching
    self.t = 0;
    self.calculatedPt = self.derivedPts[0][0][0];
  }

  self.ptForT = function(t)
  {
    if(t == self.t) return self.calculatedPt; //no need to recalculate
    t = (t+100)%1;
    self.t = t;

    var pass = 1; //'pass 0' is the population of the unchanging base pts
    var chain = Math.floor(self.t/(1/self.numchains));
    t = (self.t - chain*(1/self.numchains))/(1/self.numchains);
    while(pass < self.chainlen)
    {
      if(self.derivedPts === undefined ||
         self.derivedPts[chain] === undefined)
         {
          console.log("OH NO");
         }
      for(var i = 0; i < self.derivedPts[chain][pass-1].length-1; i++)
        self.interpAPt(self.derivedPts[chain][pass-1][i],self.derivedPts[chain][pass-1][i+1],t,self.derivedPts[chain][pass][i]);
      pass++;
    }
    return (self.calculatedPt = self.derivedPts[chain][self.derivedPts[chain].length-1][0]);
  };

  var sqrlen = function(a,b)
  {
    var sum = 0;
    for(var i = 0; i < a.length; i++)
      sum += (a[i]-b[i])*(a[i]-b[i]);
    return sum;
  }
  //attempt to derive closest t for given point- ITERATIVE HILL CLIMBING, NOT PERFECT
  self.everyoth = 0;
  self.tForPt = function(pt,fromt, scale, depth)
  {
    var depthtest;
    if(self.everyoth%2 == 0) depthtest = depthtesta;
    else                     depthtest = depthtestb;
    self.everyoth++;
    var bestt = fromt;
    var bestlen = sqrlen(pt,self.ptForT(fromt));

    var pivot = fromt;
    var p; var plen;
    var n; var nlen;
    while(depth > 0)
    {
      p = self.ptForT(((pivot-scale)+100)%1); plen = sqrlen(pt,p);
      n = self.ptForT(((pivot+scale)+100)%1); nlen = sqrlen(pt,n);

      depthtest[depth][0] = 0;
      if(plen < bestlen)
      {
        bestt = pivot-scale;
        bestlen = plen;
        if(depthtest[depth] === undefined)
        {
          console.log("what no");
        }
        depthtest[depth][0] = p[0];
        depthtest[depth][1] = p[1];
      }
      if(nlen < bestlen)
      {
        bestt = pivot+scale;
        bestlen = nlen;
        if(depthtest[depth] === undefined)
        {
          console.log("what no");
        }
        depthtest[depth][0] = n[0];
        depthtest[depth][1] = n[1];
      }
      if(depthtest[depth][0] == 0)
      {
        var p = self.ptForT(bestt);
        depthtest[depth][0] = p[0];
        depthtest[depth][1] = p[1];
      }

      scale /= 2;
      depth--;
    }
    return (bestt + 100)%1;
  }

  self.refreshSettings();
};

//General interpolation over any n-dimensional points
var interpAPtGen = function(pt1, pt2, t, ptr)
{
  for(var i = 0; i < pt1.length; i++)
    ptr[i] = pt1[i]+((pt2[i]-pt1[i])*t);
  return ptr;
};
//Loop-less algorithms for ever-so-slight performance gains
var interpAPt1D = function(pt1, pt2, t, ptr)
{
  ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
  return ptr;
}
var interpAPt2D = function(pt1, pt2, t, ptr)
{
  /*
  console.log(pt1[0]+",a");
  console.log(pt1[1]+",b");
  console.log(pt2[0]+",c");
  console.log(pt2[1]+",d");
  console.log(ptr[0]+",e");
  console.log(ptr[1]);
  */
  ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
  ptr[1] = pt1[1]+((pt2[1]-pt1[1])*t);
  return ptr;
}
var interpAPt3D = function(pt1, pt2, t, ptr)
{
  ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
  ptr[1] = pt1[1]+((pt2[1]-pt1[1])*t);
  ptr[2] = pt1[2]+((pt2[2]-pt1[2])*t);
  return ptr;
}
var interpAPt4D = function(pt1, pt2, t, ptr)
{
  ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
  ptr[1] = pt1[1]+((pt2[1]-pt1[1])*t);
  ptr[2] = pt1[2]+((pt2[2]-pt1[2])*t);
  ptr[3] = pt1[3]+((pt2[3]-pt1[3])*t);
  return ptr;
}
var interpAPt5D = function(pt1, pt2, t, ptr)
{
  ptr[0] = pt1[0]+((pt2[0]-pt1[0])*t);
  ptr[1] = pt1[1]+((pt2[1]-pt1[1])*t);
  ptr[2] = pt1[2]+((pt2[2]-pt1[2])*t);
  ptr[3] = pt1[3]+((pt2[3]-pt1[3])*t);
  ptr[4] = pt1[4]+((pt2[4]-pt1[4])*t);
  return ptr;
}

var PTS_MODE_COUNT = 0;
var PTS_MODE_CUBIC_BEZIER = PTS_MODE_COUNT; PTS_MODE_COUNT++;
var derivePtsFromPtsMode = function(pts, mode, connect)
{
  switch(mode)
  {
    case PTS_MODE_CUBIC_BEZIER:
    {
      var newpts = [];
      var i = 0;
      while(i < pts.length)
      {
        if(i < 4) newpts.push(pts[i]);
        else
        {
          newpts.push(interpAPtGen(pts[i-2],pts[i-1],2,[]));
          newpts.push(pts[i]); i++;
          newpts.push(pts[i]);
        }
        i++;
      }
      if(connect)
      {
        newpts.push(interpAPtGen(pts[i-2],pts[i-1],2,[]));
        newpts.push(interpAPtGen(pts[1],pts[0],2,[]));
        newpts.push(pts[0]);
      }
      return newpts;
    }
    break;
  }
  return pts;
}

