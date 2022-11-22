# monitoring_maps


## map.js

**MapMultiLayer** object creates leaflet map with several layers.

## map_layers.js

**LayerManager** object handles layers from leaflet map.

## draw_manager.js

**MonitoringDraw** object extends leaflet.draw library to implement monitoring project draw actions.

| Method                                       | Returns   | Description                                                                                                                                                                                                              |
| :------------------------------------------- | :-------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| enableDraw(`shape`,`options`)                | -         | Enable Draw Mode with the passed shape. The `options` are optional.                                                                                                                                                      |
| disableDraw()                                | -         | Disable Draw Mode.                                                                                                                                                                                                       |
| Draw.getShapes()                             | `Array`   | Array of available shapes.                                                                                                                                                                                               |
| Draw.getActiveShape()                        | `String`  | Returns the active shape.                                                                                                                                                                                                |
| globalDrawModeEnabled()                      | `Boolean` | Returns `true` if global Draw Mode is enabled. `false` when disabled.                                                                                                                                                    |
| setPathOptions(`options`, `optionsModifier`) | -         | Customize the style of the drawn layer. Only for L.Path layers. Shapes can be excluded with a `ignoreShapes` array or merged with the current style with `merge: true` in `optionsModifier` [Details](#customize-style). |
| setGlobalOptions(`options`)                  | -         | Set `globalOptions` and apply them.                                                                                                                                                                                      |
| applyGlobalOptions()                         | -         | Apply the current `globalOptions` to all existing layers.                                                                                                                                                                |
| getGlobalOptions()                           | `Object`  | Returns the `globalOptions`.                                                                                                                                                                                             |
| getGeomanLayers(`Boolean`)                   | `Array`   | Returns all Leaflet-Geoman layers on the map as array. Pass `true` to get a L.FeatureGroup.                                                                                                                              |
| getGeomanDrawLayers(`Boolean`)               | `Array`   | Returns all drawn Leaflet-Geoman layers on the map as array. Pass `true` to get a L.FeatureGroup.                                                                                                                        |


### protocols/draw_socc.js

### protocols/draw_segre.js

### protocols/draw_plataformes.js


## shape_upload.js

- Allows user to upload shape or kml files with SOCC transects.  WIP: allow other kind of data.
