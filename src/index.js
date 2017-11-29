var rocky = require('rocky');
var tidalHeight = 0;
var tidalStation;

function fractionToRadian(fraction) {
  return fraction * 2 * Math.PI;
}

function drawShell(ctx, cx, cy, strokeColor, fillColor) {
  var dim = 60;
  var cdim = dim/2;
  var dx = cx-cdim;
  var dy = cy-cdim;
  
  //Styles
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 3;
  ctx.fillStyle = fillColor;
  
  //Outer Path
  ctx.beginPath();
  
  //Base
  ctx.moveTo(dx+13,dy+45);
  ctx.lineTo(dx+13,dy+52);
  ctx.lineTo(dx+16,dy+54);
  ctx.lineTo(dx+25,dy+54);
  ctx.lineTo(dx+30,dy+58);
  ctx.lineTo(dx+dim-25,dy+54);
  ctx.lineTo(dx+dim-16,dy+54);
  ctx.lineTo(dx+dim-13,dy+52);
  ctx.lineTo(dx+dim-13,dy+45);
  
  //Top Right
  ctx.lineTo(dx+dim-2,dy+36);
  ctx.lineTo(dx+dim-1,dy+32);
  ctx.lineTo(dx+dim-4,dy+26);
  ctx.lineTo(dx+dim-4,dy+23);
  ctx.lineTo(dx+dim-5,dy+19);
  ctx.lineTo(dx+dim-10,dy+14);
  ctx.lineTo(dx+dim-14,dy+10);
  ctx.lineTo(dx+dim-16,dy+9);
  ctx.lineTo(dx+dim-20,dy+9);
  ctx.lineTo(dx+dim-24,dy+6);
  ctx.lineTo(dx+dim-28,dy+6);
  ctx.lineTo(dx+30,dy+8);
  
  //Top Left
  ctx.lineTo(dx+28,dy+6);
  ctx.lineTo(dx+24,dy+6);
  ctx.lineTo(dx+20,dy+9);
  ctx.lineTo(dx+16,dy+9);
  ctx.lineTo(dx+14,dy+10);
  ctx.lineTo(dx+10,dy+14);
  ctx.lineTo(dx+5,dy+19);
  ctx.lineTo(dx+4,dy+23);
  ctx.lineTo(dx+4,dy+26);
  ctx.lineTo(dx+1,dy+32);
  ctx.lineTo(dx+2,dy+36);
  ctx.lineTo(dx+13,dy+45);
  
  //End Stroke
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
  
  //Inner Path
  ctx.beginPath();
  
  //Indents
  ctx.moveTo(dx+20,dy+50);
  ctx.lineTo(dx+30,dy+58);
  ctx.lineTo(dx+dim-20,dy+50);
  ctx.moveTo(dx+dim-4,dy+26);
  ctx.lineTo(dx+dim-15,dy+40);
  ctx.moveTo(dx+dim-10,dy+14);
  ctx.lineTo(dx+dim-19,dy+35);
  ctx.moveTo(dx+dim-20,dy+9);
  ctx.lineTo(dx+dim-25,dy+33);
  ctx.moveTo(dx+30,dy+8);
  ctx.lineTo(dx+30,dy+32);
  ctx.moveTo(dx+20,dy+9);
  ctx.lineTo(dx+25,dy+33);
  ctx.moveTo(dx+10,dy+14);
  ctx.lineTo(dx+19,dy+35);
  ctx.moveTo(dx+4,dy+26);
  ctx.lineTo(dx+15,dy+40);
  
  //End Stroke
  ctx.stroke();
  ctx.closePath();
}

