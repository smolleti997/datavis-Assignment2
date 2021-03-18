
var mapSvg;
var legendSvg;
var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };

var mapData;
var timeData;

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  mapSvg = d3.select('#map');
  lineSvg = d3.select('#linechart');
  legendSvg=d3.select('#legendSvg');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([d3.json('data/africa.geojson'),
               d3.csv('data/africa_gdp_per_capita.csv')])
          .then(function(values){
    
    mapData = values[0];
    timeData = values[1];
    
    drawMap();
  })

});

// Get the min/max values for a year and return as an array
// of size=2. You shouldn't need to update this function.
function getExtentsForYear(yearData) {
  var max = Number.MIN_VALUE;
  var min = Number.MAX_VALUE;
  for(var key in yearData) {
    if(key === 'Year') 
      continue;
    let val = +yearData[key];
    if(val > max)
      max = val;
    if(val < min)
      min = val;
  }
  return [min,max];
}

// Draw the map in the #map svg
function drawMap() {

 legendSvg.selectAll('*').remove()
    d3.selectAll("defs").remove()
    var tips = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
  // create the map projection and geoPath
  let projection = d3.geoMercator()
                      .scale(400)
                      .center(d3.geoCentroid(mapData))
                      .translate([+mapSvg.style('width').replace('px','')/2,
                                  +mapSvg.style('height').replace('px','')/2.3]);
  let path = d3.geoPath()
               .projection(projection);

  // get the selected year based on the input box's value
  
   

    var year = document.getElementById('year-input').value;
  // get the GDP values for countries for the selected year
  let yearData = timeData.filter( d => d.Year===year)[0];
  
  // get the min/max GDP values for the selected year
  let extent = getExtentsForYear(yearData);

  // get the selected color scale based on the dropdown value
  //var colorselection =document.getElementById("color-scale-select").value;
  //var colorScale = d3.scaleSequential(d3[colorselection])
                     //.domain(extent);
    let colorScale = null;
    switch (document.getElementById('color-scale-select').value) {
        case 'interpolateRdYlGn':
            colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain(extent);
            break;
        case 'interpolateViridis':
            colorScale = d3.scaleSequential(d3.interpolateViridis).domain(extent);
            break;
        case 'interpolateBrBG':
            colorScale = d3.scaleSequential(d3.interpolateBrBG).domain(extent);
            break;
             case 'interpolateCool':
            colorScale = d3.scaleSequential(d3.interpolateCool).domain(extent);
            break;
             case 'interpolateTurbo':
            colorScale = d3.scaleSequential(d3.interpolateTurbo).domain(extent);
            break;
        default:
            colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain(extent);
            break;
    }
   


//defining div for tooltip
  // var div = d3.select("body")
  //   .append("div")  
  //   .attr("class", "tooltip")      
  //   .style("opacity", "0");

// for legend 
let margin = ({top: 20, right: 20, bottom: -500, left: 20})

 let barHeight = 20
  let   height = 20
  let   width = 300
                     
  let  axisScale = d3.scaleLinear(colorScale)
                     .domain(colorScale.domain())
                     .range([margin.left, width - margin.right])

let  axisBottom = g => g
     .attr("class", `x-axis`)
     .attr("transform", `translate(0,${height - margin.bottom})`)
  .call(d3.axisBottom(axisScale)
    .ticks(width/50)
    .tickSize(-barHeight))


     
  legendSvg.width = width;
    legendSvg.height = height;

    const defs = mapSvg.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");

    linearGradient.selectAll("stop")
        .data(colorScale.ticks().map((t, i, n) => ({offset: `${100 * i / n.length}%`, color: colorScale(t)})))
        .enter().append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);

    legendSvg.append('g')
        .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)

        .append("rect")
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr("width", width - margin.right - margin.left)
        .attr("height", barHeight)
        .style("fill", "url(#linear-gradient)");


    legendSvg.append('g')
        .call(axisBottom);

  // draw the map on the #map svg
  let g = mapSvg.append('g');
   g.selectAll('path')
    .data(mapData.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('id', d => { return d.properties.name})
    .attr('class','countrymap')
    .style('fill', d => {
      let val = +yearData[d.properties.name];
      if(isNaN(val)) 
        return 'white';
      return colorScale(val);
    })
    .on('mouseover', function(d,i) {
    // console.log('mouseover on ' + d.properties.name);
    // d3.select(this).transition()
    // .duration('50')
    // .attr("opacity",".85");
    // div.transition()    
    //   .duration(50)
    //   .style("opacity",1);
    //          div.html( d.properties.name + "<br/>" +yearData[d.properties.name])  
    //           .style("left", (d3.event.pageX+10) + "px")   
    //           .style("top", (d3.event.pageY-15) + "px");
                  
    //  // for cyan on hover and stroke 4px             
    // d3.selectAll(".Countrymap")
    //   .transition()
    //   .duration(200)
    //   .style("opacity", .5)
    // d3.select(this)
    //   .transition()
    //   .duration(200)
    //   .style("opacity", 1)
    //   .style("stroke", "cyan") 
    //   .style("stroke-width","4px") 
    let gdp = yearData[d.properties.name]
            if (isNaN(gdp) || gdp === "") {
                gdp = "0";
            }
            d3.select(this)
                .style('stroke', 'cyan')
                .style('stroke-width', '4px')
                // .style('class', ".tooltip")

            tips.style('class', '.tooltip')
                .text(function () {
                    return "Country: " + d.properties.name + "\nGDP: " + gdp;
                })
                .style('opacity', 1)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 35) + "px")
    })
    .on('mousemove',function(d,i) {
      //console.log('mousemove on ' + d.properties.name);
      d3.select(this)
                .style('border-width', '50px')
    })
    .on('mouseout', function(d,i) {
      //console.log('mouseover on ' + d.properties.name);
    //    div.transition()   
    //       .duration(500)    
    //       .style("opacity", 0);
    //       // for black on mouseout
    //   d3.selectAll(".Countrymap")
    //    .transition()
    //    .duration(200)
    //    .style("opacity", .8)
    // d3.select(this)
    //   .transition()
    //   .duration(200)
    //   .style("stroke", "black")
    //   .style("stroke-width","1px")
    d3.select(this)
                .style('stroke', 'black')
                .style('stroke-width', '1px')
            tips.style('opacity', 0)
    })
    .on('click', function(d,i) {
      drawLineChart(d.properties.name)
      

    });
    
  // var linearGradient = g.append("linearGradient")
  //       .attr("id", "linear-gradient")
  //       .attr ("colorScale",colorScale);
    
  //   linearGradient.selectAll("stop")
  //     .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
  //     .enter().append("stop")
  //     .attr("offset", d => d.offset)
  //     .attr("stop-color", d => d.color);
    
  //   g.append('g')
  //     .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
  //     .append("rect")
  //     .attr('transform', `translate(${margin.left}, 0)`)
  //   .attr("width", width-margin.right-margin.left)
  //   .attr("height", barHeight)
  //   .style("fill", "url(#linear-gradient)");
    
  //   mapSvg.append('g')
  //     .call(axisBottom);
    
  //   return mapSvg.node();
    
 }


