/* Leaflet map init with some active layers and centered to Catalonia */
var map=MapMultiLayer.init(
  {'active_layers':['aerial','osm', 'topo'],
  'zoom':8,
  'center':{'latitude':41.68111756290652,'longitude':1.702880859375},
  'layer_selector_position': 'topleft',
  'fullscreenControl': true
  }
);

var square_style={
        color: "#0056b3",
        fillColor: "#0056b3",
        fillOpacity: 0,
        radius: 90.0
};

var visibility_style={
        color: "#28a745",
        fillColor: "#28a745",
        fillOpacity: 0.5,
        radius: 100
};

loadSurveyLocationsLayers();

$.fn.serializeFormJSON = function () {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function () {
    if (o[this.name]) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

var form_initial = $("<div />").append($('#surveylocation_form').clone()).html();

$('#exportGeoJson').on("click", function(event){
  event.preventDefault();
  if(MonitoringSiteDraw.isFinished()){
    $("#alert").text('');
    $("#alert").addClass('invisible');

    var obs_point= MonitoringSiteDraw.objectToGeoJSON('obs_point');
    var visibility= MonitoringSiteDraw.objectToGeoJSON('visibility');

    form = $('#surveylocation_form');
    data = form.serializeFormJSON();
    data['obs_point'] = JSON.stringify(obs_point['geometry']);
    data['visibility'] = JSON.stringify(visibility['geometry']);

    $.ajax({
      url: form.attr('js-save-url'),
      type: 'POST',
      data: data,
      success: function(){
        getSurveyLocations();
        $('#new_survey_location_div .alert, #create_location_shape_form').addClass('invisible');
        $('#createNewSurveyLocation').attr('disabled', false);
        $('#surveylocation_form').replaceWith(form_initial);
        MonitoringSiteDraw.destroy();
        LayerManager.clearAllLayers();
        loadSurveyLocationsLayers();
      },
      error: function (response){
        $('#surveylocation_form').replaceWith(response.responseText);
      }
    });
  }
});

$('#createNewSurveyLocation').on("click", function(){

  MonitoringSiteDraw.init('rapis');

  MonitoringSiteDraw.bindEvent('update_survey_location',function(obs_point, visibility){
    $('#new_survey_location_div .alert').removeClass('invisible');

    var obs_point_state='[no definida]';
    if(obs_point) obs_point_state='<i class="far fa-check-square"></i>';

    var obs_zone_state='[no definida]';
    if(visibility) obs_zone_state='<i class="far fa-check-square"></i>';

    var message= '<i class="fas fa-eye"></i> Punt d\'observació '+obs_point_state+'<br/>' +
    '<i class="fas fa-draw-polygon"></i> Zona d\'observació '+obs_zone_state;

    $('#new_survey_location_div .alert').html(message);

    if(obs_point && visibility) $('#create_location_shape_form').removeClass('invisible');
    else $('#create_location_shape_form').addClass('invisible');
  });
  $('#createNewSurveyLocation').attr('disabled',true);
});

function loadSurveyLocationsLayers(){
  /* Showing site square*/
  var active_layer='Quadrat ' + monitoringsite_code;
  LayerManager.create(active_layer,square_style);
  LayerManager.addSquare(active_layer,geometry_layer,{});
  LayerManager.fitContent(active_layer);

  $.getJSON(window.reverseUrl('surveylocation-list','')+'?site_code=' + monitoringsite_code, function(result){
    var layer_name='Punt d\'observació i visibilitat:';

    $.each(result, function(i, field){
        var layer_survey_location='<small>'+layer_name+' '+field['year']+'</small>';
        LayerManager.clearLayer(layer_survey_location);
        LayerManager.create(layer_survey_location,visibility_style);
        var coordinates=field['obs_point']['coordinates'];
        LayerManager.createCircleMarker(layer_survey_location,[coordinates[1],coordinates[0]], field);
        LayerManager.createGeoJsonPolygon(layer_survey_location,field['visibility'], field, false);
        LayerManager.addLegendItem(layer_survey_location,visibility_style['color'],'fa-square', 1);
    });
    LayerManager.showControls();
    LayerManager.updateLegend();
  });
}

var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();
window.CSRF_TOKEN = csrftoken;
// ajax delete
$('#deleteConfirmationModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget);
  var url = button.data('delete-url');
  var container_id = button.data('container-id');
  var modal = $(this);
  modal.find('#js_ajax_delete').attr('action', url);
  modal.find('#js_ajax_delete').attr('container-id', container_id);
});

$('#js_ajax_delete').submit(function (event) {
  event.preventDefault();
  container_id = $(this).attr('container-id');
  $.ajax({
    url: $(this).attr('action'),
    type: 'POST',
    beforeSend: function (request) {
      request.setRequestHeader("X-CSRFToken", window.CSRF_TOKEN);
    },
    success: function (result) {
      $('#'+container_id).remove()
      $('#deleteConfirmationModal').modal('hide');
      getSurveyLocations();
      LayerManager.clearAllLayers();
      loadSurveyLocationsLayers();
    },
  });
});

function getSurveyLocations() {
  let url = window.surveylocations_url;
  let wrapper = $('.surveylocations-wrapper');
  $.ajax({
    url: url,
    type: 'GET',
    success: function (response) {
      // use remove & append instead of replaceWith because table
      // could have several tbody elements (e.g. to group rows)
      $(wrapper).find('table tbody').remove();
      response = $(response).find('tbody');
      $(wrapper).find('table').append(response);
    },
  });
}
