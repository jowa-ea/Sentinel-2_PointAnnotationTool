/*

Example annotation project

By Josef Wagner jwagner@unistra.fr | wagnerj@umd.edu
Last modified 07-05-2025

*/


////////////////// PROJECT SETUP ////////////////// 

//// Setting up NDVI time series visualization
var NDVI_sd = ee.Date('2024-08-15'); // Start date for NDVI time series plot
var NDVI_ed = ee.Date('2025-05-15'); // End date for NDVI time series plot

//// Setting up samples
// A feature collection of samples to be annotated, including a column "shuffled_i" as index
var samples = ee.FeatureCollection('GEE asset path to your samples to be annotated'); 
var zoomLevel = 14; // Map initial zoom level


//// Setting up default background map
Map.setOptions('HYBRID');

//// Setting up imagery parameters
var bounds = ee.FeatureCollection("FAO/GAUL/2015/level0").filter(ee.Filter.eq('ADM0_CODE',254)); // AOI shape, here Ukraine
var vizTC = {min:0, max:3000, bands:['B4','B3','B2']};
var vizFC = {min:0, max:3000, bands:['B8','B4','B3']};
var currentViz = true;

// Function to add imagery
// If else statement to invert viz params in "Swith Visualization" button
var addS2imagery = function(currentViz){
	
  //Sentinel-2 compositing script	
  function s2c(startD, endD, bounds){

    // Mask out clouds
    var S2CloudMask = function(img){
    
      // Get SCL band
      var SCL = img.select('SCL');
    
      // Create QA mask from SCL band
      var kernel = ee.Kernel.circle({radius: 1});
    
      var SCL_qa = ee.Image(0).where(SCL.gt(3).and(SCL.lt(7)),1)
        .focalMode({kernel:kernel,iterations:1})
        .byte();
    
      // Return masked image
      img = img.updateMask(SCL_qa.eq(1));
    
      return img;
      
    };
  
  
    // Create S2 image
    var s2 = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
      .filterDate(startD, endD)
      .filterBounds(bounds.geometry())
      //.map(S2CloudMask)
      .map(function(image){
        var b_inv = ee.Image(10000).subtract(image.select('B1')).rename('QAAAA');
        image = image.addBands([b_inv]);
        return image;
      }).qualityMosaic('QAAAA')
      .select(['B2','B3','B4','B8'])
      .set('imid', startD + '_' + endD);
    
    return ee.Image(s2);
    
  };
  
  if (currentViz === true){
    // Compositing periods and default visibility
    var dateRanges = [
    ['2024-09-01','2024-09-15',vizFC, false], //[startDate, endDate, Bool: visible or not]
    ['2024-09-15','2024-09-30',vizFC, true],
    ['2024-09-30','2024-10-15',vizFC, false],
    ['2024-10-15','2024-10-31',vizFC, false],
    ['2024-10-31','2024-11-15',vizFC, false],
    ['2024-11-15','2024-11-30',vizFC, false],
    ['2024-11-30','2024-12-15',vizFC, false],
    ['2024-12-15','2024-12-31',vizFC, false],
    ['2024-12-31','2025-01-15',vizFC, false],
    ['2025-01-15','2025-01-31',vizFC, true],
    ['2025-01-31','2025-02-14',vizFC, false],
    ['2025-02-14','2025-02-28',vizFC, true],
    ['2025-02-28','2025-03-15',vizFC, false],
    ['2025-03-15','2025-03-31',vizFC, true],
    ['2025-03-31','2025-04-15',vizTC, true],
    ['2025-04-15','2025-04-30',vizTC, true],
    ['2025-04-30','2025-05-07',vizTC, true]
    ]; 
  
    dateRanges.forEach(function(range, i) {
      i = s2c(range[0], range[1], bounds);
      Map.addLayer(i, range[2], range[0]+"_"+range[1], range[3]); // show spring
    });

    
    // Add CTM
    Map.addLayer(wc25.updateMask(wc25.gt(0)), wc_style, 'winter crops 25');
    
  }else{
    
    // Compositing periods and default visibility
    var dateRanges = [
    ['2024-09-01','2024-09-15',vizTC, false], //[startDate, endDate, Bool: visible or not]
    ['2024-09-15','2024-09-30',vizTC, true],
    ['2024-09-30','2024-10-15',vizTC, false],
    ['2024-10-15','2024-10-31',vizTC, false],
    ['2024-10-31','2024-11-15',vizTC, false],
    ['2024-11-15','2024-11-30',vizTC, false],
    ['2024-11-30','2024-12-15',vizTC, false],
    ['2024-12-15','2024-12-31',vizTC, false],
    ['2024-12-31','2025-01-15',vizTC, false],
    ['2025-01-15','2025-01-31',vizTC, true],
    ['2025-01-31','2025-02-14',vizTC, false],
    ['2025-02-14','2025-02-28',vizTC, true],
    ['2025-02-28','2025-03-15',vizTC, false],
    ['2025-03-15','2025-03-31',vizTC, true],
    ['2025-03-31','2025-04-15',vizFC, true],
    ['2025-04-15','2025-04-30',vizFC, true],
    ['2025-04-30','2025-05-07',vizFC, true]
    ]; 
  
    dateRanges.forEach(function(range, i) {
      i = s2c(range[0], range[1], bounds);
      Map.addLayer(i, range[2], range[0]+"_"+range[1], range[3]); // show spring
    });

    // Add CTM
    Map.addLayer(wc25.updateMask(wc25.gt(0)), wc_style, 'winter crops 25');
  }
};






