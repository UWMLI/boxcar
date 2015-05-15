/*
silly basic vector helper funcs-
generously uses global variables and trusts use of copy for any
potential conflict/mutability considerations. you probably shouldn't
use this unless you made it.
*/
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

var drawVec = function(canv,from,to)
{
  canv.context.beginPath();
  canv.context.moveTo(from[0],from[1]);
  canv.context.lineTo(to[0],to[1]);
  canv.context.stroke();
}

var drawPt = function(canv,pt,r)
{
  canv.context.beginPath();
  canv.context.arc(pt[0],pt[1],r,0,2*Math.PI);
  canv.context.stroke();
}

var prin = function(canv,thing,vec,y)
{
  canv.context.fillText(thing+"("+vec[0]+","+vec[1]+") : "+len(vec),10,y);
}

