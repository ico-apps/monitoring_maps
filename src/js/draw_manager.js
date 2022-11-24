
(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict';


  function monitoringDraw(){

    var _drawMonitoringSiteObject = {};

    var editableLayers = '';
    var geometry_manager = '';

    var project = '';
    var mode='';

    var drawControl ='';

    var settings = {
      default_color: '#f0982a',
      position: 'topright'
    };


    /**
     * Inits Leaflet draw library.
     * * When project='socc' we only allow to draw 6 lines (one per section)
     *
     * @param {string} project project slug {socc}
     */

    _drawMonitoringSiteObject.init = function(project, mode){

          console.log('Initing draw');

          this.project=project;

          editableLayers = new L.FeatureGroup();

          if(project=='socc'){

            geometry_manager=SOCCTransect.init();

          }
          else if(project=='rapis'){

            geometry_manager=RaptorSurvey.init(mode);

          }
          else if(project=='plataformes'){

            geometry_manager=PlataformesSurvey.init(mode);

          }

          map.addLayer(editableLayers);

          var options = {
              position: settings.position,
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


    _drawMonitoringSiteObject.destroy = function(){

      map.removeLayer(editableLayers);
      map.removeControl(drawControl);

      //Clear specific protocol objects
      geometry_manager.clear();

    };


    _drawMonitoringSiteObject.bindEvent = function(event_name, event_function){

        geometry_manager.bindEvent(event_name, event_function);

    };



    _drawMonitoringSiteObject.activate = function(){

        geometry_manager.activate();

    };



    _drawMonitoringSiteObject.deactivate = function(){

        geometry_manager.deactivate();

    };

    /**
     * Add the provided Leaflet layer to the map and draw libary and centers the map to the layer bounds
     *
     * @param {leaflet.layer} uploaded_layer uploaded layer
     */

    _drawMonitoringSiteObject.fitUploadedShapeBounds = function(){

      map.fitBounds(editableLayers.getBounds());
      geometry_manager.drawSectionLimits(editableLayers);
      geometry_manager.setCompleted();


    };

    _drawMonitoringSiteObject.isValidGeometry = function(geometry){

      return geometry_manager.isValid(geometry);

    };

    _drawMonitoringSiteObject.getError = function(error_type){

      return geometry_manager.getError(error_type);

    };

    _drawMonitoringSiteObject.setStyle = function(_type, style){

      return geometry_manager.setStyle(_type, style);

    };

    _drawMonitoringSiteObject.addGeoJSONGeometry = function(geometry, _type, result_handler){

      if(geometry_manager.isValid(geometry)){

        //editableLayers = new L.FeatureGroup();
        //geometry_manager=SOCCTransect.init();
        geometry_manager.addGeoJSONGeometry(geometry, _type, editableLayers);

      }
      else{

        if(result_handler) result_handler('error',geometry_manager.getError('invalid_shape'));
        else console.log({'error':geometry_manager.getError('invalid_shape')});

      }

    };

    _drawMonitoringSiteObject.addFeature = function (layer){

      editableLayers.addLayer(layer);

    }

    _drawMonitoringSiteObject.addPoint = function (geometry, data, _type){

        layer = geometry_manager.addPoint(geometry, data, _type);
        editableLayers.addLayer(layer);

    };


    /**
     * Returns a GeoJson object with the drawn or uploaded features
     *
     * @return {GeoJson} geo_json object
     */

    _drawMonitoringSiteObject.toGeoJSON = function(){

      return editableLayers.toGeoJSON();

    };


    _drawMonitoringSiteObject.objectToGeoJSON = function(mode){

      var features=editableLayers.toGeoJSON().features;

      if (this.project=='rapis') {

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

        console.log(features);

        var coordinates=[];

        features.forEach(function (feature, index) {


          if(feature.geometry.type=='Polygon') coordinates.push(feature.geometry.coordinates);

        });

        return {type: "Feature", geometry: {type: "Polygon", coordinates: coordinates[0] }};

      }
      else{

        return editableLayers.toGeoJSON();

      }


    };

    /**
     * Removes drawn or uploaded features on the map
     *
     */
    _drawMonitoringSiteObject.clearLayer = function(){

      geometry_manager.clear();
      editableLayers.eachLayer(function(layer) { editableLayers.removeLayer(layer);});

    };


    _drawMonitoringSiteObject.removeLayer = function(layer_id){

      var layer=geometry_manager.removeLayer(layer_id);
      editableLayers.removeLayer(layer);

    };


    /**
     * Checks if the features are finished regarding the project requirements
     *  @return true is all sections are completed when working with socc project
     */
    _drawMonitoringSiteObject.isFinished = function(){

      return geometry_manager.isFinished();

    };


    /**
     *  @return {number} number of features drawn or uploaded
     */
    _drawMonitoringSiteObject.getFeatureCount = function(){

      return editableLayers.toGeoJSON()['features'].length;

    };


    return _drawMonitoringSiteObject;

  }

  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.MonitoringDraw) === 'undefined'){
    window.MonitoringDraw = monitoringDraw();
  }


})(window); // We send the window variable withing our function