////////////////// Annotation App setup ////////////////// 
// Create a panel to hold the navigation UI elements.
var navPanel = ui.Panel();
navPanel.style().set('width', '250px');  // Set a fixed width for the navigation panel
ui.root.add(navPanel);


// Create a button to uncheck all active layers.
var uncheckLayersButton = ui.Button({
  label: 'Uncheck All Layers',
  onClick: function() {
    Map.layers().forEach(function(layer) {
      layer.setShown(false);
    });
  },
  style: {
    fontSize: '14px',  // Set font size
    width: '200px',    // Set width
    height: '50px',    // Set height
  }
});
navPanel.add(uncheckLayersButton);


// Create a button to check all layers.
var checkLayersButton = ui.Button({
  label: 'Check All Layers',
  onClick: function() {
    Map.layers().forEach(function(layer) {
      layer.setShown(true);
    });
  },
  style: {
    fontSize: '14px',  // Set font size
    width: '200px',    // Set width
    height: '50px',    // Set height
  }
});
navPanel.add(checkLayersButton);



// Initialize with the last shuffle id you used
var featNo = 0;

// Create a label to display the number.
var numberLabel = ui.Label('Current Point Number: ' + featNo);
navPanel.add(numberLabel);

// Create an input box to enter a specific point number.
var pointInput = ui.Textbox({
  placeholder: 'Enter point number'
});
navPanel.add(pointInput);


// Create a button to go to the specified point.
var goToPointButton = ui.Button({
  label: 'Go To Point',
  onClick: function() {
    // Get the point number from the input box.
    var inputNumber = parseInt(pointInput.getValue(), 10);
    if (!isNaN(inputNumber)) {
      featNo = inputNumber;
      // Update the label to display the new number.
      numberLabel.setValue('Current Point Number: ' + featNo);
      // Run the script for the new point.
      runScript();
    } 
  }
});
navPanel.add(goToPointButton);

// Button for swiching from true to false color viz and back
var switchVizButton = ui.Button({
  label: 'Switch Visualization',
  onClick: function() {
    // Clear previous results.
    Map.clear();

    // Toggle the visualization parameters.
    if (currentViz === true) {
      currentViz = false;
    } else {
      currentViz = true;
    }

    // Re-add the layers with the new visualization parameters.
    runScript();
  }
});
navPanel.add(switchVizButton);


// Create a button to go to the previous point.
var prevButton = ui.Button({
  label: 'Previous Point',
  onClick: function() {
    // Decrement the number if greater than 0.
    if (featNo > 0) {
      featNo--;
      // Update the label to display the new number.
      numberLabel.setValue('Current Point Number: ' + featNo);
      // Run the script for the new point.
      runScript();
    }
  }
});
navPanel.add(prevButton);

