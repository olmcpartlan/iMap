import React, { Component } from 'react';
import Select from 'react-select';
import { Button } from 'reactstrap';

export default class MetraForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiDidRespond: false,
      stops: [],
      selectedDepartureId: "",
      selectedDestinationId: ""
    }
  }

  // start by getting all stop names with the stop ids
  componentDidMount() {
    fetch("https://localhost:44334/metra/stops")
      .then(res => res.json())
      .then(res => {
        var stopValues = [];

        Object.entries(res).map((stop, i) => {

          // label is stop name, value is stop id
          return stopValues.push({ label: stop[1], value: stop[0] })
        })

        this.setState({
          apiDidRespond: true,
          stops: stopValues
        })
      })


  }

  handleDeparture = (e) => {
    this.setState({
      selectedDepartureId: e.value
    })

    fetch("https://localhost:44334/metra/destinations", {
      method: 'POST',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        departureId: e.value
      })

    })
      .then(res => res.json())
      .then(res => {
        console.log(this.state.selectedDepartureId)
      })
  }

  handleDestination = (e) => {
    this.setState({
      selectedDestinationId: e.value
    })
  }

  submit = () => {
    fetch("https://localhost:44334/metra/stoptimes", {
      method: 'POST',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        selectedDepartureId: this.state.selectedDepartureId,
        selectedDestinationId: this.state.destinationId,
      })

    })
      .then(res => res.json())
      .then(res => console.log(res))
  }


  render() {

    return (
        <div className="form-container">
          <Select 
            onChange={this.handleDeparture}
            placeholder="Select Departure..."
            options={this.state.stops}
          />


          <Select 
            placeholder="Select Destination..."
            onChange={this.handleDestination}
          />

          <Button 
            className="submit-stops" 
            color="success"
            onClick={this.submit}
          >Pick Times</Button>


        </div>

    )
  }
}