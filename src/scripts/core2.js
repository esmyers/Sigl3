//Added by Erik Myers, USGS WiM 1/21/2016
//EXAMPLE 10 using marker styled with custom CSS icon to appear as a circle
//divIcons are set according to each marker's LAKE attribute.
//spiderfy in use here from the original github repo:  https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet
//Auxiliary polygon layers brought in using ESRI-LEAFLET
//MUCH SLOWER than circlemarker implementation, but does work with original spiderfy library 

$( document ).ready(function() {

    //for jshint
    'use strict';

    /* create map */
    var map = L.map('mapDiv').setView([44.833333, -85.583333], 6);
    var layer = L.esri.basemapLayer('Gray').addTo(map);
    var layerLabels;
    var legend = L.control({position:'bottomright'});

    var oms = new OverlappingMarkerSpiderfier(map, {keepSpiderfied:true});

    //return the appropriate class for each point
    function setDivIcon(Lake){
        switch(Lake){
            case "Superior":
                return new L.divIcon({className:'superiorDivicon'});
                break;
            case "Michigan":
                return new L.divIcon({className:'michiganDivicon'});
                break;
            case "Huron":
                return new L.divIcon({className:'huronDivicon'});
                break;
            case "Erie":
                return new L.divIcon({className:'erieDivicon'});
                break;
            case "Ontario":
                return new L.divIcon({className:'ontarioDivicon'});
                break;
            default:
                return new L.divIcon({className: 'otherLakeDivicon'})
        }
    }

    $('#mapDiv').height($('body').height());
    map.invalidateSize();

    //startLoading();

    //ISSUE: figure out hex keys and add them
   L.esri.featureLayer({
        url: "http://sigl.wim.usgs.gov:6080/arcgis/rest/services/SIGL/SIGLMapper/MapServer/3",
        simplifyFactor: 0.5,
        precision: 5,
        style: function(feature){
            if (feature.properties.LAKE == "ls"){
                return {color: 'DarkCyan', weight:0};
            }
            if (feature.properties.LAKE == "lm"){
                return {color: 'DarkKhaki', weight:0};
            }
            if (feature.properties.LAKE == "lh"){
                return {color: 'IndianRed', weight:0};
            }
            if (feature.properties.LAKE == "le"){
                return {color: 'Olive', weight:0};
            }
            if (feature.properties.LAKE == "lo"){
                return {color: 'MediumPurple', weight:0};
            }
        }
    }).addTo(map);

   L.esri.featureLayer({
        url: "http://sigl.wim.usgs.gov:6080/arcgis/rest/services/SIGL/SIGLMapper/MapServer/1",
        simplifyFactor: 0.5,
        precision: 5,
        style: function(){
            return {color: 'DarkOrange', weight: 1 };
        }
    }).addTo(map);

    $.ajax({
        dataType: "json",
        url: "https://sigldev.wim.usgs.gov/LaMPServicesTest/sites/siteView.json",
        success: function (json) {

            console.log(json);

            var markers = L.markerClusterGroup({
                zoomToBoundsOnClick: true,
                disableClusteringAtZoom:10
            });

            for (var i = 0; i < json.length; i++) {
                var a = json[i];

                //create marker divIcon class styles in main.css
                var marker = L.marker(new L.LatLng(a['LATITUDE'], a['LONGITUDE']), {icon: setDivIcon(a.LAKE)});

                marker.bindPopup("<b>Site Name:</b> " + a.NAME + "<br/><b>Site ID:</b> " + a.SITE_ID + "<br/> <b>Description: </b>" + a.DESCRIPTION);
                markers.addLayer(marker);
                oms.addMarker(marker);

            }
            map.addLayer(markers);

            //map.on('ready', finishedLoading);

            map.on("click", function(event){
                console.log(event);
            });

            markers.on('click', function (a) {
                console.log('marker ' + a.layer);
            });
        }
    });

    legend.onAdd = function(map){
        var div = L.DomUtil.create('div', 'info legend'),
        lakes = ['superior', 'huron', 'michigan', 'erie', 'ontario'];
        //color = ['#800026', '#BD0026', '#E31A1C', '#FC4E2A', '#FD8D3C'];

        for (var i=0; i<lakes.length; i++){
            div.innerHTML +=
                //'<i style="background:' + color[i] + '"></i> ' + lakes[i] + (lakes[i + 1] ? '&ndash;' + lakes[i + 1] + '<br>' : '+');
                //set the legend div to be the xxxxDivicon
                '<i class="'+ lakes[i] + 'Divicon"></i> ' + lakes[i]  + '<br><br>' ;
        }
        return div;
    }  

    legend.addTo(map);

    /*function startLoading(){
        loader.className = "";
    }

    function finishedLoading(){
        loader.className = "done";
        setTimeout(function(){
            loader.className = "hide";
        }, 500);
    }*/

    /*$('#disableButton').on('click', function(markers) {
        markers.disableClustering();
        updateCurrentFrozenZoom();
    });*/

    function getLocation() {

        $.ajax({
            dataType: "jsonp",
            url: "http://freegeoip.net/json/",
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("IP Geolocation Error: ", textStatus);

                //if timeout, do this
                if (textStatus == 'timeout') {
                    //ZoomManager(0);
                }
            },
            success: function (data) {
                console.log("IP Geolocation Success: ", data);

                //zoom to location
                map.setView([data.latitude, data.longitude], 9)
            },
            timeout: 3000
        });
    }

    function setBasemap(basemap) {
        if (layer) {
          map.removeLayer(layer);
        }
        layer = L.esri.basemapLayer(basemap);
        map.addLayer(layer);
        if (layerLabels) {
          map.removeLayer(layerLabels);
        }

        if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {

          layerLabels = L.esri.basemapLayer(basemap + 'Labels');
          map.addLayer(layerLabels);
        }
    }

    $('.basemapBtn').on('click',function() {
        var baseMap = this.id.replace('btn','');

        // https://github.com/Esri/esri-leaflet/issues/504 submitted issue that esri-leaflet basemaps dont match esri jsapi

        switch (baseMap) {
            case 'Streets': baseMap = 'Streets'; break;
            case 'Satellite': baseMap = 'Imagery'; break;
            case 'Hybrid': baseMap = 'n/a'; break;
            case 'Topo': baseMap = 'n/a'; break;
            case 'Terrain': baseMap = 'ShadedRelief'; break;
            case 'Gray': baseMap = 'Gray'; break;
            case 'OSM': baseMap = 'n/a'; break;
            case 'NatGeo': baseMap = 'NationalGeographic'; break;
            case 'NatlMap': baseMap = 'n/a'; break;
        }

        setBasemap(baseMap);

    });

        /* legend control */
    $('#legendButtonNavBar, #legendButtonSidebar').on('click', function () {
        $('#legend').toggle();
        //return false;
    });
    $('#legendClose').on('click', function () {
        $('#legend').hide();
    });
    /* legend control */

    /*onButtonClick("disableButton", function () {
        markers.disableClustering();
        updateCurrentFrozenZoom();
    });*/

    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++Leaflet MarkerCluster Freezable -- disable Button
    /*function onButtonClick(buttonId, callback) {
        getById(buttonId).addEventListener("click", callback);
    }

    function getById(id) {
        return document.getElementById(id);
    }

    function updateCurrentFrozenZoom() {
    currentFrozenZoom.innerHTML = mcg._frozen ?
        mcg._zoom :
        "<span class='italic'>(not frozen)</span>";
    }*/


});
