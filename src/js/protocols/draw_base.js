
(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict

    function baseCensus(){

      var _baseObject={};

      var nesting_area = ''; 

      var drawControl='';
      var site_location= '';

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
        'site_location' : 'Base site location creation or modication',
        'observations_map' : 'Base observations distribution map',
        'sites_distribution' : 'Base sites distribution map'
      };

      var styles = {
        'obs_point': {},
        'site_location' : {
          "color": "#869D96",
          "weight": 3,
          "fillOpacity": 0.45,
        },
      };


      _baseObject.init = function(mode){

        this.mode=mode;

        return _baseObject;


      };

      _baseObject.initDraw = function(mode){

        if(!available_modes[mode]) alert('Wrong init mode');

        this.mode=mode;

        return _baseObject;


      };


      _baseObject.setStyle = function(_type, style){

        styles[_type] = style;

      };

      _baseObject.getError = function(error_code){

        if(texts.errors[error_code]) return texts.errors[error_code];
        else error_code;

      }


      _baseObject.bindEvent = function(event_name,event_function){

        events[event_name]=event_function;

      }


    _baseObject.getDrawConfig = function(){

      return {
          marker: true
      };

    };


    _baseObject.setDrawPreHooks = function(){

      L.DrawToolbar.include({
          getModeHandlers: function(map) {
          return [
              {
              enabled: true,
              handler:
              new L.Draw.Marker(map,
              ),
              title: 'Site location'
              }
          ];
          }
      });

    };


      _baseObject.setSiteLocation = function (layer){

        if(site_location) map.removeLayer(site_location);
        site_location=layer;

      };

      
      _baseObject.bindDrawEvents = function (editableLayers, update){


        /* Set site location */
        map.on(L.Draw.Event.CREATED, function (e) {
            var type = e.layerType,
                layer = e.layer;

              editableLayers.eachLayer(function(layer) { editableLayers.removeLayer(layer);});
              
              _baseObject.clearSiteLocation();
              _baseObject.setSiteLocation(layer);

              editableLayers.addLayer(layer);
              update(editableLayers);

              info.update();

              events['update_site_location'](editableLayers.toGeoJSON()['features'][0]);


        });


        map.on(L.Draw.Event.DELETED, function (e) {

          e.layers.eachLayer(function (layer) {
              //do whatever you want; most likely save back to db
              _baseObject.clearSiteLocation();

          });
          //info.update();
          events['update_site_location']({});

        });

      };

      _baseObject.setDrawControl = function(draw_cont){

        drawControl=draw_cont;
        info.addTo(map);

      };

      _baseObject.showRemove = function (){

        return true;

      };

      _baseObject.showEdit = function (){

        return true;

      };


    _baseObject.isValid = function (feature, _type){

        return feature.type=='Feature' && feature.geometry.type=='Point';

     };

     _baseObject.isDrawFinished = function (){

      return site_location;

     };


     _baseObject.addPoint = function (point, data, _type, editableLayers){

         var marker = new L.Marker(point);
         marker.addTo(map);
         editableLayers.addLayer(marker);

        info.update();

        return marker;

     };

     _baseObject.addLayerPoint = function(coords, _type, data, style, show_click){

      if(_type=='site_location'){

        var point = new L.Marker(coords);

      }
      else if(_type =='observations_map'){

        var point = L.circle(coords, style);
        point.options['id']='obs_'+data['id'];

      }
      
      return point;

    };


    _baseObject.addGeoJSONLayerGeometry = function (geometry, _type, data, layer_style, show_click){

      
      var coordinates = geometry['geometry']['coordinates'];

      var layer = new L.Marker([coordinates[1],coordinates[0]]);

      return layer;

    };


    _baseObject.addGeoJSONDrawGeometry = function (geometry, _type, editable, editableLayers){

      
        var coordinates = geometry['geometry']['coordinates'];

        var marker = new L.Marker([coordinates[1],coordinates[0]]);

        marker.addTo(map);
        map.setView([coordinates[1],coordinates[0]], 18);

        if(editable) editableLayers.addLayer(marker);

        _baseObject.setSiteLocation(marker);

        marker.addTo(map);
        //map.setView([coordinates[1],coordinates[0]], 18);
        editableLayers.addLayer(marker);

    }



     _baseObject.clearSiteLocation = function (){

        site_location = '';

     };

     _baseObject.clear = function (){

       this.clearSiteLocation();

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

        this._div.innerHTML = '<i class="fa fa-map-marker" aria-hidden="true"></i>&nbsp;&nbsp;Site location';

     };

      return _baseObject;


    }


    if(typeof(window.BaseSurvey) === 'undefined'){
      window.BaseSurvey = baseCensus();
    }


  })(window); // We send the window variable withing our function