// Draw the line chart in the #linechart svg for
// the country argument (e.g., `Algeria').
function drawLineChart(country) {

  if(!country)
    return;
  timeData.forEach(function (d) {
   if (isNaN(d[country]) || d[country] === "")
            d[country] = 0.0
        else
            d[country] = parseFloat(d[country])
    })
   lineSvg.selectAll('*').remove()
    const xScale = d3.scaleLinear().range([0, lineInnerWidth])
    const yScale = d3.scaleLinear().range([lineInnerHeight, 0])
    const valueLine = d3.line()
        .x(function (timeData) {
            return xScale(timeData.Year)
        })
        .y(function (timeData) {
            return yScale(timeData[country])
        })
    xScale.domain(d3.extent(timeData, function (d) {
        return d.Year;
    }))
    yScale.domain([0, d3.max(timeData, function (d) {
        return d[country];
    })])

    let bisect = d3.bisector(function(d) { return d.Year; }).left;


    let g = lineSvg.append('g')
        .attr("transform", "translate(" + lineMargin.left + "," + lineMargin.top +")" )

    let focus = g.append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "black")
        .attr('r', 10)
        .style("opacity", 0)

    let focusText = d3.select("body")
        .append("div")
        .attr('id', 'linetip')
        .attr("class", "tooltip")
        .style("opacity", 0);

    g.append("path")
        .data([timeData])
        .attr("class", "line")
        .attr("d", valueLine);

    const yAxis = d3.axisLeft(yScale);
    g.append("g")
        .text("GDP for " + country+ " (based on current USD)")
        .style('color', 'gray')
        .style('font-size', '1em')
        .call(yAxis.tickSize(-lineWidth + lineMargin.left + lineMargin.right)
        .tickFormat(formatTick))
        .call(g => g.select(".domain")
            .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
            .attr("stroke-opacity", 0.5)
            .attr("stroke-dasharray", "3,5"))
        .call(g => g.selectAll(".tick text")
            .attr("x", -5)
            .attr("dy", 4));

    const xAxis = d3.axisBottom(xScale).ticks(12).tickFormat((i, j) => {
        return j % 2 !== 0 ? " " : i;
    });
    g.append("g")
        .text("Year")
        .style('color', 'gray')
        .style('font-size', '1em')
        .attr("transform", "translate(0,"+ (lineInnerHeight)+")")
        .call(xAxis);

    g.append("text")
        .attr("class", "x label")
        .attr("x", lineInnerWidth / 2 + 10)
        .attr("y", lineInnerHeight + 40)
        .style("text-anchor", "middle")
        .style("font-size", "1em")
        .style('fill', 'gray')
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .text("Year");

    g.append("text")
        .attr("class", "y label")
        .attr("y", lineMargin.left/4 -93)
        .attr("x", -(lineInnerHeight / 2))
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .style("font-size", "1em")
        .style('fill', 'gray')
        .style("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .text("GDP for " + country+ " (based on current USD)");

    g.append('rect')
        .style('fill', 'none')
        .style("pointer-events", "all")
        .attr('width', lineInnerWidth)
        .attr('height', lineInnerHeight)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

    function mouseover() {
        focus.style("opacity", 1)
        focusText.style("opacity",1)
    }
    function mousemove() {
        // let x0 = xScale.invert(d3.mouse(this)[0]);
        let x0 = xScale.invert(d3.mouse(this)[0]);
        let i = bisect(timeData, x0, 1);
        let selectedData = timeData[i]
        if (typeof selectedData != "undefined") {
            focus
                .attr("cx", xScale(selectedData.Year))
                .attr("cy", yScale(selectedData[country]))

                focusText
                .text(function () {
                    return "Year: " + selectedData.Year + "\nGDP: " + selectedData[country];
                })
                .style('opacity', 1)
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 55) + "px")
        }
    }
    function mouseout() {
        focus.style("opacity", 0)
        focusText.style("opacity", 0)
    }

}