function drawTicks(ctx, cx, cy, hourColor, halfHourColor) {
  for(var i=0.5;i<=12;i+=0.5)
  {
    var angle = i*(Math.PI*2/12);
    var length = 8;
    ctx.lineWidth = 4;
    if(i%1===0)
    {
      ctx.strokeStyle = hourColor;
      if(i%3===0)
        length = 12;
    }
    else
    {
      ctx.strokeStyle = halfHourColor;
      length = 6;
    }
    var pos1 = [cx+Math.cos(angle)*(cx+2),cy+Math.sin(angle)*(cy+2)];
    var pos2 = [cx+Math.cos(angle)*(cx+2-length),cy+Math.sin(angle)*(cy+2-length)];
    
    ctx.beginPath();
    
    ctx.moveTo(pos1[0],pos1[1]);
    ctx.lineTo(pos2[0],pos2[1]);
    
    ctx.stroke();
    ctx.closePath();
  }
  ctx.fillStyle = "black";
  ctx.textAlign = 'center';
  ctx.fillText("12", cx, 10);
  ctx.fillText("3", cx*2-(ctx.measureText("3").width/2+15), cy-(ctx.measureText("3").height/2+2));
  ctx.fillText("6", cx, cy*2-(ctx.measureText("6").height+15));
  ctx.fillText("9", (ctx.measureText("9").width/2+14), cy-(ctx.measureText("9").height/2+2));
}

function drawDate(ctx, x, y, d)
{
  var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var day = days[d.getDay()];
  var month = months[d.getMonth()];
  var date = d.getDate();
  ctx.fillStyle = "black";
  ctx.textAlign = 'center';
  ctx.fillText(day+", "+month+" "+date, x, y, x);
}

function drawTide(ctx, x, y)
{
  ctx.fillStyle = "black";
  ctx.textAlign = 'center';
  ctx.fillText(tidalStation+": "+tidalHeight, x, y, x);
}

function drawHand(ctx, cx, cy, angle, length, color) {
  // Find the end points
  var x2 = cx + Math.sin(angle) * length;
  var y2 = cy - Math.cos(angle) * length;

  // Configure how we want to draw the hand
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;

  // Begin drawing
  ctx.beginPath();

  // Move to the center point, then draw the line
  ctx.moveTo(cx, cy);
  ctx.lineTo(x2, y2);

  // Stroke the line (output to display)
  ctx.stroke();
}

rocky.on('draw', function(event) {
  var ctx = event.context;
  var d = new Date();
  
  // Clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  
  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;
  
  //Color Background
  ctx.fillStyle = "white";
  ctx.fillRect(0,0,w,h);

  // Determine the center point of the display
  // and the max size of watch hands
  var cx = w / 2;
  var cy = h / 2;
  
  //Draw Shell
  drawShell(ctx, cx, cy, "#71EEB8", "#A8DCFF");
  
  //Draw Date
  drawDate(ctx, cx, cy*11/8, d);
  
  //Draw Tidal Height
  drawTide(ctx, cx, cy*3/8);
  
  //Draw Ticks
  drawTicks(ctx, cx, cy, "teal", "#71EEB8");

  // -20 so we're inset 10px on each side
  var maxLength = (Math.min(w, h) - 40) / 2;

  // Calculate the minute hand angle
  var minuteFraction = (d.getMinutes()) / 60;
  var minuteAngle = fractionToRadian(minuteFraction);

  // Draw the minute hand
  drawHand(ctx, cx, cy, minuteAngle, maxLength, "#71EEB8");

  // Calculate the hour hand angle
  var hourFraction = (d.getHours() % 12 + minuteFraction) / 12;
  var hourAngle = fractionToRadian(hourFraction);

  // Draw the hour hand
  drawHand(ctx, cx, cy, hourAngle, maxLength * 0.6, "teal");
});

rocky.on('minutechange', function(event) {
  // Request the screen to be redrawn on next pass
  rocky.requestDraw();
});

rocky.on('hourchange', function(event) {
  // Send a message to fetch the tidal data (on startup and every hour)
  rocky.postMessage({'fetch': true});
});

rocky.on('message', function(event) {
  // Receive a message from the mobile device (pkjs)
  var message = event.data;

  if (message.height) {
    // Save the tidal data
    tidalHeight = message.height;
    tidalStation = message.station;
    console.log(tidalHeight);
    console.log(tidalStation);
    // Request a redraw so we see the information
    rocky.requestDraw();
  }
  else if(message.requestFailed) {
    if(tidalHeight===0&&tidalStation===undefined) {
      tidalStation=message.err;
      rocky.requestDraw();
    }
    if(message.err=="loc err")
      rocky.postMessage({'fetch':true, 'pos':{coords:{latitude:34.398945, longitude:-119.518370}}});
  }
});