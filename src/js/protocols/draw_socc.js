(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict

    function transectSOCC(){

      var _transectSOCCObject={};

      var sections=6;
      var current_section=0;
      var sectionMarkers = '';

      var drawControl='';
      var info = L.control({'position':'bottomleft'});

      var _div='';

      var texts = {
        'draw_start':'Clica al mapa per a començar a dibuixar el transecte',
        'draw_ended':'Has acabat de dibuixar l\'itinerari',
        'draw_section':'Dibuixant la secció ',
        'continuous_transect': 'Transecte continu',
        'last_section_point': '<b>Final de la secció </b>',
        'start_section_point': '<b>Inici de la secció </b>',
        'errors': {'invalid_shape': 'El transecte no té el format correcte. Necessites 6 seccions formades per línies amb el camp section o seccio'}
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

      _transectSOCCObject.init = function(){


        sectionMarkers = new L.FeatureGroup();
        map.addLayer(sectionMarkers);

        return _transectSOCCObject;


      };

      _transectSOCCObject.setStyle = function(_type, style){

        return _transectSOCCObject.styles[_type] = style;

      };

      _transectSOCCObject.setDrawControl = function(draw_cont){

        drawControl=draw_cont;
        info.addTo(map);

      };

      _transectSOCCObject.setCompleted = function(){

        current_section=7;

      }

      _transectSOCCObject.getError = function(error_code){

        if(texts.errors[error_code]) return texts.errors[error_code];
        else error_code;

      }


      _transectSOCCObject.bindEvent = function(event_name,event_function){

        events[event_name]=event_function;

      }

      _transectSOCCObject.addNewSection = function(layer){

        current_section=current_section+1;
        L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Clica per a continuar dibuixant la secció '+current_section;
        L.drawLocal.draw.handlers.polyline.tooltip.end = 'Clica al darrer punt per a tancar la secció '+current_section;

        //Less than 6 sections drawn
        if(current_section <= sections){

          _transectSOCCObject.addSectionPoint(current_section-1,layer._latlngs[0],true);
          _transectSOCCObject.newSection(layer._latlngs[layer._latlngs.length -1]);
          info.update();
          return false;

        }
        else{


          _transectSOCCObject.addSectionPoint(current_section-1,layer._latlngs[0],true);
          _transectSOCCObject.addSectionPoint(sections,layer._latlngs[layer._latlngs.length -1]);
          info.update();
          return true;

        }


      };


      // Change a private property
      _transectSOCCObject.newSection = function(last_point){

        this.line=new L.Draw.Polyline(map, drawControl.options.polyline);
        this.line.enable();

        //console.log('Starting new section '+project_settings['socc'].current_section);
        _transectSOCCObject.addSectionPoint(current_section-1,last_point);

        if($('#continuous_transect').is(':checked')){

          this.line.addVertex(last_point);

        }

      };


      _transectSOCCObject.addGeoJSONGeometry = function (geometry, _type, editable, editableLayers){

        /*if(_type=='site_location'){

          var layer=L.geoJson(geometry, {style: style });
          layer.addTo(map);
          map.fitBounds(layer.getBounds());

        }*/

        for (i = 1; i < 7; i++) {

          var feature={};

          feature['type']='Feature';
          feature['geometry']={};

          feature['geometry']['coordinates']=geometry['features'][i-1]['geometry']['coordinates'];
          feature['geometry']['type']=geometry['features'][i-1]['geometry']['type'];


          var layer=L.geoJson(feature, {style: styles['transect'],
              onEachFeature: function (feature, layer) {

                  var props = feature.properties = feature.properties || {};
                  props.section = i;

              }
          });

          editableLayers.addLayer(layer.getLayers()[0]);

        }

        editableLayers.addTo(map);

        map.fitBounds(editableLayers.getBounds());
        _transectSOCCObject.drawSectionLimits(editableLayers);



      }


      _transectSOCCObject.clearDrawing = function(){

        if(current_section==0) current_section=1;
        info.update();


      };


      _transectSOCCObject.clear = function (){

        _transectSOCCObject.clearSectionLimits();

      };


      _transectSOCCObject.startDrawing = function(){


        if(_transectSOCCObject.isFinished()){

          current_section=1;
          info.update();

          return true;

        }
        else{

          if(current_section==0) {

            current_section=1;
            $('.leaflet-draw-draw-polyline').hide();
          }

          info.update();

          return false;

        }

      };


      _transectSOCCObject.deletedFeatures = function(){

        map.removeLayer(sectionMarkers);
        current_section=0;

      };

      _transectSOCCObject.clearSectionLimits = function (){

        map.removeLayer(sectionMarkers);
        sectionMarkers = new L.FeatureGroup();
        map.addLayer(sectionMarkers);

      };


      _transectSOCCObject.drawSectionLimits = function(editableLayers){

        map.removeLayer(sectionMarkers);
        sectionMarkers = new L.FeatureGroup();

        $.each(editableLayers._layers, function( index, layer ) {

          _transectSOCCObject.addSectionPoint(layer.feature.properties['section'],layer._latlngs[0],true);
          _transectSOCCObject.addSectionPoint(layer.feature.properties['section'],layer._latlngs[layer._latlngs.length -1]);


        });

      };




      _transectSOCCObject.getCurrentSection = function(){

        return current_section;

      };

      _transectSOCCObject.setDrawPreHooks = function(){

        L.drawLocal.draw.handlers.polyline.tooltip.start = 'Clica per a començar a dibuixar una secció';
        L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Clica per a continuar dibuixant la secció 1';
        L.drawLocal.draw.handlers.polyline.tooltip.end = 'Clica al darrer punt per a tancar la secció 1';


      };




      _transectSOCCObject.getDrawConfig = function(){

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



      _transectSOCCObject.isFinished = function (){

        return current_section>sections;

      };

      _transectSOCCObject.isValid = function (data, _type){

       if(data.type=='FeatureCollection'){

         if(data.features.length == sections){

           for (i = 0; i < data.features.length; i++) {

             var feature=data.features[i];

             if(feature.geometry.type=='LineString'){

               if(feature.geometry.coordinates.length > 1) {

                 if(feature.properties.SECCIO || feature.properties.section || feature.properties.seccio) return true;
                 return false;

               }
               else return false;

             }
             else return false;

           }


           return true;


         }
         else{

           return false;

         }


       }
       else{

         return false;

       }


     };


     _transectSOCCObject.bindDrawEvents = function (editableLayers, update){


       /* On geometry finished */
       map.on(L.Draw.Event.CREATED, function (e) {
           var type = e.layerType,
               layer = e.layer;

           feature = layer.feature = layer.feature || {}; // Intialize layer.feature
           feature.type = feature.type || "Feature"; // Intialize feature.type
           var props = feature.properties = feature.properties || {};

           //Clear previous transect when starting new transect
           if(current_section==1){

             _transectSOCCObject.clear();

              editableLayers.eachLayer(function(layer) {

                editableLayers.removeLayer(layer);

              });

           }

          props.section = _transectSOCCObject.getCurrentSection();
          finished = _transectSOCCObject.addNewSection(layer);

          editableLayers.addLayer(layer);

          if(finished){

             events['update_transect'](editableLayers.toGeoJSON());

          }

           update(editableLayers)
       });


       map.on(L.Draw.Event.DRAWSTOP, function (e) {

         _transectSOCCObject.clearDrawing();

       });

       map.on(L.Draw.Event.EDITSTOP, function (e) {

         _transectSOCCObject.drawSectionLimits(editableLayers);

         events['update_transect']({});
         update(editableLayers)

       });


       map.on(L.Draw.Event.DELETED, function (e) {

         _transectSOCCObject.deletedFeatures();
         events['update_transect']({});

         info.update();

       });

       map.on(L.Draw.Event.DRAWSTART, function (e) {

         events['update_transect']('{}');

         new_drawing=_transectSOCCObject.startDrawing();

         if(new_drawing){

            editableLayers.eachLayer(function(layer) { editableLayers.removeLayer(layer);});
         }

         update(editableLayers)

       });


     };



      _transectSOCCObject.getCurrentSection = function (){

        return current_section;

      };

      _transectSOCCObject.showRemove = function (){

        return false;

      };

      _transectSOCCObject.showEdit = function (){

        return true;

      };

      _transectSOCCObject.addSectionPoint = function(section, last_point, start=false){

        var text= '';
        if(start) text=texts['start_section_point'];
        else text=texts['last_section_point'];


        var circle=L.circle(last_point, {
        	color: settings.default_color,
        	fillColor:  settings.default_color,
        	fillOpacity: 0.5,
        	radius: 30
        }).bindPopup(text+' '+section);

        sectionMarkers.addLayer(circle).addTo(map);

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

        if(current_section==0){

          this._div.innerHTML = '<p><b>'+texts['draw_start']+'</b></p>';

        }
        else if (current_section > sections) {

          $('.leaflet-draw-draw-polyline').show();
          this._div.innerHTML = '<h4>'+texts['draw_ended']+'</h4>';

        }
        else{

          this._div.innerHTML = '<h4>'+texts['draw_section']+''+current_section+'</h4>';

        }


      };

      return _transectSOCCObject;


    }

    if(typeof(window.SOCCTransect) === 'undefined'){
      window.SOCCTransect = transectSOCC();
    }

})(window);
