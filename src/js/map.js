(function(window){
  // You can enable the strict mode commenting the following line
  // 'use strict';


  // This function will contain all our code
  function mapMultiLayer(){


  /**
   *  MAP SETTINGS AND LEGEND
   */

  var map,
      lat,
      lng,
      zoom,
      zoom_snap = 1,
      roads,
      catastroLayer,
      topoLayer,
      aerial,
      controls,
      active_layers = {},
      overlay_layers = {};


      var _mapMultiLayerObject = {};


    _mapMultiLayerObject.init = function(config){

      //Need to validate config params

      layers_config=config['active_layers'];
      position=config['layer_selector_position'];

      default_config={
        zoomAnimation: false,
        zoomSnap: zoom_snap
      }

      if(config['fullscreenControl']) default_config['default_config']=true;

      map = L.map('map',default_config).setView([config['center']['latitude'],config['center']['longitude']], config['zoom']);


      osm = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          id: 'mapbox/streets-v11',
          tileSize: 512,
          maxZoom: 18,
          zoomOffset: -1,
          accessToken: 'pk.eyJ1IjoiaWNvY2VsbHMiLCJhIjoiY2pqZ3V1ZXE4MjEwYjNrb2xnZjZwYnFzayJ9.VfuiJ0uv2dT9HjTIVqOOKg'
        }).addTo(map);

      catastro = L.tileLayer.wms('http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?', {
          layers: 'catastro',
          attribution: 'Dirección General del Catastro - Ministerio de Hacienda y Función Pública'
        });

      topo = L.tileLayer.wms("https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wms/service?", {
            layers: 'topo',
            format: 'image/png',
            continuousWorld: true,
            attribution: 'Institut Cartogràfic i Geològic de Catalunya -ICGC',
        });

      aerial = L.tileLayer.wms("https://geoserveis.icgc.cat/icc_mapesmultibase/noutm/wms/service?", {
            layers: 'orto',
            format: 'image/png',
            continuousWorld: true,
            attribution: 'Institut Cartogràfic i Geològic de Catalunya -ICGC',
        });


        var layer_selector = L.control({position: position});

        layer_selector.onAdd = function(map) {


          var div = L.DomUtil.create('div', 'layer_selector_btn');
          div.innerHTML = '<i class="fas fa-layer-group"></i>';

          return div;
        }

        layer_selector.addTo(map);


      // Active layers
      if (layers_config.indexOf('osm') != -1) active_layers['Carreteres <span class="source">OpenStreetMap</span>'] = osm;
      if (layers_config.indexOf('catastro') != -1) active_layers['Cadastre <span class="source">Ministerio de Hacienda</span>'] = catastro;
      if (layers_config.indexOf('topo') != -1) active_layers['Topogràfic <span class="source">Institut Cartogràfic i Geològic de Catalunya</span>'] = topo;
      if (layers_config.indexOf('aerial') != -1) active_layers['Aèria <span class="source">Institut Cartogràfic i Geològic de Catalunya</span>'] = aerial;

      controls = L.control.layers(active_layers, overlay_layers, {
    			collapsed: false
    		}).addTo(map);


      var controls_div = controls._container;
      controls._container.parentNode.removeChild(controls_div);

      $($("input.leaflet-control-layers-selector")["0"]).prop('disabled', true);

      var box = L.control({position: position});

      box.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'controls');
        return div;
      }

      box.addTo(map);

      $('.controls').append(controls.onAdd(map));


      topo.on('load', function() {
        $('#map').removeClass('loading');
      });

      map.on('baselayerchange', function(layer) {
        selected_layer = layer.name;
      });

      $('.layer_selector_btn').on('click', function() {
        $('.controls').toggleClass('open');
      });


      if(config['fullscreenControl']) map.addControl(new L.Control.Fullscreen());

      return map;

  };


      _mapMultiLayerObject.getMap = function() {

        return map;

      };

    _mapMultiLayerObject.initLegend = function(legend_content) {

        var box = L.control({position: 'bottomright'});

        box.onAdd = function(map) {

          var legend = L.DomUtil.create('div','info legend');

          legend.innerHTML = legend_content;

          return legend;

        }

        box.addTo(map);


    };


    return _mapMultiLayerObject;

  }

  // We need that our library is globally accesible, then we save in the window
  if(typeof(window.MapMultiLayer) === 'undefined'){
    window.MapMultiLayer = mapMultiLayer();
  }
})(window); // We send the window variable withing our function
