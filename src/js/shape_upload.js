(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict

  function shapeUpload(){

    var _shapeUploadObject = {};
    /* Allowed file extensions */
    var fileExtension = ['kml', 'zip', 'shp'];
    var upload_input='';
    var remove_layer_button='';
    var extension ='';

    var style_draw = {
        "color": "#f0982a",
        "weight": 2,
        "opacity": 0.8
    };

    var result_handler='';

    var section_fields={'seccio':1,'secció':1,'section':1};


      /**
       * init  - Inits shape upload process.
       * 1. Validates format
       * 2. Sends the file the parser depending on KML (text) or shp (binary file).
       *
       * @param {string} input_id Id of the file upload input
       * @param {string} remove_id Id of the remove layer button

       */
    _shapeUploadObject.init = function(input_id, remove_id, handler){

      result_handler=handler;

      upload_input=$('#'+input_id);
      remove_layer_id=$('#'+remove_id);

      extension=upload_input.val().split('.').pop().toLowerCase();

      if ($.inArray(extension, fileExtension) == -1) {
            alert("Formats suportats : "+fileExtension.join(', '));
      }
      else {

          file = upload_input[0].files[0];

          fr = new FileReader();
          fr.onload = _shapeUploadObject.receiveBinary;

          if(extension==='kml') fr.readAsText(file);
          else fr.readAsArrayBuffer(file);

      }

    };


    /**
     * Handler after file upload.
     * a) For KML it parses using DOM parser (XML)
     * b) For shp it uses shp library
     *
     */
    _shapeUploadObject.receiveBinary = function() {


          result = fr.result;

          if(extension==='kml'){

                    var shpObj={};

                    var kml = new DOMParser().parseFromString(fr.result,"application/xml");

                    kml=toGeoJSON.kml(kml)

                    if (kml.length > 1) {

                        shpObj['type']='FeatureCollection';
                        shpObj['features']=kml;
                    }
                    else shpObj=kml;

                    //console.log();
                    _shapeUploadObject.forwardToGeoJsonIo(shpObj);

          }
          else{

            var shpfile = shp(this.result).then(_shapeUploadObject.forwardToGeoJsonIo);

          }

      };


      /**
       * Creates a GeoJson feature object
       *
       * @param {string} feature_obj String feature
       * @param {string} extension extension {kml,shp}
       * @returns {feature}
       */


    _shapeUploadObject.createFeature = function(feature_obj,extension){


          var feature={};

          feature['type']='Feature';
          feature['geometry']={}

          var coordinates=[];

          for (pos = 0; pos < feature_obj.geometry.coordinates.length; pos++) {

            point=feature_obj.geometry.coordinates[pos];
            //Removing altitude (Z) coordinates
            point.length=2;
            coordinates.push(point);

          }

          feature['geometry']['coordinates']=coordinates;
          feature['geometry']['coordinates'];
          feature['geometry']['type']=feature_obj.geometry.type;


          return feature;

      };


      /**
       * Parses data created from uploaded file
       * and adds the layer to the Leaflet Draw map
       *
       * @param {string} data Data parsed from shape files
       */

      _shapeUploadObject.forwardToGeoJsonIo = function (data){


        loaded_obj_shp = {};
        MonitoringDraw.clearLayer();

        if(MonitoringDraw.isValidGeometry(data)){

          for (step = 0; step < data.features.length; step++) {

            var section_number=-1;

            $.each(data.features[step].properties, function( index, value ) {

              if(section_fields[index.toLowerCase()]){

                section_number=value;

              }

            });

            if(section_number<=0){

              ///TODO: Improve error handling
              alert('El camp amb la secció no s\'ha trobat');

            }
            else{

              feature=_shapeUploadObject.createFeature(data.features[step],extension);

              loaded_layer=L.geoJson(feature,{style: style_draw,
                  onEachFeature: function (feature, layer) {

                      var props = feature.properties = feature.properties || {};
                      props.section = section_number;

                  }
              });

              MonitoringDraw.addFeature(loaded_layer.getLayers()[0]);

            }

          }


        MonitoringDraw.fitUploadedShapeBounds();
        remove_layer_id.show();

      }
      else{

        result_handler('error',MonitoringDraw.getError('invalid_shape'));

      }


      };

      return _shapeUploadObject;

  }

  if(typeof(window.ShapeUpload) === 'undefined'){
    window.ShapeUpload = shapeUpload();
  }



})(window);
