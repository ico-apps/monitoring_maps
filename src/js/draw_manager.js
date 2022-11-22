
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

      if(this.project=='rapis') geometry_manager.clear();

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



    _drawMonitoringSiteObject.loadLocationShape = function( geometry, result_handler){

      this.loadGeometry(project, geometry, result_handler);

    };



    _drawMonitoringSiteObject.loadGeometry = function(project, geometry, result_handler){

      //console.log(geometry);

      if(geometry_manager.isValid(geometry)){

        //console.log('Valid geometry: '+project);

        if(project=='socc'){

            editableLayers = new L.FeatureGroup();
            geometry_manager=SOCCTransect.init();

            var style_draw = {
                "color": "#f0982a",
                "weight": 2,
                "opacity": 0.8
            };

            for (i = 1; i < 7; i++) {

              var feature={};

              feature['type']='Feature';
              feature['geometry']={};



              feature['geometry']['coordinates']=geometry['features'][i-1]['geometry']['coordinates'];
              feature['geometry']['type']=geometry['features'][i-1]['geometry']['type'];


              var layer=L.geoJson(feature, {style: style_draw,
                  onEachFeature: function (feature, layer) {

                      var props = feature.properties = feature.properties || {};
                      props.section = i;

                  }
              });

              editableLayers.addLayer(layer.getLayers()[0]);

            }


            editableLayers.addTo(map);

            map.fitBounds(editableLayers.getBounds());
            geometry_manager.drawSectionLimits(editableLayers);

          }
          else if (project=='rapis') {

            var layer=L.geoJson(geometry, {style: style_draw });
            layer.addTo(map);
            map.fitBounds(layer.getBounds());

          }

      }
      else{
        //console.log('Invalid geometry: '+project);

        result_handler('error',geometry_manager.getError('invalid_shape'));

      }


    };


    _drawMonitoringSiteObject.addFeature = function (layer){

      editableLayers.addLayer(layer);

    }


    _drawMonitoringSiteObject.addGeometry = function (geometry, data, mode){

      if (this.project=='rapis') {

        if(mode=='observations'){

          var layer=geometry_manager.addDrawGeometry(geometry, data, mode);

          editableLayers.addLayer(layer);

        }

      }
      else if(this.project=='plataformes'){

        if(mode=='site'){

          var layer=geometry_manager.addDrawGeometry(geometry, data, mode);
          editableLayers.addLayer(layer);

        }


      }

    }

    _drawMonitoringSiteObject.addGeoJSONGeometry = function (geometry, mode, style){

      if (this.project=='rapis') {

        if(mode=='square'){

          var layer=L.geoJson(geometry, {style: style });
          layer.addTo(map);
          geometry_manager.setBounds(layer, mode);

          map.fitBounds(layer.getBounds());


        }
        else if(mode=='visibility') {

          if(geometry.type=='MultiPolygon'){

            geometry['coordinates'].forEach(function (feature, index) {

              var new_feature={type: "Feature", geometry: {type: "Polygon", coordinates: feature }};

              var layer=L.geoJson(new_feature, {style: style });
              layer.addTo(map);
              geometry_manager.setBounds(layer, mode);

            });


          }
          else{

            var layer=L.geoJson(geometry, {style: style });
            layer.addTo(map);
            geometry_manager.setBounds(layer, mode);

          }

        }
        else if(mode=='obs_point') {

          var circle = L.circle([geometry['coordinates'][1],geometry['coordinates'][0]], style);
          circle.addTo(map);

        }


      }
      else if(this.project=='plataformes'){

        if(mode=='site'){

          var layer=L.geoJson(geometry, {style: style });
          layer.addTo(map);
          map.fitBounds(layer.getBounds());

        }

      }

    }

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

      if (this.project=='rapis') {

        geometry_manager.clearObservations();

      }
      else{

        geometry_manager.clearSectionLimits();

      }

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
