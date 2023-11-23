(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict

    function transectSACC(){

      var _transectSACCObject={};

      var drawControl='';
      var info = L.control({'position':'bottomleft'});

      var _div='';

      var texts = {
        'draw_start':'Clica al mapa per a començar a dibuixar el transecte',
        'draw_ended':'Has acabat de dibuixar l\'itinerari',
        'continuous_transect': 'Transecte continu',
        'errors': {'invalid_shape': 'El transecte no té el format correcte'}
      };


      var styles = {
        'transect': {
          "color": "#f0982a",
          "weight": 2,
          "opacity": 0.8
        }
      };

      var events={};

      var settings = {
        default_color: '#f0982a'
      };

      _transectSACCObject.init= function(){

        return _transectSACCObject;

      };


      _transectSACCObject.initDraw = function(){

        return _transectSACCObject;

      };

      _transectSACCObject.setStyle = function(_type, style){

        return _transectSACCObject.styles[_type] = style;

      };

      _transectSACCObject.setDrawControl = function(draw_cont){

        drawControl=draw_cont;
        info.addTo(map);

      };

      _transectSACCObject.setCompleted = function(){

        return true;

      }

      _transectSACCObject.getError = function(error_code){

        if(texts.errors[error_code]) return texts.errors[error_code];
        else error_code;

      }


      _transectSACCObject.bindEvent = function(event_name,event_function){

        events[event_name]=event_function;

      }


      _transectSACCObject.addGeoJSONDrawGeometry = function (geometry, _type, editable, editableLayers){

          var layer=L.geoJson(geometry, {style: styles['transect'] });
          layer.addTo(map);
          map.fitBounds(layer.getBounds());

      }



      _transectSACCObject.addGeoJSONLayerGeometry = function (geometry, _type, data, layer_style, show_click){

        var layer=L.geoJson(geometry, {style: styles['transect'] });
        layer.addTo(map);
        map.fitBounds(layer.getBounds());

      };


      _transectSACCObject.addLayerPoint = function(coords, _type, data, style, show_click){

        var point = L.circle(coords, style);
        point.options['id']='obs_'+data['id'];

        return point;

      };


      _transectSACCObject.clearDrawing = function(){


      };


      _transectSACCObject.clear = function (){

        _transectSACCObject.clearSectionLimits();

      };


      _transectSACCObject.startDrawing = function(){


      };


      _transectSACCObject.deletedFeatures = function(){


      };


      _transectSACCObject.setDrawPreHooks = function(){

        L.drawLocal.draw.handlers.polyline.tooltip.start = 'Clica per a començar a dibuixar un transecte';
        L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Clica sobre l\'últim punt per finalitzar el transecte';

      };


      _transectSACCObject.getDrawConfig = function(){

        return {
          polyline: {
               shapeOptions: {
                   color: settings.default_color,
                   weight: 2
               }
           },
            polygon: false,
            circle: false,
            rectangle: false,
            marker: false,
            circlemarker: false,
        };


      };



      _transectSACCObject.isDrawFinished = function (){

        return true;

      };

      _transectSACCObject.isValid = function (data, _type){

       if(data.type=='FeatureCollection' || data.type=='Feature'){

         return true;

       }
       else{

         return false;

       }


     };


     _transectSACCObject.bindDrawEvents = function (editableLayers, update){


       /* On geometry finished */
       map.on(L.Draw.Event.CREATED, function (e) {
           var type = e.layerType,
               layer = e.layer;

          editableLayers.addLayer(layer);

          events['update_transect'](editableLayers.toGeoJSON());

          update(editableLayers)

       });


       map.on(L.Draw.Event.DRAWSTOP, function (e) {

         _transectSACCObject.clearDrawing();

       });

       map.on(L.Draw.Event.EDITSTOP, function (e) {

         events['update_transect']({});
         update(editableLayers)

       });


       map.on(L.Draw.Event.DELETED, function (e) {

         _transectSACCObject.deletedFeatures();
         events['update_transect']({});

         info.update();

       });

       map.on(L.Draw.Event.DRAWSTART, function (e) {

         events['update_transect']('{}');

         new_drawing=_transectSACCObject.startDrawing();

         if(new_drawing){

            editableLayers.eachLayer(function(layer) { editableLayers.removeLayer(layer);});
         }

         update(editableLayers)

       });


     };



      _transectSACCObject.showRemove = function (){

        return false;

      };

      _transectSACCObject.showEdit = function (){

        return true;

      };



      // Info window for section creation
      info.onAdd = function (map) {
        var container = L.DomUtil.create('div', 'section_info'); // create a div with a class "info"
        this._div = L.DomUtil.create('div', 'info', container );
        this.cb = L.DomUtil.create('div', 'cb', container );
        this.cb.innerHTML = '<form><input id="continuous_transect" type="checkbox" checked/>'+texts['continuous_transect']+'</form>';

        this.update();
        return container;
      };

      // method that we will use to update the control based on feature properties passed
      info.update = function () {


      };

      return _transectSACCObject;


    }

    if(typeof(window.SACCTransect) === 'undefined'){
      window.SACCTransect = transectSACC();
    }

})(window);
