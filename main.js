import Feature from 'ol/Feature.js';
import Geolocation from 'ol/Geolocation.js';
import Map from 'ol/Map.js';
import Point from 'ol/geom/Point.js';
import View from 'ol/View.js';
import {Circle as CircleStyle, Fill, Stroke, Style, Text} from 'ol/style.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import * as olColor from 'ol/color';


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


const vectorLayer = new VectorLayer({
  source: source,
  style: styleFunction,

});


const vectorLayerLabel = new VectorLayer({
  source: source,
  style: function (feature) {
    const label = feature.get('label');
    console.log(label);
    labelStyle.getText().setText(label);
    return labelStyle;
  },
  minZoom: 20,

});

const view = new View({
  center: [0, 0],
  zoom: 2,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
	vectorLayer,
        vectorLayerLabel,
  ],
  target: 'map',
  view: view,
});

const geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

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
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  if( !mapSet) {
  map.getView().setCenter( coordinates ) ;
  map.getView().setZoom(15);
   mapSet = true;
}
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
});

