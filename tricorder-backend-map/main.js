import Feature from 'ol/Feature.js';
import Geolocation from 'ol/Geolocation.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
import {OSM, XYZ, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import * as olColor from 'ol/color';
import * as olProj from 'ol/proj';
import {Control, defaults as defaultControls} from 'ol/control.js';
import Circle from 'ol/geom/Circle.js';

var minDotSize = 20
var transAdd = 0


var currentTransmitterPointsLayers = null;
function hue(power, minLevel, range) {
	var p = Math.round(260 + (260/range)*(minLevel-power));
	//console.log(p + ":" + power);
	return p;
}

function hueF(power) {

const text = document.getElementById("transmitter").innerHTML;

if(text == "Wifi") {
	return hue(power, -100, 80);	
}
if(text == "Cell") {
	return hue(power, -130,100);
}

}


var the_map;



function colorWithAlpha(color, alpha) {
    const [r, g, b] = Array.from(olColor.asArray(color));
    return olColor.asString([r, g, b, alpha]);
 }

const styleFunction = function (feature) {
  const f = feature.get('fill');
  const g = 'rgba(255, 0, 0, 1)';
  return new Style({
    fill: new Fill({
      color: f,
    }),
    stroke: new Stroke({
      color: '#000000',
    }),
  });
};


const styleFunctionH = function (feature) {
  const f = feature.get('fill');
  const g = 'rgba(255, 0, 0, 1)';
  return new Style({
    fill: new Fill({
      color: colorWithAlpha(f, 0.8),

    }),
    stroke: null
  });
};

const labelStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    overflow: true,
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3,
    }),
  }),
});


const source = new VectorSource({
  url: './data/mapGEO.json',
  format: new GeoJSON() } ); 



function dataSource(data_type, resolution) {
console.log( './data/'+data_type+'_'+resolution+'_GEO.json');
return new VectorSource({
  url: './data/'+data_type+'_'+resolution+'_GEO.json',
  format: new GeoJSON() } ); 
};

const vectorLayer = new VectorLayer({
  source: source,
  style: styleFunction,

}) 


const vectorLayerLabel = new VectorLayer({
  source: source,
  style: function (feature) {
    const label = feature.get('label');
    console.log(label);
    labelStyle.getText().setText(label);
    return labelStyle;
  },
  minZoom: 21,

});

const measurements = [ "Histogram", "WifiCount", "Heartrate", "CO2", "eCO2", "TVOC", "Part>0.3", 
         "Part>0.5", "Part>1.0", "Part>2.5", "Part>5.0", "Part>10.0", "STS-5", "J305" ]

const minZoomLevel=[20, 19,      18,      17,      16,      15,      14,      13,      12,     11,       10,       9,       8,       7,       6,       5,       4,       3,       2,       1]
const maxZoomLevel=[100, 20,      19,      18,      17,      16,      15,      14,      13,     12,       11,      10,       9,       8,       7,       6,       5,       4,       3,       2]
const Resolutions= ["500000","200000","100000","050000","020000","010000","015000","010000","005000","002500","001000","000500","000250","000100","000050","000025","000010","000005","000002","000001"]

const measurementVector = new Array();
var mVector;

for(var ii = 0 ; ii < measurements.length ; ii++) {

mVector = new Array();
for(var i = 0 ; i < minZoomLevel.length ; i++) {
mVector.push( 
	
     new VectorLayer({
  source: dataSource(measurements[ii], Resolutions[i]),
  style: styleFunctionH
  ,
  minZoom: minZoomLevel[i],
  maxZoom: maxZoomLevel[i]

}) );


}

measurementVector.push( mVector);
}




const view = new View({
  center: olProj.fromLonLat([-93.3525331,44.9649524]),
  zoom: 20,
});



function removeLayers( layers ) {
    for(var i = 0 ; i < layers.length ; i++) {
	the_map.removeLayer( layers[i] )
	}
   }


function addLayers( layers ) {
    for(var i = 0 ; i < layers.length ; i++) {
	the_map.addLayer( layers[i] )
	}
   }


var measureIndex;

measureIndex = 0;

function addToIndex() { 

console.log("mi: " + measureIndex);
measureIndex++;
console.log("mi: " + measureIndex);
}


class RotateNorthControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.id = "test";
    button.innerHTML = measurements[0];

    button.style.backgroundColor = 'white';
    const element = document.createElement('div');
    element.className = 'rotate-north ol-unselectable ol-control';
    element.id = "aaaa";
    element.appendChild(button);
    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.handleRotateNorth.bind(this), false);
  }

  handleRotateNorth() {


	if( document.getElementById("test").style.backgroundColor == 'red') {
     
                console.log( "remove layer: " + measureIndex);
		removeLayers( measurementVector[measureIndex] ); 

		addToIndex();
                console.log( "measureIndex: " + measureIndex);

		if(measureIndex < measurements.length) 
                       {
                       console.log( "add layer: " + measureIndex + " length : " + measurements.length);
			addLayers( measurementVector[measureIndex] );

    			document.getElementById("test").innerHTML = measurements[measureIndex];
			}
		else {

                	console.log( "set to zero now :  " + measureIndex);
			document.getElementById("test").style.backgroundColor = 'white';
			measureIndex = 0; 
    			document.getElementById("test").innerHTML = measurements[measureIndex];
			}
	
	}

	else  {
     
                console.log( "add layer bottom : " + measureIndex);
    		document.getElementById("test").style.backgroundColor = 'red';
		addLayers( measurementVector[0] ); 
		measureIndex = 0;
}
	
	}
  
}



const mapLayers = [
new TileLayer({
  source: new XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  }),
    minZoom: 15,
    maxZoom: 19
}),
    new TileLayer({
      source: new OSM(),
      maxZoom:15
    }),
	vectorLayer,
        vectorLayerLabel ];



class MapOnControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.id = "map_on";
    button.innerHTML = "Map";

    button.style.backgroundColor = 'white';
    const element = document.createElement('div');
    element.className = 'map-on ol-unselectable ol-control';
    element.id = "map_on";
    element.appendChild(button);
    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.handleMapOn.bind(this), false);
  }

  handleMapOn() {


	if( document.getElementById("map_on").style.backgroundColor == 'red') {

		removeLayers( mapLayers);     
		document.getElementById("map_on").style.backgroundColor = 'white';

	
	}

	else  {
     
    		document.getElementById("map_on").style.backgroundColor = 'red';
		addLayers( mapLayers); 
}
	
	}
  
}



function transmitterSourceStyle(feature) { return new Style({
       
image: new CircleStyle({
      radius: 4,
    fill: new Fill({
      color: "hsla(" + hueF(feature.get("power") | feature.get("level")) + ",50%,50%,"+ /*1/((Math.pow(1+feature.get("uncertainty"),2))) |*/ 1+" )"
    }),
    
    stroke: new Stroke({
      color: '#000',
      width: 1,
    }),

      }) }) }


function transmitterStyle(feature) { 

if(feature.get("level")) { return new Style({
    fill: new Fill({
      color: "hsla(" + hueF(feature.get("level")) + ",50%,50%,"+ (transAdd + 1/(Math.pow(1+feature.get("uncertainty"),2)))+" )"
    }) 
       ,


	geometry: function(feature) {
      return new Circle(
        feature.getGeometry().getCoordinates(),
        Math.max(feature.get("uncertainty") , minDotSize)
      ) }
    }) 


console.log("power");}
if(feature.get("power")) {

 return new Style({
       
image: new CircleStyle({
      radius: 4,
    fill: new Fill({
      color: "hsla(" + hueF(feature.get("power") | feature.get("level")) + ",50%,50%,"+ 1/*/(Math.pow(1+feature.get("uncertainty"),2))*/+" )"
    }),
    
    stroke: new Stroke({
      color: '#000',
      width: 1,
    }),

      }) }) }


console.log("Line");
return new Style({
	image: new LineStyle ({       
    
    stroke: new Stroke({
      color: '#000',
      width: 4,
    }),

      })
})


}
  
function transmitterStyle2(feature) { return new Style({
       
image: new CircleStyle({
      radius: 4,
    fill: new Fill({
      color: "hsla(" + hueF(feature.get("power") | feature.get("level")) + ",50%,50%,"+ /*1/((Math.pow(1+feature.get("uncertainty"),2))) |*/ 1+" )"
    }),
    

      }) }) }


const transmitterWifiSource = new VectorSource({
  url: './data/xmtrs_wifi_GEO.json',
  format: new GeoJSON() } ); 


const transmitterCellSource = new VectorSource({
  url: './data/xmtrs_cell_GEO.json',
  format: new GeoJSON() } ); 


const transmitterWifiLayer = new VectorLayer({
  source: transmitterWifiSource,
  style: transmitterSourceStyle

}) 


const transmitterCellLayer = new VectorLayer({
  source: transmitterCellSource,
  style: transmitterSourceStyle

}) 

