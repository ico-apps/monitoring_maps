
(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict

    function plataformesCensus(){

      var _plataformesObject={};

      var obs_point='';
      var nest_precise_location = '';
      var nesting_area = '';

      var drawControl='';

      var _div='';
      var mode='';
      var site_visibility=[];

      var info = L.control({'position':'bottomright'});

      var settings = {
        default_color: '#869D96'
      };

      var texts = {
        'errors': {'invalid_shape': 'La localització del niu no té el format correcte. Ha de ser un punt o un polígon.'}
      };



      var events={};

      var available_modes = {
        'obs_point' : 'Survey observation point creation',
        'site_location' : 'Monitoring site location creation or modication',
        'observations_map' : 'Plataformes observations distribution map',
        'sites_distribution' : 'Plataformes sites distribution map'
      };

      var styles = {
        'obs_point': {},
        'nesting_area':{
          "color": "#869D96",
          "weight": 3,
          "fillOpacity": 0.45,
        },
        'site_location' : {
          "color": "#869D96",
          "weight": 3,
          "fillOpacity": 0.45,
        },
      };


      _plataformesObject.init = function(mode){

        //TODO: decide if necessary
        //if(!available_modes[mode]) alert('Wrong init mode');

        this.mode=mode;

        return _plataformesObject;


      };

      _plataformesObject.initDraw = function(mode){

        if(!available_modes[mode]) alert('Wrong init mode');

        this.mode=mode;

        return _plataformesObject;


      };


      _plataformesObject.setStyle = function(_type, style){

        styles[_type] = style;

      };

      _plataformesObject.getError = function(error_code){

        if(texts.errors[error_code]) return texts.errors[error_code];
        else error_code;

      }


      _plataformesObject.bindEvent = function(event_name,event_function){

        events[event_name]=event_function;

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
                      html: 'N',
                      className: 'plataformes-precise-nest',
                      iconAnchor: [12, 12]
                      })
                    }
                  ),
                  title: 'Localització exacta'
                  },
                  {
                  enabled: true,
                  handler: new L.Draw.Polygon(map,  { allowIntersection: false, showArea: true, metric: ['km', 'm'], repeatMode: false, shapeOptions:
                  styles['site_location'] }),
                  title: 'Localització per determinar'
                  }
              ];
              }
          });
      }




    };


      _plataformesObject.setPreciseNest = function (layer){

        if(nest_precise_location) map.removeLayer(nest_precise_location);
        if(nesting_area) map.removeLayer(nesting_area);
        nest_precise_location=layer;

      };

      _plataformesObject.setNestingArea = function (layer){

        if(nest_precise_location) map.removeLayer(nest_precise_location);
        if(nesting_area) map.removeLayer(nesting_area);
        nesting_area=layer;

      };

      _plataformesObject.setNestingArea = function (layer){

        if(nest_precise_location) map.removeLayer(nest_precise_location);
        if(nesting_area) map.removeLayer(nesting_area);
        nesting_area=layer;

      };


      _plataformesObject.bindDrawEvents = function (editableLayers, update){

        // Set observer point
        if(this.mode=='obs_point'){


          /* On geometry finished */
          map.on(L.Draw.Event.CREATED, function (e) {
              var type = e.layerType,
                  layer = e.layer;

                editableLayers.eachLayer(function(layer) { editableLayers.removeLayer(layer);});

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

          /* Set nest location */
          map.on(L.Draw.Event.CREATED, function (e) {
              var type = e.layerType,
                  layer = e.layer;

                editableLayers.eachLayer(function(layer) { editableLayers.removeLayer(layer);});
                _plataformesObject.clearNestLocation();

                if (type === 'marker' && layer.options.icon.options.className=='plataformes-precise-nest') {

                _plataformesObject.setPreciseNest(layer);

                }
                else if (type === 'polygon' ) {

                  _plataformesObject.setNestingArea(layer);

                }

                editableLayers.addLayer(layer);
                update(editableLayers);

                info.update();

                events['update_site_location'](editableLayers.toGeoJSON()['features'][0]);


          });


          map.on(L.Draw.Event.DELETED, function (e) {

            e.layers.eachLayer(function (layer) {
                //do whatever you want; most likely save back to db

                _plataformesObject.clearObsPoint();
                _plataformesObject.clearNestLocation();

            });
            //info.update();
            events['update_site_location']({});

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


    _plataformesObject.isValid = function (feature, _type){

        return feature.type=='Feature' && (feature.geometry.type=='Polygon' ||
        feature.geometry.type=='Point');

     };

     _plataformesObject.isDrawFinished = function (){

      return nest_precise_location || nesting_area;

     };


     _plataformesObject.addPoint = function (point, data, _type, editableLayers){

       if(_type=='obs_point'){

         var marker = new L.Marker(point, {icon: L.divIcon({
           html: '<i class="fa fa-eye fa-2x" style="color: black"></i>',
           iconSize: [30, 30],
           className: 'obs_point'
           })
         });

         marker.addTo(map);
         editableLayers.addLayer(marker);

       }
       else{

         var marker = new L.Marker(point);


       }

      info.update();

      return marker;

     };

     _plataformesObject.addLayerPoint = function(coords, _type, data, style, show_click){

      if(_type=='nest_precise'){

        var point = new L.Marker(coords, {icon: L.divIcon({
          html: 'N',
          className: 'plataformes-precise-nest'
          })
        });

      }
      else if(_type =='nest_precise_state'){

        //Used in monitoring site map
        var point = L.circle(coords, style);

      }
      else if(_type =='observations_map'){

        var point = L.circle(coords, style);
        point.options['id']='obs_'+data['id'];

      }
      else if(_type =='obs_point'){

        var point = new L.Marker(coords, {icon: L.divIcon({
          html: '<i class="fa fa-eye fa-2x" style="color: black"></i>',
          iconSize: [30, 30],
          className: 'obs_point'
          })
        });

      }

      return point;

    };


    _plataformesObject.addGeoJSONLayerGeometry = function (geometry, _type, data, layer_style, show_click){

      if(_type=='nest_precise'){

        var coordinates = geometry['geometry']['coordinates'];

        var layer = new L.Marker([coordinates[1],coordinates[0]], {icon: L.divIcon({
          html: 'N',
          className: 'plataformes-precise-nest',
          iconAnchor: [12, 12]
          })
        });


      }
      else if(_type=='nesting_area'){

        var layer=L.geoJson(geometry, {style: layer_style});

      }

      return layer;

    };


    _plataformesObject.addGeoJSONDrawGeometry = function (geometry, _type, editable, editableLayers){

      if(_type=='nest_precise'){

        var coordinates = geometry['geometry']['coordinates'];


        var marker = new L.Marker([coordinates[1],coordinates[0]], {icon: L.divIcon({
          html: 'N',
          className: 'plataformes-precise-nest',
          iconAnchor: [12, 12]
          })
        });

        marker.addTo(map);
        map.setView([coordinates[1],coordinates[0]], 18);
        if(editable) editableLayers.addLayer(marker);

        _plataformesObject.setPreciseNest(marker);

      }
      else if(_type=='nesting_area'){

        var layer=L.geoJson(geometry, {style: styles[_type]});
        layer.addTo(map);
        map.fitBounds(layer.getBounds());

        if(editable) editableLayers.addLayer(layer);

        _plataformesObject.setNestingArea(layer);

      }
      else if(_type=='obs_point'){

        var coordinates = geometry['geometry']['coordinates'];

        var marker = new L.Marker(point, {icon: L.divIcon({
          html: '<i class="fa fa-eye fa-2x" style="color: black"></i>',
          iconSize: [30, 30],
          className: 'obs_point'
          })
        });

        marker.addTo(map);
        //map.setView([coordinates[1],coordinates[0]], 18);
        editableLayers.addLayer(marker);


      }


    }


    _plataformesObject.clearObsPoint = function (){

       obs_point='';
       info.update();

    };

     _plataformesObject.clearNestLocation = function (){

      nest_precise_location = '';
      nesting_area = '';


     };

     _plataformesObject.clear = function (){

       if(mode=='obs_point') this.clearObsPoint();
       else this.clearNestLocation();

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
        else{

          if(nest_precise_location) this._div.innerHTML = '<span class="leaflet-marker-icon plataformes-precise-nest mt-1 ml-1">N</span>  &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;Localització precisa';
          if(nesting_area) this._div.innerHTML = '<i class="fa fa-draw-polygon fa-2x" style="color: #869D96;"></i> Localització per determinar';

        }

     };

      return _plataformesObject;


    }


    if(typeof(window.PlataformesSurvey) === 'undefined'){
      window.PlataformesSurvey = plataformesCensus();
    }


  })(window); // We send the window variable withing our function
