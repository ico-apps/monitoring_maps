# monitoring_maps


## map.js

**MapMultiLayer** object creates leaflet map with several layers.

## map_layers.js

**LayerManager** object handles layers from leaflet map.

## draw_manager.js

**MonitoringDraw.** object extends leaflet.draw library to implement monitoring project draw actions.

| Method                               | Returns | Description                                |
|:-------------------------------------|:--------|:-------------------------------------------|
| init(protocol,mode)                  | -       | Enable MonitoringDraw. for project and mode |
| destroy()                            | -       | Destroy MonitoringDraw. instance.           |
| bindEvent(event_name,event_function) | -       | Bind event_name to event_function          |


### protocols/draw_socc.js

### protocols/draw_segre.js

### protocols/draw_plataformes.js


## shape_upload.js

- Allows user to upload shape or kml files with SOCC transects.  WIP: allow other kind of data.