const transmitterWifiLabel = new VectorLayer({
  source: transmitterWifiSource,
  style: function (feature) {
    const label = feature.get('name');
    labelStyle.getText().setText(label);
    return labelStyle;
  },
  minZoom: 21,
});


const transmitterCellLabel = new VectorLayer({
  source: transmitterCellSource,
  style: function (feature) {
    const label = feature.get('name');
    console.log(label);
    labelStyle.getText().setText(label);
    return labelStyle;
  },
  minZoom: 21,

});


const transmitterWifiLayers = [
	transmitterWifiLayer,
        transmitterWifiLabel ];


const transmitterCellLayers = [
	transmitterCellLayer,
        transmitterCellLabel ];


class TransmitterControl extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.id = "transmitter";
    button.innerHTML = "Wifi";

    button.style.backgroundColor = 'white';
    const element = document.createElement('div');
    element.className = 'transmitter ol-unselectable ol-control';
    element.id = "transmitter2";
    element.appendChild(button);
    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.handleTransmitter.bind(this), false);
  }

  handleTransmitter() {

	if(currentTransmitterPointsLayers) {
		removeLayers( currentTransmitterPointsLayers );
		currentTransmitterPointsLayers = null;
	}


	var element = document.getElementById("transmitter"); 
	if( element.style.backgroundColor == 'red' && element.innerHTML == "Cell") {

		removeLayers( transmitterCellLayers);     
		element.innerHTML = "Wifi";
		element.style.backgroundColor = 'white';

	
	}
	else {
	if( element.style.backgroundColor == 'red' && element.innerHTML == "Wifi") {
		removeLayers( transmitterWifiLayers);
		addLayers( transmitterCellLayers );

		minDotSize = 3
		element.innerHTML = "Cell";	
		}
	else  {
     
    		document.getElementById("transmitter").style.backgroundColor = 'red';
		addLayers( transmitterWifiLayers); 

		minDotSize = 0.05
	}
}
}
	
	}
 





function transmitterPoints(filename, feature) { var s = new VectorSource({
  url: "./"+filename,
  format: new GeoJSON() } );
return s;}


function transmitterPointsLayer(filename, feature) { return new VectorLayer({
  source: transmitterPoints(filename, feature),
  style: transmitterStyle2
  //  style: transmitterSourceStyle

}) }

function transmitterPointsLayers(filename, feature) { 
	var newVS = new VectorSource({ });
	newVS.addFeature(feature);

	return [
	transmitterPointsLayer(filename, feature),
	new VectorLayer( {
		 source: newVS,
		style: function (feature) {
    const label = feature.get('name');
    labelStyle.getText().setText(label);
    return labelStyle;
  }  } ),

	new VectorLayer( {
		 source: newVS,
		style: transmitterSourceStyle  } )


	]
		 }






const map = new Map({
controls: defaultControls().extend([new RotateNorthControl(), new MapOnControl(), new TransmitterControl()]),

  layers: []

  ,
  target: 'map',
  view: view,
});

map.on("click", function(e) {
	var processed = false;
    map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        if (!processed && feature.get("filename")) {
		processed = true;
		if (currentTransmitterPointsLayers == null) {
			currentTransmitterPointsLayers = transmitterPointsLayers( feature.get("filename"), feature )
			addLayers(currentTransmitterPointsLayers);
			
			
			var element = document.getElementById("transmitter"); 
			if( element.innerHTML == "Cell") {
				removeLayers(transmitterCellLayers);
			}
			if( element.innerHTML == "Wifi") {
				removeLayers(transmitterWifiLayers);
			}
			console.log("viewing "+ feature.get("name"));
		}
		else {
			removeLayers(currentTransmitterPointsLayers);
			
			var element = document.getElementById("transmitter"); 
			if( element.innerHTML == "Cell") {
				addLayers(transmitterCellLayers);
			}

			if( element.innerHTML == "Wifi") {
				addLayers(transmitterWifiLayers);
			}
		        currentTransmitterPointsLayers = null;

			console.log("back to wifi view");
		}
	}
    });
});


const geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

the_map = map;

function el(id) {
  return document.getElementById(id);
}

geolocation.setTracking(true);

// handle geolocation error.
geolocation.on('error', function (error) {
  console.log(  error.message );
});

const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  })
);

var mapSet = false;

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  //positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  if( !mapSet) {
  //map.getView().setCenter( coordinates ) ;
  map.getView().setZoom(15);
   mapSet = true;
}
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [/*accuracyFeature, */positionFeature],
  }),
});