function formatTick(d) {
    const s = (d).toFixed(0);
    return this.parentNode.nextSibling ? `\xa0${s}` : `${s}`;

//   var margin = {top: 10, right: 30, bottom: 30, left: 60},
//    width = 460 - margin.left - margin.right,
//    height = 400 - margin.top - margin.bottom;

// //append the svg object to the body of the page
// var lineSvg = d3.select("#my_vis")
//                  .append("lineSvg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis 
  //   var x = d3.scaleLinear()
  //     .domain(d3.extent(data, function(d) { return timeData.Year; }))
  //     .range([ 0, width ]);
  //   lineSvg.append("g")
  //     .attr("transform", "translate(0," + height + ")")
  //     .call(d3.axisBottom(x));

  //   // Add Y axis
  //   var y = d3.scaleLinear()
  //        .domain([0, d3.max(data, function(d) { return timeData[country]; })])
  //     .range([ height, 0 ]);
  //   lineSvg.append("g")
  //     .call(d3.axisLeft(y));

  //     const valueLine = d3.line()
  //       .x(function (timeData) {
  //           return xScale(timeData.Year)
  //       })
  //       .y(function (timeData) {
  //           return yScale(timeData[country])
  //       })

  //  // Add the line
  //   lineSvg.append("path")
  //     .data(mapData.features)
  //     .attr("fill", "none")
  //     .attr("stroke", "black")
  //     .attr("stroke-width", 1.5)
  //     .attr("d", d3.line()
  //       .x(function(d) { return x(timeData.Year) })
  //       .y(function(d) { return y(timeData[Country] )  })
  //       var bisect = d3.bisector(function(d) { return d.x; }).left;
  //        var focus = lineSvg.append('g')
  //                           .append('circle')
  //                           .style("fill", "none")
  //                           .attr("stroke", "black")
  //                           .attr('r', 10)
  //                           .style("opacity", 0)
  // var focusText = lineSvg.append('g')
  //   .append('text')
  //     .style("opacity", 0)
  //     .attr("san-serif", "left")
  //     .attr("alignment-baseline", "middle")

  //    lineSvg.append('rect')
  //   .style("fill", "none")
  //   .style("pointer-events", "all")
  //   .attr('width', width)
  //   .attr('height', height)
  //   .on('mouseover', mouseover)
  //   .on('mousemove', mousemove)
  //   .on('mouseout', mouseout);

  //   function mouseover() {
  //   focus.style("opacity", 1)
  //   focusText.style("opacity",1)
  // }
  // function mousemove() {
  //   // recover coordinate we need
  //   var x0 = x.invert(d3.mouse(this)[0]);
  //   var i = bisect(data, x0, 1);
  //   selectedData = data[i]
  //   focus
  //     .attr("cx", x(selectedData.x))
  //     .attr("cy", y(selectedData.y))
  //   focusText
  //     .html("Year:" + timeData.Year+ "  -  " + "GDP:" +timeData[Country])
  //     .attr("x", x(selectedData.x)+15)
  //     .attr("y", y(selectedData.y))
  //   }
  // function mouseout() {
  //   focus.style("opacity", 0)
  //   focusText.style("opacity", 0)
  // }
 
        
      
}
