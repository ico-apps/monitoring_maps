
(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict';

    const metersToPixelsAtMaxZoom = (meters, zoom) => meters / (78271.484 / (2 ** zoom)) / Math.cos(41.118660 * Math.PI / 180);


    function layerManager(){

      var _layerManagerObject={};
      var info ='';
      var layers = {};
      var layer_controls='';
      var styles = {};
      var legend_values = [];
      var legend='';
      var point_selected = L.control({position: 'topright'});
      var click_point_content ='';

      var zoom_factor=[0,60,60,60,60,60,3500,2000,800,300,90,16,8,1,0.7,0.3,0.1,0.05,0.05,0.05,0.05,0.05,0.05];

      var collapsed_legend=false;

      _layerManagerObject.create = function(layer_id, style){

        layers[layer_id] = new L.FeatureGroup();
        styles[layer_id] = style;
        map.addLayer(layers[layer_id]);

      };

      _layerManagerObject.clearLayer = function(layer_id){

        if(layers[layer_id]!=null){

          map.removeControl(layers[layer_id]);

          layers[layer_id].eachLayer(function(layer) {
            map.removeLayer(layer);

          });

          delete layers[layer_id];
          legend_values=[];


        }


      };

      _layerManagerObject.clearFeatures = function(layer_id){

        if(layers[layer_id]!=null){

          layers[layer_id].eachLayer(function(layer) {
            map.removeLayer(layer);

          });

        }


      };

      _layerManagerObject.clearAllLayers = function(layer_id){

        $.each(layers,function(index,layer){
           map.removeLayer(layer);
        });

        map.removeControl(layer_controls);

        layers={};
        layer_controls='';

        map.removeControl(legend);

        legend='';
        legend_values=[];

      };

      _layerManagerObject.getPixelFromZoom = function(radius, zoom ){

        return metersToPixelsAtMaxZoom(zoom_factor[zoom]*radius, zoom);
      };


      _layerManagerObject.updateMarkersOnZoom = function(layer_id, radius, zoom ){

        if(layers[layer_id]){

          layers[layer_id].eachLayer(function(layer) {

              layer.setRadius(metersToPixelsAtMaxZoom(zoom_factor[zoom]*radius, zoom));

           });

        }

      };

      _layerManagerObject.hideLayer = function(layer_id){

        if(layers[layer_id]!=null){

          map.removeControl(layers[layer_id]);

          layers[layer_id].eachLayer(function(layer) {
            map.removeLayer(layer);

          });

        }

      };

      _layerManagerObject.getLayer = function(layer_id){

        if(layers[layer_id]!=null){

          return layers[layer_id];

        }

      };

      _layerManagerObject.showLayer = function(layer_id){

        if(layers[layer_id]!=null){

            map.addControl(layers[layer_id]);

            layers[layer_id].eachLayer(function(layer) {
              map.addLayer(layer);

            });

        }

      };

      _layerManagerObject.isLayerShown = function(layer_id){

        return map.hasLayer(layers[layer_id]);

      };

      _layerManagerObject.clearAllLayers = function(layer_id){

        $.each(layers,function(index,layer){
           map.removeLayer(layer);
        });

        map.removeControl(layer_controls);

        layers={};
        layer_controls='';

        map.removeControl(legend);

        legend='';
        legend_values=[];

      };


      _layerManagerObject.fitContent = function(layer_id){

          map.fitBounds(layers[layer_id].getBounds());

      };

      _layerManagerObject.setPointClickContent = function(click_content){

          click_point_content=click_content;

      };

      _layerManagerObject.getLayerMarkersCount = function(layer_id){

           return Object.keys(layers[layer_id]._layers).length;

         };


       _layerManagerObject.activateMaker = function(id){

         map.eachLayer(function (layer) {

           if(layer.options.id==id){

               map.setView(layer.getLatLng(), 14);

           }

         });

       };

      _layerManagerObject.addFeature = function(layer_id, feature){

        layers[layer_id].addLayer(feature);

      };


      _layerManagerObject.addTransect = function(layer_id, geometry,data){


                for (i = 1; i < 7; i++) {

                  var feature={};

                  feature['type']='Feature';
                  feature['geometry']={};

                  feature['geometry']['coordinates']=geometry['features'][i-1]['geometry']['coordinates'];
                  feature['geometry']['type']=geometry['features'][i-1]['geometry']['type'];

                  var style_soft = Object.assign({}, styles[layer_id]);
                  style_soft['opacity']=0.4;

                  if(i % 2==0) assigned_style=styles[layer_id];
                  else assigned_style=style_soft;

                  var layer=L.geoJson(feature, {style: assigned_style,
                      onEachFeature: function (feature, layer) {

                          var props = feature.properties = feature.properties || {};
                          props.section = i;

                      }
                  });

                  layer.on('click', function (e) {

                      data['section']=e.layer.feature.properties.section;
                      LayerManager.showPoint(data);

                  });

                  layers[layer_id].addLayer(layer);

                }

      };

      _layerManagerObject.addSquare = function(layer_id, geometry,data){

        assigned_style=styles[layer_id];

        var layer=L.geoJson(geometry, {style: assigned_style });
        layer.options['id']=data['id'];

        layer.on('click', function (e) {

            LayerManager.showPoint(data);

        });


        layers[layer_id].addLayer(layer);


      };

      _layerManagerObject.createRapisObsMarker = function(layer_id, coords, data){

          var obs_icon= L.divIcon(
            { className: 'rapis-custom-icon-'+data['obs_location'],
              html: data['order']
            });


          var circle =  L.marker(coords, {icon: obs_icon});

          layers[layer_id].addLayer(circle);

      };





      _layerManagerObject.createCircleMarker = function(layer_id, coords, data){

        var circle = L.circle(coords, styles[layer_id]);
        circle.options['id']='obs_'+data['id'];

        circle.on('click', function (e) {

            LayerManager.showPoint(data);

        });

        layers[layer_id].addLayer(circle);

      };


      _layerManagerObject.createDraggableMarker = function(layer_id, coords, data, drag_event){

        var circle = L.marker(coords, styles[layer_id]);

        circle.options['id']=data['id'];

        circle.on('dragend', drag_event);

        layers[layer_id].addLayer(circle);

      };

      _layerManagerObject.createGeoJsonPolygon = function(layer_id, geojson, data, show_click){

        var polygon = L.geoJSON(geojson, styles[layer_id]);

        if(show_click){

          polygon.on('click', function (e) {

              LayerManager.showPoint(data);

          });
          
        }
        /*circle.on('click', function (e) {

            LayerManager.showPoint(data);

        });*/

        layers[layer_id].addLayer(polygon);

      };

      _layerManagerObject.showPoint = function(data){

        point_selected.onAdd = function () {

           var div = L.DomUtil.create('div', 'legend filter');
           div.innerHTML = click_point_content(data);
           return div;

         };

        point_selected.addTo(map);

        $('.remove-filter').on('click', function() {

          point_selected.remove();

        });


      };

      _layerManagerObject.updateMarkerLocation = function(id, position, layer_id){


        layers[layer_id].eachLayer(function(layer) {

          console.log(layer.options.id);
          if( layer.options.id==id){

            layer.setLatLng(position, {
              draggable: 'true'
            });

          }
        });

      };

      _layerManagerObject.showControls = function(){

        if(layer_controls !='') map.removeControl(layer_controls);
        layer_controls=L.control.layers([],layers,{'collapsed':this.collapsed_legend}).addTo(map);

      };


      _layerManagerObject.setCollapsed = function(collapsed){

        this.collapsed_legend=collapsed;

      };


      _layerManagerObject.addLegendItem = function (text, value, shape, count){

          legend_values.push({'color':value, 'text':text, 'shape':shape, 'count':count});

      };


      _layerManagerObject.getLegendValues = function (){

          return legend_values;

      };


      _layerManagerObject.changeFeatureStyle = function (layer_id, value, style){

         layers[layer_id].eachLayer(function(layer) {
              if (layer.options.id == value) {
                  layer.setStyle(style);
              }
          });

      };


      _layerManagerObject.updateLegend = function (){

        if(legend!='') map.removeControl(legend);

        _layerManagerObject.createLegend();


      };

      _layerManagerObject.createLegend = function (){


        legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {

           var div = L.DomUtil.create('div', 'info legend');

            // loop through our density intervals and generate a label with a colored square for each interval
            for (var i = 0; i < legend_values.length; i++) {
                div.innerHTML += (' <i style="color:'+legend_values[i]['color']+';" class="fas '+legend_values[i]['shape']+'"></i> ') +legend_values[i]['text'] + ' ['+legend_values[i]['count']+'] <br>';
            }

          return div;
         };
        //
        legend.addTo(map);

      };

      return _layerManagerObject;


    }



    if(typeof(window.LayerManager) === 'undefined'){
      window.LayerManager = layerManager();
    }


  })(window); // We send the window variable withing our function