// Create a button to increment the number.
var nextButton = ui.Button({
  label: 'Next Point',
  onClick: function() {
    // Increment the number twice
    featNo++;
    // Update the label to display the new number.
    numberLabel.setValue('Current Point Number: ' + featNo);
    // Run the script for the new point.
    runScript();
  },
});
navPanel.add(nextButton);

// Create a minimap (a smaller map)
var miniMap = ui.Map();
  miniMap.setOptions('ROADMAP');
  miniMap.setControlVisibility(false);
  miniMap.setCenter(31, 48, 4); // Centered on Ukraine
  miniMap.addLayer(samples.filter(ee.Filter.eq('shuffled_i', featNo)).first().geometry(), {color:'red'},'point');

// Embed minimap in a panel
var miniPanel = ui.Panel({
  widgets: [miniMap],
  style: {
    width: '300px',
    height: '150px',
    border: '1px solid gray',
    margin: '8px 0 0 0'
  }
});

// Add minimap to existing navPanel
navPanel.add(miniPanel);


// Function to generate the NDVI plot.
function updateNDVIPlot(point) {
  // Mask out clouds
  var S2 =ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")

    //filter start and end date
    .filterDate(NDVI_sd, NDVI_ed)
  
    //filter according to drawn boundary
    .filterBounds(bounds);
  
    // Function to mask cloud from built-in quality band
    // information on cloud
    var maskcloud1 = function(image) {
      var QA60 = image.select(['QA60']);
      return image.updateMask(QA60.lt(1));
    };
    
    // Function to calculate and add an NDVI band
    var addNDVI = function(image) {
    return image.addBands(image.normalizedDifference(['B8', 'B4']).rename('NDVI'));
    };
    
    // Add NDVI band to image collection
    S2 = S2.map(addNDVI);
    
    S2 = S2.select('NDVI');
    


  // Update the lon/lat panel with values from the point.
  lon.setValue('lon: ' + point.coordinates().get(0).getInfo().toFixed(2));
  lat.setValue('lat: ' + point.coordinates().get(1).getInfo().toFixed(2));

  // Create a NDVI chart.
  var ndviChart = ui.Chart.image.series(S2, point, ee.Reducer.median(), 10);
  ndviChart.setOptions({
    title: 'S2 NDVI --> ' + featNo,
    vAxis: {title: 'NDVI', maxValue: 1},
    hAxis: {title: 'date', format: 'MM-yy', gridlines: {count: 7}},
  });

  // Update the plot in the panel.
  plotPanel.widgets().set(3, ndviChart);
}

// Create a panel for NDVI plot and coordinates.
var plotPanel = ui.Panel();
plotPanel.style().set('width', '300px');
ui.root.insert(0, plotPanel);

// Create an intro panel with labels.
var intro = ui.Panel([
  ui.Label({
    value: 'Chart Inspector',
    style: {fontSize: '20px', fontWeight: 'bold'}
  }),
]);
plotPanel.add(intro);

// Panels to hold lon/lat values.
var lon = ui.Label();
var lat = ui.Label();
plotPanel.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));


function runScript() {
  // Clear previous results.
  Map.clear();

  // Add S2 imagery
  addS2imagery(currentViz);

  // Add point to map
  var point = samples.filter(ee.Filter.eq('shuffled_i', featNo)).first().geometry();
  
  //Map.addLayer(samples,{},'samples');
  Map.centerObject(point,zoomLevel);
  Map.setOptions('HYBRID');
  Map.addLayer(point,{color:'skyblue'},'point');
  Map.style().set('cursor', 'crosshair');

  updateNDVIPlot(point);
  
  // Map click event handler.
  Map.onClick(function(coords) {
    // Convert clicked coordinates to an Earth Engine point.
    var clickedPoint = ee.Geometry.Point([coords.lon, coords.lat]);
  
    // Update NDVI plot for the new point, retaining the previous plots.
    updateNDVIPlot(clickedPoint);
  });

}


// Initially run the process
runScript();






