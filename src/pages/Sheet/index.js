import React from 'react'
import L from 'leaflet';
import './table.css';
import $ from 'jquery';
import Papa from 'papaparse';
import Select from 'react-select';
const options = [];
let markerpoint;
let lat;
let lon;
let color;
let csvfile = "classes.csv";
class Sheet extends React.Component {

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

	componentDidMount() {
		this.Readclasses()
		let tbody = document.querySelector('tbody')
		
		//render the table
		function render() {
			tbody.innerHTML = ''
			for(let i = 0; i < window.pointsarrayall.length; i++) {
				let tr = document.createElement('tr')

				tr.innerHTML = `
        <td>${i+1}</td>
        <td>${window.pointsarrayall[i][0].Longitude}</td>
        <td>${window.pointsarrayall[i][0].Latitude}</td>
         <td><input value="${window.pointsarrayall[i][0].Typename}" readonly="true"></input></td>
        <td>${window.pointsarrayall[i][0].Accuracy}</td>
        <td>

          <a href="javascript:" id="${i}" class="delete">delete</a>
          <a href="javascript:" id="${i}" class="modify">modify</a>
          <a href="javascript:" id="${i}" class="save">save</a>
        </td>
					`

				tbody.appendChild(tr)

			}

		}

		render()

		tbody.addEventListener('click', function(e) {

			if(e.target.className == 'delete') {
				window.pointsarrayall.splice(e.target.id, 1)
				window.markersarrayall.splice(e.target.id, 1)

				render()
			} else if(e.target.className == 'modify') {

				var inp = this.parentNode.parentNode.getElementsByTagName("input");
				for(var i = 0, len = inp.length; i < len; i++) {
					inp[i].readOnly = false;
				}

			} else if(e.target.className == 'save') {
				var inp = this.parentNode.parentNode.getElementsByTagName("input");

				for(var i = 0, len = inp.length; i < len; i++) {

					inp[i].readOnly = true;
					window.pointsarrayall[i][0].Typename = inp[i].value;
					lat = window.pointsarrayall[i][0].Latitude;
					lon = window.pointsarrayall[i][0].Longitude;
					for(var j = 0; j < options.length; j++) {
						if(options[j].value == inp[i].value) {

							color = options[j].color

						}
					}

				}

				markerpoint = L.circleMarker(new L.LatLng(lat, lon), {
					color: color,
					weight: 5,
					opacity: 1,
					fillColor: color,
					fillOpacity: 0.5,
					radius: 20,
				})

				window.markersarrayall.splice(e.target.id, 1, markerpoint)

			}

		})

	}

	render() {
		return(
			<div>
          <table >
			<thead>
				<tr>
					<th>Point Name</th>
					<th>Longitude</th>
					<th>Latitude</th>
					<th>Type Name</th>
					<th>Accuracy</th>
					<th>Delete Operation</th>
				</tr>
			</thead>
			<tbody>	
			</tbody>
		</table>
      </div>
		);
	}
}
export default Sheet;