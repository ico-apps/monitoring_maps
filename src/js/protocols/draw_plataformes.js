
(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict

    function plataformesCensus(){

      var _plataformesObject={};

      var obs_point='';
      var obs_zone=[];

      var drawControl='';

      var _div='';
      var mode='';
      var site_visibility=[];

      var info = L.control({'position':'bottomright'});

      var settings = {
        default_color: '#f0982a'
      };

      var events={};

      _plataformesObject.init = function(mode){

        this.mode=mode;

        return _plataformesObject;


      };


      _plataformesObject.getError = function(error_code){

        if(texts.errors[error_code]) return texts.errors[error_code];
        else error_code;

      }


      _plataformesObject.bindEvent = function(event_name,event_function){

        events[event_name]=event_function;

      }


      _plataformesObject.activate = function(bounds){

        $('.leaflet-draw-draw-marker').show();

      }

      _plataformesObject.deactivate = function(bounds){

        $('.leaflet-draw-draw-marker').hide();

      }



        _plataformesObject.getDrawConfig = function(){


          if(this.mode=='obs_point'){

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


        _plataformesObject.setDrawPreHooks = function(){



          if(this.mode=='obs_point'){

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
                      title: 'Localització exacta'
                      },
                      {
                      enabled: true,
                      handler: new L.Draw.Polygon(map,  { allowIntersection: false, showArea: true, metric: ['km', 'm'], repeatMode: false, shapeOptions: {
                          "color": "#FF3636",
                          "weight": 3,
                          "fillOpacity": 0.45,
                      } }),
                      title: 'Localització no precisa'
                      }
                  ];
                  }
              });
          }




        };


          _plataformesObject.setObsZone = function (layer){

              obs_zone.push(layer);

          };

          _plataformesObject.setObsPoint = function (layer){

            if(obs_point) map.removeLayer(obs_point);
            obs_point=layer;

          };

          _plataformesObject.removeObsZone = function (layer){

          /* Cutre approach because we don't remove the correct layer.
              But we don't need the exacte layer */
              obs_zone.pop();

          };


        _plataformesObject.isMarkerInsidePolygon= function (marker, poly) {

            var poly_ob = turf.polygon([poly.toGeoJSON()['features'][0]['geometry']['coordinates'][0]]);
            return turf.booleanPointInPolygon(marker.toGeoJSON(), poly_ob);

          };

         _plataformesObject.bindDrawEvents = function (editableLayers, update){

            if(this.mode=='obs_point'){


              /* On geometry finished */
              map.on(L.Draw.Event.CREATED, function (e) {
                  var type = e.layerType,
                      layer = e.layer;

                  _plataformesObject.setObsPoint(layer);

                   events['obs_point_create'](layer._latlng);

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

                    _plataformesObject.setObsPoint(layer);

                   }
                   else if (type === 'polygon' ) {

                     _plataformesObject.setObsZone(layer);

                   }

                   editableLayers.addLayer(layer);
                   update(editableLayers);

                   events['update_survey_location'](obs_point!='',obs_zone.length > 0);


              });


              map.on(L.Draw.Event.DELETED, function (e) {

                e.layers.eachLayer(function (layer) {
                    //do whatever you want; most likely save back to db
                    //
                    if(layer['editing']._marker!=null) _plataformesObject.removeObsPoint('');
                    if(layer['editing']._poly!=null) _plataformesObject.removeObsZone();

                });
                //info.update();
                events['update_survey_location'](obs_point!='',obs_zone.length > 0);

              });



            }



           };


        _plataformesObject.setDrawControl = function(draw_cont){

          drawControl=draw_cont;
          info.addTo(map);

        };

        _plataformesObject.showRemove = function (){

          if(this.mode=='obs_point') return false;
          else return true;

        };

        _plataformesObject.showEdit = function (){

          if(this.mode=='obs_point') return false;
          else return true;

        };


      _plataformesObject.isValid = function (feature){

          return feature.type=='Feature' && feature.geometry.type=='Polygon' &&
          feature.geometry.coordinates[0].length == 5;

     };

     _plataformesObject.isFinished = function (){

       return obs_point && obs_zone.length > 0;

     };


     _plataformesObject.addDrawGeometry = function (point, data, mode){

      var marker = new L.Marker(point, {icon: L.divIcon({
        html: '<i class="fa fa-eye fa-2x" style="color: black"></i>',
        iconSize: [30, 30],
        className: 'obs_point'
        })
        });

      this.setObsPoint(marker);
      info.update();

      return marker;

     };

     _plataformesObject.clearObservations = function (){

       observations=[];
       info.update();

     };

     _plataformesObject.clearSurveyLocation = function (){

       obs_point='';
       obs_zone=[];

     };

     _plataformesObject.clear = function (){

       if(mode=='obs_point') this.clearObservations();
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

        if(_plataformesObject.mode=='obs_point'){

          this._div.innerHTML = '<i class="fa fa-eye fa-2x" style="color: black"></i> Punt d\'observació';

        }

     };

      return _plataformesObject;


    }


    if(typeof(window.PlataformesSurvey) === 'undefined'){
      window.PlataformesSurvey = plataformesCensus();
    }


  })(window); // We send the window variable withing our function
