var allLayers = [
    {
        "groupHeading": "SIGL SITES",
        "showGroupHeading": true,
        "includeInLayerList": true,
        "layers": {
            "SIGL_GeoServer" : {
                "url": "http://107.23.251.59:8080/geoserver/usgs/wms?",
                "options": {
                    "layers": 'SITE',
                    "transparent": 'true',
                    "format": 'image/png'
                },
                "wimOptions": {
                    "type": "layer",
                    "layerType": "geoServerWMS",
                    "includeInLayerList": true,
                    "zoomScale": 144448
                }
            }
        }
    }
]