import React from "react";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Drawer, Button } from 'antd';
import $ from 'jquery';
import Geolocation from '@react-native-community/geolocation';
import Papa from 'papaparse';
import Select from 'react-select';
import * as turf from '@turf/random'
import { isBrowser, isMobile } from 'react-device-detect';
import './table2.css'



let map = null;
let lat = 0;
let lon = 0;
let centerlon;// the center longitude of map
let centerlat; // the center latitude of map
let csvfile = "classes.csv";

let savepoint = [];
let markerpoint;
let accuracyarray = []
let markerfilterarray = [];//markers filtered by type names
let markernumber = []; //markers filtered by type names to be shwon in the table
let markerfilterarray2 = [];//markers filtered by accuracy
let markernumber2 = []; //markers filtered by accuracy to be shwon in the table

let number = 0; // the times of watching positions.If number is more than 10, watchposition() will stop
let acc = 0; // get the sum of accuracy
let id; // clear watchposition()
let acc2; // get the average of accuracy





const options = []; //store data from classes.csv
class NormalMap extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			longitude: 49.0, //Geolocation
			latitude: 8.42, //Geolocation
			selectedOption: null,
			pointcolor: null,
			markerpoint: null,
			addvisible: false, //the status of Drawer
			queryvisible: false
		}
		this.handleChange = this.handleChange.bind(this);

		this.Savepoint = this.Savepoint.bind(this);

	}
	//When the user choose the option in the drop-down menu, the type name will be bound by the handleChange event.
	handleChange = (selectedOption) => {
		this.setState({
				selectedOption
			}
		);
	}

	//show Drawer component when clicking the button "Adding current position"
	showDrawer = () => {
		this.setState({
			addvisible: true,
			selectedOption: null
		});
		document.getElementsByClassName('drawer-add')[0].style.display = "block";
		document.getElementsByClassName('drawer-add')[0].style.zIndex = "100"

		for(var i = 1; i <= 10; i++) {
			if($('#Longitude' + i).val() != 'undefined') {
				$('#Longitude' + i).val(' ')
				$('#Latitude' + i).val(' ')

			}

		}

		$('#Longitudemean').val(' ')
		$('#Latitudemean').val(' ')
		$('#watchNumber').val(' ')
		$('#Accuracymean').val(' ')
		$('#watchLatitude').val(' ')
		$('#watchLongitude').val(' ')
		$('#watchAccuracy').val(' ')
		$('#Accuracymean').val(' ')
		number = 0;
		lat = 0;
		lon = 0;
		acc = 0;
		acc2 = 0;

	};
	
	//Close Drawer Component of "Adding current position"
	onClose = () => {
		this.setState({
			addvisible: false
		});
		document.getElementsByClassName('drawer-add')[0].style.display = "none";
		navigator.geolocation.clearWatch(id)
	};
	
	//show Drawer component when clicking the button "Query" 
	showQuery = () => {
		this.setState({
			queryvisible: true,
		});

		document.getElementsByClassName('drawer-query')[0].style.display = "block"

	};
	
	//Close Drawer Component of "Query"
	onClose2 = () => {
		this.setState({
			queryvisible: false
		});
		document.getElementsByClassName('drawer-query')[0].style.display = "none"
	};

	//read classes.csv
	Readclasses = () => {
		fetch(csvfile)
			.then(response => response.text())
			.then(responseText => {
				// -- parse csv
				var data = Papa.parse(responseText);
				for(var i = 1; i <= data.data.length; i++) {
					var label_str = data.data[i][1].substring(2, data.data[i][1].length - 1);
					var color_str = data.data[i][3].slice(-8, -1)
					var optionitem = {
						id: data.data[i][0],
						label: label_str,
						value: label_str,
						color: color_str
					}
					options.push(optionitem)
				}
			});

	}
	
	//Load map when online
	Loadmaponline = (centerlon, centerlat) => {
		window.map = L.map('normal-map', {
			center: [centerlon, centerlat],
			zoom: 13,
			layers: [
				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 19,
					attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>'
				})
			]
		})
		//mark the current position
		let now_marker = L.circleMarker(new L.LatLng(this.state.longitude, this.state.latitude), {
			color: '#000',
			weight: 5,
			opacity: 1,
			fillColor: '#00e400',
			fillOpacity: 0.5,
			radius: 10,
		}).addTo(window.map);

		//Add markers which are control points selected.
		if(window.markersarrayall.length != 0) {
			for(var i = 0; i < window.markersarrayall.length; i++) {
				var content = "<b>Point Number</b>   " + (i + 1) + "<br /><b>Longitude</b>   " + window.pointsarrayall[i][0].Longitude +
					"<br /><b>Latitude</b>   " + window.pointsarrayall[i][0].Latitude +
					"<br /><b>Type name</b>   " + window.pointsarrayall[i][0].Typename +
					"<br /><b>Accuracy</b>   " + window.pointsarrayall[i][0].Accuracy
				window.markersarrayall[i].addTo(window.map).bindPopup(content).openPopup();
			}
		}
		


	}
	
	//Load map when offline
	Loadmapoffline = (centerlon, centerlat) => {
		console.log('load offline')
		this.map = L.map('normal-map', {
			center: [centerlon, centerlat],
			zoom: 13,
			layers: [
				L.tileLayer('./karlsruhe/{z}/{x}/{y}.png', {
					minZoom: 7,
					maxZoom: 18,
				})
			]
		});
		//mark the current position
		let now_marker = L.circleMarker(new L.LatLng(centerlon, centerlat), {
			color: '#000',
			weight: 5,
			opacity: 1,
			fillColor: '#00e400',
			fillOpacity: 0.5,
			radius: 10,
		}).addTo(this.map);

		//bug: when the page becomes offline,markers can not be shown on the map. 
		if(window.markersarrayall.length != 0) {
			for(var i = 0; i < window.markersarrayall.length; i++) {
				var content = "<b>Point Number</b>   " + (i + 1) + "<br /><b>Longitude</b>   " + window.pointsarrayall[i][0].Longitude +
					"<br /><b>Latitude</b>   " + window.pointsarrayall[i][0].Latitude +
					"<br /><b>Type name</b>   " + window.pointsarrayall[i][0].Typename +
					"<br /><b>Accuracy</b>   " + window.pointsarrayall[i][0].Accuracy
				window.markersarrayall[i].addTo(window.map).bindPopup(content).openPopup();
			}
		}
	}

	componentDidMount() {

		if(options.length == 0) {
			this.Readclasses()
		}
		
		// If the browser is online, Loadmaponline() will be used.
		if(navigator.onLine) {
			navigator.geolocation.watchPosition((position) => {
				this.state.longitude = parseFloat(position.coords.latitude)
				this.state.latitude = parseFloat(position.coords.longitude)
				this.Loadmaponline(this.state.longitude, this.state.latitude)
			}, (err) => {
				console.warn('ERROR(' + err.code + '): ' + err.message);

			}, {
				enableHighAccuracy: true,
				timeout: 5000,
				maximumAge: 600000
			})

		} 
		//If the browser is online, Loadmapoffline() will be used.
		else {
			//For mobile devices, Geolocation API can still be called, but for PCs which have no GPS, can not use Geolocation API.
			if(isMobile) {
				alert('offline!')
				navigator.geolocation.watchPosition((position) => {
				this.state.longitude = parseFloat(position.coords.latitude)
				this.state.latitude = parseFloat(position.coords.longitude)
				this.Loadmapoffline(this.state.longitude, this.state.latitude)

				}, (err) => {
					console.warn('ERROR(' + err.code + '): ' + err.message);

				}, {
					enableHighAccuracy: true,
					timeout: 5000,
					maximumAge: 600000
				})
			} else if(isBrowser) {			
				alert('offline! Can not get the current position now.')
				this.Loadmapoffline(this.state.longitude, this.state.latitude)
			}

		}
		
	}
	
	// Get the locations of ground control points.
	WatchPosition = () => {
		document.getElementById('watchposition').style.display = 'block'
		if(isMobile || navigator.onLine) {
			id = navigator.geolocation.watchPosition((position) => {
				//calculate ten times of the positions
				if(number < 10) {
					number = number + 1
					this.state.longitude = parseFloat(position.coords.latitude)
					this.state.latitude = parseFloat(position.coords.longitude)
					// points will be calculated only when the accuracy is less than 100 meters.
					if(position.coords.accuracy < 100) {
						accuracyarray.push(position.coords.accuracy)
						$("#watchLatitude").val(position.coords.latitude)
						$("#watchLongitude").val(position.coords.longitude)
						$("#watchAccuracy").val(position.coords.accuracy)
						$("#watchNumber").val(number)
						lat = lat + position.coords.latitude
						lon = lon + position.coords.longitude
						acc = acc + position.coords.accuracy;

					} else {
						alert('Accuracy is too low!')
					}
				} else {
					//Get the average of longitude, latitude and accuracy.
					$("#Accuracymean").val(acc / number);
					$("#Latitudemean").val(lat / number);
					$("#Longitudemean").val(lon / number);
					acc2 = (acc / number)
				}

			}, (err) => {
				console.warn('ERROR(' + err.code + '): ' + err.message);

			}, {
				enableHighAccuracy: true,
				timeout: 60*1000,
				maximumAge: 600000
			})

			if(number == 10) {
				navigator.geolocation.clearWatch(id)
			}

		} else {
			alert('Can not get position now!')
		}

	}
	
	//Save ground control points by markersarrayall and pointsarrayall
	Savepoint = () => {
		markerpoint = L.circleMarker(new L.LatLng($('#Latitudemean').val(), $('#Longitudemean').val()), {
			color: this.state.selectedOption.color,
			weight: 5,
			opacity: 1,
			fillColor: this.state.selectedOption.color,
			fillOpacity: 0.5,
			radius: 20,
		})
		window.markersarrayall.push(markerpoint)

		savepoint = [{
			Longitude: $('#Longitudemean').val(),
			Latitude: $('#Latitudemean').val(),
			Accuracy: acc2,
			Typename: this.state.selectedOption.value,
			Color: this.state.selectedOption.color,
			Group: window.groupname
		}]
		window.pointsarrayall.push(savepoint)
		var content = "<b>Point Number</b>   " + window.pointsarrayall.length + "<br /><b>Longitude</b>   " + savepoint[0].Longitude +
			"<br /><b>Latitude</b>   " + savepoint[0].Latitude +
			"<br /><b>Type name</b>   " + savepoint[0].Typename +
			"<br /><b>Accuracy</b>   " + savepoint[0].Accuracy
		markerpoint.addTo(window.map).bindPopup(content).openPopup();
	}

	//Filter points by type names
	TypeFilter = () => {
		document.getElementById('filtertable').style.display = "block"
		let tbody = document.querySelector('tbody');
		tbody.innerHTML = ''
		for(var i = 0; i < window.markersarrayall.length; i++) {
			window.map.removeLayer(window.markersarrayall[i])
			if(window.pointsarrayall[i][0].Typename == $('#filtertypename').val()) {
				window.markersarrayall[i].addTo(window.map)
				markerfilterarray.push(window.pointsarrayall[i][0])
				markernumber.push(i)
			}

		}

		for(let i = 0; i < markerfilterarray.length; i++) {
			let tr = document.createElement('tr')
			tr.innerHTML = `
        <td>${markernumber[i]+1}</td>
        <td>${markerfilterarray[i].Longitude}</td>
        <td>${markerfilterarray[i].Latitude}</td>
         <td>${markerfilterarray[i].Typename}</td>
         <td>${markerfilterarray[i].Accuracy}</td>
	`
			tbody.appendChild(tr)
		}
	}
	
	//Filter points by the minimum accuracy.
	AccuracyFilter = () => {
		document.getElementById('filtertable').style.display = "block"
		let tbody = document.querySelector('tbody');
		tbody.innerHTML = ''
		for(var i = 0; i < window.markersarrayall.length; i++) {
			window.map.removeLayer(window.markersarrayall[i])
			if(window.pointsarrayall[i][0].Accuracy < $('#filteraccuracy').val()) {
				window.markersarrayall[i].addTo(window.map)
				markerfilterarray2.push(window.pointsarrayall[i][0])
				markernumber2.push(i)
			}
		}

		for(let i = 0; i < markerfilterarray2.length; i++) {

			let tr = document.createElement('tr')

			tr.innerHTML = `
        <td>${markernumber2[i]+1}</td>
        <td>${markerfilterarray2[i].Longitude}</td>
        <td>${markerfilterarray2[i].Latitude}</td>
         <td>${markerfilterarray2[i].Typename}</td>
         <td>${markerfilterarray2[i].Accuracy}</td>
	`
			tbody.appendChild(tr)

		}

	}

	Cancelfilter = () => {
		for(var i = 0; i < window.markersarrayall.length; i++) {
			window.markersarrayall[i].addTo(window.map)
		}

	}

	render() {
		const {
			selectedOption
		} = this.state;

		return(
			<div style={{width: "60rem"}}>
		
   		<Button type="primary" onClick={this.showDrawer}>
        Add Current Position
        </Button>
        <Button type="primary" onClick={this.showQuery}>
        Query
        </Button>      
        <Drawer className="drawer-add"
          title="New Point"
          placement="right"
          closable={false}
          width="25rem"
          height="50rem"
          onClose={this.onClose}
          visible={this.state.addvisible}
          getContainer={false}
        >
        <p style={{'margin-top':'30px'}}>
        Type:
        </p>
        <Select clssName="select"
        value={selectedOption}
        onChange={this.handleChange}
        options={options}
      	/>
       	<input type="button" value="Watch Position" id="watch" onClick={this.WatchPosition}/>
        <div id='watchposition' style={{display:'none'}}>
		<p style={{'margin-top':'30px'}}>
        Longitude: <input type="text" id='watchLongitude' />
        </p>
        <p style={{'margin-top':'30px'}}>
        Latitude: <input type="text" id='watchLatitude' />
        </p>
        <p style={{'margin-top':'30px'}}>
        Accuracy: <input type="text" id='watchAccuracy' />
        </p>
        <p style={{'margin-top':'30px'}}>
        Number: <input type="text" id='watchNumber' />
        </p>      
        </div>
        <p>
        </p>
         <p style={{'margin-top':'30px'}}>
        Longitude mean: <input type="text" id='Longitudemean' />
        </p>
        <p style={{'margin-top':'30px'}}>
        Latitude mean: <input type="text" id='Latitudemean' />
        </p>
        <p style={{'margin-top':'30px'}}>
        Accuracy mean: <input type="text" id='Accuracymean' />
        </p>
   		<input style={{'margin-top':'30px'}} type="button" value="Save" id="save" onClick={this.Savepoint}/>
   		<input style={{'margin-top':'30px','margin-left':'220px'}} type="button" value="Cancel" id="cancle" onClick={this.onClose}/> 
        </Drawer>       
        <Drawer className="drawer-query"
          title="Query"
          placement="right"
          closable={false}
          open={this.state.queryvisible}
          onClose={this.onClose2}
          width="25rem"
          getContainer={false}
          style={{display:'none'}}        
        > 
		 <p style={{'margin-top':'30px'}}>
        Type name <input type="text" id='filtertypename' />
        <input style={{'margin-top':'30px'}} type="button" value="Filter" id="filter" onClick={this.TypeFilter}/>
        </p>
         <p style={{'margin-top':'30px'}}>
       Accuracy<input type="text" id='filteraccuracy' />
        <input style={{'margin-top':'30px'}} type="button" value="Filter" id="filter" onClick={this.AccuracyFilter}/>
        </p>
        <input style={{'margin-top':'30px'}} type="button" value="Cancelfilter" id="cancelfilter" onClick={this.Cancelfilter}/>
        <input style={{'margin-top':'30px','margin-left':'220px'}} type="button" value="Cancel" id="cancle" onClick={this.onClose2}/> 
        <div>
        <table id="filtertable" style={{display:'none'}}>
			<thead>
				<tr>
					<th>Point Name</th>
					<th>Longitude</th>
					<th>Latitude</th>
					<th>Type Name</th>
					<th>Accuracy</th>
				</tr>
			</thead>
			<tbody>	
			</tbody>
		</table>        
        </div>        
        </Drawer> 
    	<div id="normal-map" style={{ height: '40rem',width: '66rem'}}>
    	</div>	
      	</div>
		);
	}
}
export default NormalMap;