import React from 'react'
import L from 'leaflet';
import $ from 'jquery';
import { Button } from 'antd';
import builder from 'xmlbuilder';


let markerpoint;
let map2 = null;
let markerarray = [];
class Geoserver extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			addvisible: false
		}

	}
	componentDidMount() {

		map2 = L.map('normal-map', {
			center: [49.0, 8.42],
			zoom: 13,
			layers: [
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 19,
					attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
				})
			]
		})
	}
	//Download points in a xml file.
	Download = () => {
		var root = builder.create('wfs:Transaction');
		root.att('service', "WFS");
		root.att('version', "1.0.0");
		root.att('xmlns:' + window.workspace, window.geoserver + "/" + window.workspace);
		root.att('xmlns:ogc', "http://www.opengis.net/ogc")
		root.att('xmlns:wfs', "http://www.opengis.net/wfs")
		for(var i = 0; i < window.pointsarrayall.length; i++) {
			var insert = root.ele('wfs:insert');
			var item = insert.ele(window.workspace + ":" + window.geoserverlayer);
			var id = item.ele('id', i + 1)
			var longitude = item.ele('longitude', window.pointsarrayall[i][0].Longitude)
			var latittude = item.ele('latitude', window.pointsarrayall[i][0].Latitude)
			var type = item.ele('type', window.pointsarrayall[i][0].Typename)
			var accuracy = item.ele('type', window.pointsarrayall[i][0].Accuracy)
			var color = item.ele('type', window.pointsarrayall[i][0].Color)

		}
		var xml = root.end({
			pretty: true
		});
		console.log(xml, 'xml');

		var c = document.createElement("a");
		c.download = "Points.xml";
		var t = new Blob([xml], {
			type: "text/xml"
		});
		c.href = window.URL.createObjectURL(t);
		c.click();

	}
	
	
	//Upload points to Geoserver
	Upload = () => {
		for(var i = 0; i < window.pointsarrayall.length; i++) {

			var settings = {
				"url": "http://localhost:8090/geoserver/webdienste/ows?SERVICE=WFS&VERSION=1.0.0&REQUEST=Transaction",
				"method": "POST",
				"timeout": 0,
				"async": false,
				"headers": {
					"Content-Type": "text/plain"
				},
				"data": "<wfs:Transaction service=\"WFS\" version=\"1.0.0\"\r\nxmlns:webdienste=\"http://localhost:8090/geoserver/webdienste\"\r\nxmlns:ogc=\"http://www.opengis.net/ogc\"\r\nxmlns:wfs=\"http://www.opengis.net/wfs\">\r\n<wfs:Insert>\r\n<testlayer>\r\n<id>\r\n" + (i + 1) + "\r\n</id>\r\n<longitude>\r\n" + window.pointsarrayall[i][0].Longitude + "\r\n</longitude>\r\n<latitude>\r\n" + window.pointsarrayall[i][0].Latitude + "\r\n</latitude>\r\n<typename>\r\n" + window.pointsarrayall[i][0].Typename + "\r\n</typename>\r\n<accuracy>\r\n" + window.pointsarrayall[i][0].Accuracy + "\r\n</accuracy>\r\n<color>\r\n" + window.pointsarrayall[i][0].Color + "\r\n</color>\r\n<groupname>\r\n" + window.pointsarrayall[i][0].Group + "\r\n</groupname>\r\n<geom>\r\n<ogc:Point srsName=\"http://www.opengis.net/gml/srs/epsg.xml#4326\">\r\n<ogc:coordinates>\r\n" + window.pointsarrayall[i][0].Longitude + ',' + window.pointsarrayall[i][0].Latitude + "\r\n</ogc:coordinates>\r\n</ogc:Point>\r\n</geom>\r\n</testlayer>\r\n</wfs:Insert>\r\n</wfs:Transaction>",
			};

			$.ajax(settings).done(function(response) {
				console.log(response,'response')
			});
		}
		alert('Upload successfully!')
	}
	
	//Query if points upload to Geoserver successfully by Ajax,Get response.
	query = () => {
		var settings = {
			"url": "http://localhost:8090/geoserver/webdienste/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=webdienste%3Atestlayer&maxFeatures=50&outputFormat=application%2Fjson",
			"method": "GET",
			"timeout": 0,
		};

		$.ajax(settings).done(function(response) {
			alert(JSON.stringify(response))
			for(var i = 0; i < response.features.length; i++) {
				markerpoint = L.circleMarker(new L.LatLng(response.features[i].properties.latitude, response.features[i].properties.longitude), {
					color: response.features[i].properties.color,
					weight: 5,
					opacity: 1,
					fillColor: response.features[i].properties.color,
					fillOpacity: 0.5,
					radius: 20,
				})
				var content = "<b>Point Number</b>   " + (i + 1) + "<br /><b>Longitude</b>   " + response.features[i].properties.longitude +
					"<br /><b>Latitude</b>   " + response.features[i].properties.latitude +
					"<br /><b>Type name</b>   " + response.features[i].properties.typename +
					"<br /><b>Accuracy</b>   " + response.features[i].properties.accuracy

				markerpoint.addTo(map2).bindPopup(content).openPopup();

			}
		});
	}

	Clear = () => {
		var settings = {
			"url": "http://localhost:8090/geoserver/webdienste/ows?SERVICE=WFS&VERSION=1.0.0&REQUEST=Transaction",
			"method": "POST",
			"timeout": 0,
			"headers": {
				"Content-Type": "text/plain"
			},
			"data": "<wfs:Transaction service=\"WFS\" version=\"1.0.0\"\r\n  xmlns:ogc=\"http://www.opengis.net/ogc\"\r\n  xmlns:wfs=\"http://www.opengis.net/wfs\"\r\n  xmlns:webdienste=\"http://www.openplans.org/webdienste\">\r\n  <wfs:Delete typeName=\"webdienste:testlayer\">\r\n    <ogc:Filter>\r\n      <ogc:PropertyIsEqualTo>\r\n        <ogc:PropertyName>groupname</ogc:PropertyName>\r\n        <ogc:Literal>" + window.groupname + "</ogc:Literal>\r\n      </ogc:PropertyIsEqualTo>\r\n    </ogc:Filter>\r\n  </wfs:Delete>\r\n</wfs:Transaction>",
		};

		$.ajax(settings).done(function(response) {
			console.log(response);
		});
	}

	render() {
		return(
			<div style={{width: "60rem"}}>
		
		<Button type="primary" onClick={this.Download}>
        Download WFS-T.xml
        </Button>
        <Button type="primary" onClick={this.Upload}>
        Upload to Geoserver
        </Button>
		<Button type="primary" onClick={this.query}>
		Query from Geoserver
        </Button>
		<Button type="primary" onClick={this.Clear}>
    	Clear
        </Button>
		<div id="normal-map" style={{ height: '40rem',width: '66rem'}}>
    	</div>
    	</div>
		)
	}

}
export default Geoserver;