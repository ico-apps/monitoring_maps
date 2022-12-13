(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict


    function raptorCensus(){

      var _raptorCensusObject={};

      var obs_point='';
      var obs_zone=[];

      var observations=[];

      var drawControl='';
      var info = L.control({'position':'bottomleft'});

      var _div='';
      var mode='';
      var site_square='';
      var site_visibility=[];

      var texts = {
        'draw_start':'Clica al mapa per a començar a dibuixar el transecte',
        'draw_ended':'Has acabat de dibuixar l\'itinerari',
        'draw_section':'Dibuixant la secció ',
        'continuous_transect': 'Transecte continu',
        'last_section_point': '<b>Final de la secció </b>',
        'start_section_point': '<b>Inici de la secció </b>',
        'errors': {'invalid_shape': 'El transecte no té el format correcte. Necessites 6 seccions formades per línies amb el camp section o seccio'}
      };

      var info = L.control({'position':'bottomright'});


      var settings = {
        default_color: '#f0982a'
      };

      var styles = {
        'square': {
          color: "#0056b3",
          fillColor: "#0056b3",
          fillOpacity: 0,
          radius: 90.0
        },
        'visibility':{

        },
        'obs_point':{

        }
      };

      var events={};

      _raptorCensusObject.init = function(mode){

        this.mode=mode;

        return _raptorCensusObject;


      };

      _raptorCensusObject.setStyle = function(_type, style){

        styles[_type] = style;

      };

      _raptorCensusObject.getError = function(error_code){

        if(texts.errors[error_code]) return texts.errors[error_code];
        else error_code;

      }


      _raptorCensusObject.bindEvent = function(event_name,event_function){

        events[event_name]=event_function;

      }

      _raptorCensusObject.setBounds = function(bounds,mode){

        if(mode=='square') site_square=bounds;
        else if(mode=='visibility') site_visibility.push(bounds);

      }

      _raptorCensusObject.activate = function(bounds){

        $('.leaflet-draw-draw-marker').show();

      }

      _raptorCensusObject.deactivate = function(bounds){

        $('.leaflet-draw-draw-marker').hide();

      }



        _raptorCensusObject.getDrawConfig = function(){


          if(this.mode=='observations'){

            return {
                marker: true
            };

          }
          else{

            return {
                polyline: false,
                polygon: true,
                circle: false,
                rectangle: false,
                marker: true,
                circlemarker: false,
            };

          }




        };


        _raptorCensusObject.setDrawPreHooks = function(){


          if(this.mode=='observations'){

            L.DrawToolbar.include({
               getModeHandlers: function(map) {
                 return [
                   {
                     enabled: true,
                     handler: new L.Draw.Marker(map, {icon: L.divIcon({
                         className: 'rapis-custom-icon-3',
                         html: "",
                         iconAnchor: [15, 15]
                     })}),
                     title: 'Afegeix observació'
                   }
                 ];
               }
             });


          }
          else{

            L.DrawToolbar.include({
               getModeHandlers: function(map) {
                 return [
                   {
                     enabled: true,
                     handler:
                      new L.Draw.Marker(map, {icon: L.divIcon({
                        html: '<i class="fa fa-eye fa-2x" style="color: black"></i>',
                        iconSize: [30, 30],
                        className: 'obs_point'
                      })
                        }
                      ),
                    title: 'Punt d\'observació'
                   },
                   {
                     enabled: true,
                     handler: new L.Draw.Polygon(map,  { allowIntersection: false, showArea: true, metric: ['km', 'm'], repeatMode: false, shapeOptions: {
                         "color": "#FF3636",
                         "weight": 3,
                         "fillOpacity": 0.45,
                     } }),
                     title: 'Zona d\'Observació'
                   }
                 ];
               }
             });




          }


        };


        _raptorCensusObject.setObsPoint = function (layer){

            if(obs_point) map.removeLayer(obs_point);
            obs_point=layer;

        };

          _raptorCensusObject.setObsZone = function (layer){

              obs_zone.push(layer);

          };

          _raptorCensusObject.removeObsPoint = function (layer){

              obs_point='';

          };

            _raptorCensusObject.removeObsZone = function (layer){

              /* Cutre approach because we don't remove the correct layer.
               But we don't need the exacte layer */
                obs_zone.pop();

            };

          _raptorCensusObject.setObservation = function (layer){

              observations.push(layer);

          };

          _raptorCensusObject.removeLayer  = function (layer_id){

              if(this.mode=='observations'){

                  var layer=observations[layer_id];
                  observations.splice(layer_id, 1);
                  info.update();
                  return layer;

              }

          };


          _raptorCensusObject.intersectsVisibility = function (point){

            var intersects=false;

            site_visibility.forEach(function (layer, index) {

              if(_raptorCensusObject.isMarkerInsidePolygon(point, layer)) intersects=true;

            });

            return intersects;

          };



        _raptorCensusObject.isMarkerInsidePolygon= function (marker, poly) {

            var poly_ob = turf.polygon([poly.toGeoJSON()['features'][0]['geometry']['coordinates'][0]]);
            return turf.booleanPointInPolygon(marker.toGeoJSON(), poly_ob);

          };

         _raptorCensusObject.bindDrawEvents = function (editableLayers, update){

            if(this.mode=='observations'){


              /* On geometry finished */
              map.on(L.Draw.Event.CREATED, function (e) {
                  var type = e.layerType,
                      layer = e.layer;

                   _raptorCensusObject.setObservation(layer);

                   layer['options']['icon']['options']['html']=observations.length;

                   //obs_location_conv={'Fora de quadrat':'1', 'Fora de l\'àrea visible':'2', 'Dins de l\'àrea visible':'3'}
                   //TODO: when location_shape add case 2
                   var inside_square=0;

                   if(_raptorCensusObject.isMarkerInsidePolygon(layer,site_square)){

                     if(_raptorCensusObject.intersectsVisibility(layer)) inside_square = 3;
                     else inside_square=2;

                   }
                   else inside_square=1;

                   layer['options']['icon']['options']['className']='rapis-custom-icon-'+inside_square;

                   events['observation_create'](layer._latlng,inside_square, observations.length);

                   info.update();
                   editableLayers.addLayer(layer);

                   update(editableLayers)
              });

              map.on(L.Draw.Event.DELETED, function (e) {

                info.update();

              });


            }
            else{

              /* On geometry finished */
              map.on(L.Draw.Event.CREATED, function (e) {
                  var type = e.layerType,
                      layer = e.layer;

                  if (type === 'marker' && layer.options.icon.options.className=='obs_point') {

                    _raptorCensusObject.setObsPoint(layer);

                   }
                   else if (type === 'polygon' ) {

                     _raptorCensusObject.setObsZone(layer);

                   }

                   events['update_survey_location'](obs_point!='',obs_zone.length > 0);

                   editableLayers.addLayer(layer);
                   update(editableLayers)
              });


              map.on(L.Draw.Event.DELETED, function (e) {

                e.layers.eachLayer(function (layer) {
                    //do whatever you want; most likely save back to db
                    //
                    if(layer['editing']._marker!=null) _raptorCensusObject.removeObsPoint('');
                    if(layer['editing']._poly!=null) _raptorCensusObject.removeObsZone();

                });
                //info.update();
                events['update_survey_location'](obs_point!='',obs_zone.length > 0);

              });



            }



           };


        _raptorCensusObject.setDrawControl = function(draw_cont){

          drawControl=draw_cont;
          info.addTo(map);

        };

        _raptorCensusObject.showRemove = function (){

          if(this.mode=='observations') return false;
          else return true;

        };

        _raptorCensusObject.showEdit = function (){

          if(this.mode=='observations') return false;
          else return true;

        };


      _raptorCensusObject.isValid = function (feature, _type){

          //TODO: need to check
          return true;

     };

     _raptorCensusObject.isFinished = function (){

       return obs_point && obs_zone.length > 0;

     };


     _raptorCensusObject.addPoint = function (point, data, _type){

       //return obs_point && obs_zone;

       var marker = new L.Marker(point, {icon: L.divIcon({
         html: '<i class="fa fa-eye fa-2x" style="color: black"></i>',
         iconSize: [30, 30],
         className: 'rapis-custom-icon-'+data['obs_location']
       })});


       marker['options']['icon']['options']['html']=data['order'];

       this.setObservation(marker);
       info.update();


        return marker;

     };


     _raptorCensusObject.addGeoJSONGeometry = function (geometry, _type, editable, editableLayers){

      if(_type=='square'){

        var layer=L.geoJson(geometry, {style: styles[_type]});
        layer.addTo(map);

        _raptorCensusObject.setBounds(layer, _type);

        map.fitBounds(layer.getBounds());

      }
      else if(_type=='visibility') {

        if(geometry.type=='MultiPolygon'){

          geometry['coordinates'].forEach(function (feature, index) {

            var new_feature={type: "Feature", geometry: {type: "Polygon", coordinates: feature }};

            var layer=L.geoJson(new_feature, {style: styles[_type] });
            layer.addTo(map);
            map.fitBounds(layer.getBounds());
            _raptorCensusObject.setBounds(layer, _type);

          });

        }
        else{

          var layer=L.geoJson(geometry, {style: styles[_type] });
          layer.addTo(map);
          map.fitBounds(layer.getBounds());
          _raptorCensusObject.setBounds(layer, _type);

        }

      }
      else if(_type=='obs_point') {

        var circle = L.circle([geometry['coordinates'][1],geometry['coordinates'][0]], styles[_type]);
        circle.addTo(map);

      }

    }



     _raptorCensusObject.clearObservations = function (){

       observations=[];
       info.update();

     };

     _raptorCensusObject.clearSurveyLocation = function (){

       obs_point='';
       obs_zone=[];

     };

     _raptorCensusObject.clear = function (){

       if(mode=='observations') this.clearObservations();
       else this.clearSurveyLocation();

     };



     info.onAdd = function (map) {
       var container = L.DomUtil.create('div', 'section_info'); // create a div with a class "info"
       this._div = L.DomUtil.create('div', 'info', container );
       this.cb = L.DomUtil.create('div', 'cb', container );
       this.cb.innerHTML = '';
       this.update();
       return container;
     };

     // method that we will use to update the control based on feature properties passed
     info.update = function () {

        if(_raptorCensusObject.mode=='observations'){

          var obs_count=observations.length;
          this._div.innerHTML = '<i class="fas fa-map-marker-alt"  style="color:#FF3636;"></i> Observacions ['+obs_count+']';

        }

     };

      return _raptorCensusObject;


    }


  if(typeof(window.RaptorSurvey) === 'undefined'){
    window.RaptorSurvey = raptorCensus();
  }


})(window);
