
(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict';

  const metersToPixelsAtMaxZoom = (meters, zoom) => meters / (78271.484 / (2 ** zoom)) / Math.cos(41.118660 * Math.PI / 180);

  function monitoringDraw(){

    /* Default configs */

    var collapsed_legend=false;
    var point_selected = L.control({position: 'topright'});

    /* Layer manager objects */

    var layers = {}; /* Loaded layers */
    var styles = {}; /* Loaded layers styles */
    var legend_values = [];
    var legend='';
    var click_point_content ='';
    var zoom_factor=[0,60,60,60,60,60,3500,2000,800,300,90,16,8,1,0.7,0.3,0.1,0.05,0.05,0.05,0.05,0.05,0.05];

    /* Draw objects*/

    var _drawMonitoringSiteObject = {};

    var editableLayers = '';
    var geometry_manager = '';

    var project = '';
    var mode='';

    /* Map controls */

    var layer_controls='';
    var drawControl ='';


    /* ------------------ Layer manager methods -------------------- */

    _drawMonitoringSiteObject.init = function(project, mode){

      console.log('Initing layer manager');

      this.project=project;

      if(project=='socc'){

        geometry_manager=SOCCTransect.init();

      }
      else if(project=='segre'){

        geometry_manager=RaptorSurvey.init(mode);

      }
      else if(project=='plataformes'){

        geometry_manager=PlataformesSurvey.init(mode);

      }
      else if(project=='sacc'){

        geometry_manager=SACCTransect.init();

      }
      else if(project=='base'){

        geometry_manager=BaseSurvey.init(mode);

      }

    };

    _drawMonitoringSiteObject.createLayer = function(layer_id, style){

      layers[layer_id] = new L.FeatureGroup();
      styles[layer_id] = style;
      map.addLayer(layers[layer_id]);

    };

    _drawMonitoringSiteObject.addGeoJSONLayerGeometry = function(layer_id, geometry, _type, data, show_click, result_handler){

      //TODO: implement result_handler with validate geometry
      if(geometry_manager.isValid(geometry, _type) || true == true){

        // Default fallback
        if(_type==''){

          layer = L.geoJson(geometry, {style: styles[layer_id]});

        }
        else{

          layer = geometry_manager.addGeoJSONLayerGeometry(geometry, _type, data, styles[layer_id], show_click);

        }

        layers[layer_id].addLayer(layer);

        if(show_click){

          layer.on('click', function (e) {

            MonitoringDraw.showPoint(data);

          });

        }

      }
      else{

        if(result_handler) result_handler('error',geometry_manager.getError('invalid_shape'));
        else console.log({'error':geometry_manager.getError('invalid_shape')});

      }

    };



    _drawMonitoringSiteObject.addLayerPoint = function(layer_id, coords, _type ,data, show_click){

      point = geometry_manager.addLayerPoint(coords, _type, data, styles[layer_id], show_click);
      layers[layer_id].addLayer(point);


      if(show_click){

        point.on('click', function (e) {

          MonitoringDraw.showPoint(data);

        });

      }

      layers[layer_id].addLayer(point);

    };



    _drawMonitoringSiteObject.clearLayer = function(layer_id){

      if(layers[layer_id]!=null){

        map.removeControl(layers[layer_id]);

        layers[layer_id].eachLayer(function(layer) {
          map.removeLayer(layer);

        });

        delete layers[layer_id];
        legend_values=[];

      }


    };


    _drawMonitoringSiteObject.clearAllLayers = function(layer_id){

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

    /* Get number of features in @layer_id */
    _drawMonitoringSiteObject.getLayerMarkersCount = function(layer_id){

      return Object.keys(layers[layer_id]._layers).length;

    };

    /* Activate marker used in PECBMS project */
    _drawMonitoringSiteObject.activateMaker = function(id){

      map.eachLayer(function (layer) {

        if(layer.options.id==id){

            map.setView(layer.getLatLng(), 14);

        }

      });

    };


    /* Activate marker used in PECBMS project */
    _drawMonitoringSiteObject.selectFeature = function(id, code){

      var layer_group = L.featureGroup();
      var last_properties = '';

      map.eachLayer(function(layer){

        if(layer.feature){

          if(layer.feature.properties[id]==code){
            
            layer_group.addLayer(layer);
            last_properties = layer.feature.properties;
          }  
          

        }


      });

      if(layer_group.getLayers().length>0){

        map.fitBounds(layer_group.getBounds());

      }

      return last_properties;
     
    };
  

    /* Center map viewport to @layer_id bounds */
    _drawMonitoringSiteObject.fitLayerContent = function(layer_id){

      map.fitBounds(layers[layer_id].getBounds());

    };

    /* Set layer on click event */
    _drawMonitoringSiteObject.setPointClickContent = function(click_content){

      click_point_content=click_content;

    };


    /* On click point handler info message  */
    _drawMonitoringSiteObject.showPoint = function(data){

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

    /* Add feature to layer */
    _drawMonitoringSiteObject.addLayerFeature = function(layer_id, feature){

      layers[layer_id].addLayer(feature);

    };

    _drawMonitoringSiteObject.getPixelFromZoom = function(radius, zoom ){

      return metersToPixelsAtMaxZoom(zoom_factor[zoom]*radius, zoom);

    };


    _drawMonitoringSiteObject.updateMarkersOnZoom = function(layer_id, radius, zoom ){

      if(layers[layer_id]){

        layers[layer_id].eachLayer(function(layer) {

            layer.setRadius(metersToPixelsAtMaxZoom(zoom_factor[zoom]*radius, zoom));

         });

      }

    };

    _drawMonitoringSiteObject.hideLayer = function(layer_id){

      if(layers[layer_id]!=null){

        map.removeControl(layers[layer_id]);

        layers[layer_id].eachLayer(function(layer) {
          map.removeLayer(layer);

        });

      }

    };



    /* Show @layer_id layer UNUSED at this time */

    _drawMonitoringSiteObject.showLayer = function(layer_id){

      if(layers[layer_id]!=null){

          map.addControl(layers[layer_id]);

          layers[layer_id].eachLayer(function(layer) {
            map.addLayer(layer);

          });

      }

    };

    /* Return @layer_id layer UNUSED at this time */

    _drawMonitoringSiteObject.getLayer = function(layer_id){

      if(layers[layer_id]!=null){

        return layers[layer_id];

      }

    };

    /* Check if @layer_id is shown on map UNUSED at this time */


    _drawMonitoringSiteObject.isLayerShown = function(layer_id){

      return map.hasLayer(layers[layer_id]);

    };

    /* ------------------ Draw methods -------------------- */


    /**
     * Inits Leaflet draw library.
     * * When project='socc' we only allow to draw 6 lines (one per section)
     *
     * @param {string} project project slug {socc}
     */

    _drawMonitoringSiteObject.initDraw = function(project, mode){

          console.log('Initing draw');

          this.project=project;

          editableLayers = new L.FeatureGroup();

          if(project=='socc'){

            geometry_manager=SOCCTransect.init();

          }
          else if(project=='segre'){

            geometry_manager=RaptorSurvey.init(mode);

          }
          else if(project=='plataformes'){

            geometry_manager=PlataformesSurvey.init(mode);

          }
          else if(project=='sacc'){

            geometry_manager=SACCTransect.init();

          }
          else if(project=='base'){

            geometry_manager=BaseSurvey.init(mode);

          }

          map.addLayer(editableLayers);

          var options = {
              position: 'topright',
              draw: geometry_manager.getDrawConfig(),
              edit: {
                  featureGroup: editableLayers, //REQUIRED!!
                  remove: geometry_manager.showRemove(),
                  edit: geometry_manager.showEdit()
              }
          };

          geometry_manager.setDrawPreHooks();

          drawControl = new L.Control.Draw(options);
          map.addControl(drawControl);

          geometry_manager.setDrawControl(drawControl);
          geometry_manager.bindDrawEvents(editableLayers, function(setter) {editableLayers = setter});


    };



    _drawMonitoringSiteObject.bindEvent = function(event_name, event_function){

        geometry_manager.bindEvent(event_name, event_function);

    };



    _drawMonitoringSiteObject.activateDraw = function(){

      $('.leaflet-draw-draw-marker').show();

    };


    _drawMonitoringSiteObject.deactivateDraw = function(){

      $('.leaflet-draw-draw-marker').hide();

    };


    _drawMonitoringSiteObject.destroyDraw = function(){

      map.removeLayer(editableLayers);
      map.removeControl(drawControl);

      //Clear specific protocol objects
      geometry_manager.clear();

    };


   /**
     * Returns a GeoJson object with the drawn or uploaded features
     *
     * @return {GeoJson} geo_json object
     */

    _drawMonitoringSiteObject.drawToGeoJSON = function(){

      return editableLayers.toGeoJSON();

    };


   /**
     * Returns a GeoJson object from the provided object
     * TODO: need to move to protocol specific code
     *
     * @return {GeoJson} geo_json object
     */

    _drawMonitoringSiteObject.drawObjectToGeoJSON = function(mode){

      var features=editableLayers.toGeoJSON().features;

      if (this.project=='segre') {

        if(mode=='visibility'){

          var coordinates=[];

          features.forEach(function (feature, index) {

            if(feature.geometry.type=='Polygon') coordinates.push(feature.geometry.coordinates);

          });

          if(coordinates.length==1) return {type: "Feature", geometry: {type: "Polygon", coordinates: coordinates[0] }};
          else return {type: "Feature", geometry: {type: "MultiPolygon", coordinates: coordinates }};

        }
        else if (mode=='obs_point') {

          var obs_point='';

          features.forEach(function (feature, index) {

              if(feature.geometry.type=='Point') obs_point=feature;

          });

          return obs_point;

        }
        else return editableLayers.toGeoJSON();

      }
      else if(this.project=='plataformes') {

        var coordinates=[];

        features.forEach(function (feature, index) {

          geometry_type = feature.geometry.type;
          coordinates.push(feature.geometry.coordinates);

        });

        return {type: "Feature", geometry: {type: geometry_type, coordinates: coordinates[0] }};

      }
      else{

        return editableLayers.toGeoJSON();

      }


    };



    _drawMonitoringSiteObject.showMapControls = function(){

      if(layer_controls !='') map.removeControl(layer_controls);
      layer_controls=L.control.layers([],layers,{'collapsed':this.collapsed_legend}).addTo(map);

    };

    _drawMonitoringSiteObject.setCollapsedControls = function(collapsed){

      this.collapsed_legend=collapsed;

    };


    /* Selection methods */

    /* Allows to change @style for a concrete feature @value form @layer_id */
    _drawMonitoringSiteObject.changeFeatureStyle = function (layer_id, value, style){

      layers[layer_id].eachLayer(function(layer) {
           if (layer.options.id == value) {
               layer.setStyle(style);
           }
       });

    };


    _drawMonitoringSiteObject.updateMarkerLocation = function(id, position, layer_id){

      layers[layer_id].eachLayer(function(layer) {

        if( layer.options.id==id){

          layer.setLatLng(position, {
            draggable: 'true'
          });

        }

      });

    };

    _drawMonitoringSiteObject.createDraggableMarker = function(layer_id, coords, data, drag_event){

      var circle = L.marker(coords, styles[layer_id]);

      circle.options['id']=data['id'];

      circle.on('dragend', drag_event);

      layers[layer_id].addLayer(circle);

    };


    /*
     * Legend methods
     *
    */
    _drawMonitoringSiteObject.updateLegend = function (){

      if(legend!='') map.removeControl(legend);

      _drawMonitoringSiteObject.createLegend();


    };

    _drawMonitoringSiteObject.createLegend = function (){

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

    _drawMonitoringSiteObject.createLayerSelectorLegend = function (){

      legend = L.control({position: 'bottomright'});
      legend.onAdd = function (map) {

         var div = L.DomUtil.create('div', 'info legend selector');

          // loop through our density intervals and generate a label with a colored square for each interval
          for (var i = 0; i < legend_values.length; i++) {

              var legend_item = L.DomUtil.create('div');
              legend_item.setAttribute('id', legend_values[i]['text']);
              legend_item.innerHTML = ('<i style="color:'+legend_values[i]['color']+';" class="fas '+legend_values[i]['shape']+'"></i> ') +legend_values[i]['text'] + ' ['+legend_values[i]['count']+']';

              $(legend_item).on('click', function() {

                if ($(this).hasClass('inactive')) _drawMonitoringSiteObject.showLayer($(this).attr('id'));
                else _drawMonitoringSiteObject.hideLayer($(this).attr('id'));

                $(this).toggleClass('inactive');

              });

              div.appendChild(legend_item);

          }

        return div;
       };
      //
      legend.addTo(map);



    };

    /* Adds new legend item */
    _drawMonitoringSiteObject.addLegendItem = function (text, value, shape, count){

      legend_values.push({'color':value, 'text':text, 'shape':shape, 'count':count});

    };

    /* Unsued now */
    _drawMonitoringSiteObject.getLegendValues = function (){

      return legend_values;

    };



    /**
     * Add the provided Leaflet layer to the map and draw libary and centers the map to the layer bounds
     *
     * @param {leaflet.layer} uploaded_layer uploaded layer
     */

    _drawMonitoringSiteObject.fitUploadedShapeDrawBounds = function(){

      map.fitBounds(editableLayers.getBounds());
      geometry_manager.drawSectionLimits(editableLayers);
      geometry_manager.setCompleted();


    };

    _drawMonitoringSiteObject.isValidGeometry = function(geometry, _type){

      return geometry_manager.isValid(geometry, _type);

    };

    _drawMonitoringSiteObject.getError = function(error_type){

      return geometry_manager.getError(error_type);

    };

    _drawMonitoringSiteObject.setStyle = function(_type, style){

      return geometry_manager.setStyle(_type, style);

    };

    _drawMonitoringSiteObject.addGeoJSONDrawGeometry = function(geometry, _type, editable,  result_handler){

      if(geometry_manager.isValid(geometry, _type)){

        geometry_manager.addGeoJSONDrawGeometry(geometry, _type, editable, editableLayers);

      }
      else{

        if(result_handler) result_handler('error',geometry_manager.getError('invalid_shape'));
        else console.log({'error':geometry_manager.getError('invalid_shape')});

      }

    };

    // Add layer to editable
    _drawMonitoringSiteObject.addDrawFeature = function (layer, _type){

      editableLayers.addLayer(layer);

    }

    _drawMonitoringSiteObject.addPoint = function (geometry, data, _type){

        layer = geometry_manager.addPoint(geometry, data, _type, editableLayers);
        editableLayers.addLayer(layer);

    };

    /**
     * Removes drawn or uploaded features on the map
     *
     */
    _drawMonitoringSiteObject.clearDrawLayer = function(){

      geometry_manager.clear();
      editableLayers.eachLayer(function(layer) { editableLayers.removeLayer(layer);});

    };


    _drawMonitoringSiteObject.removeDrawLayer = function(layer_id){

      var layer=geometry_manager.removeLayer(layer_id);
      editableLayers.removeLayer(layer);

    };


    /**
     * Checks if the features are finished regarding the project requirements
     *  @return true is all sections are completed when working with socc project
     */
    _drawMonitoringSiteObject.isDrawFinished = function(){

      return geometry_manager.isDrawFinished();

    };


    /**
     *  @return {number} number of features drawn or uploaded
     */
    _drawMonitoringSiteObject.getDrawFeatureCount = function(){

      return editableLayers.toGeoJSON()['features'].length;

    };


    return _drawMonitoringSiteObject;

  }

  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.MonitoringDraw) === 'undefined'){
    window.MonitoringDraw = monitoringDraw();
  }


})(window); // We send the window variable withing our function
