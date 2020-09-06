import React, { Component } from 'react';
import Select from 'react-select';
import { Button } from 'reactstrap';
import { Stop, Stops } from './MetraStop';

export default class MetraForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiDidRespond: false,
      stops: [],
      destinations: [],
      selectedDepartureId: "",
      selectedDestinationId: "",
      destinationDisabled: true,
      submitDisabled: true,
      fade: false,
      stopTimesDidRespond: false,
      stopsWithTimes: []
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
        var stopValues = [];

        Object.entries(res).map((stop, i) => {

          // label is stop name, value is stop id
          return stopValues.push({ label: stop[1], value: stop[0] })
        })

        this.setState({
          apiDidRespond: true,
          destinations: stopValues,
          selectedDepartureId: e.value,
          destinationDisabled: false
        })
      })
  }

  handleDestination = (e) => {
    this.setState({
      selectedDestinationId: e.value,
      submitDisabled: false,
    })
  }

  submit() {
    fetch("https://localhost:44334/metra/stoptimes", {
      method: 'POST',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        selectedDepartureId: this.state.selectedDepartureId,
        selectedDestinationId: this.state.selectedDestinationId,
      })

    })
      .then(res => res.json())
      .then(res => {
        this.setState({
          stopTimesDidRespond: true,
          stopsWithTimes: res
        })
      });
  }


  render() {
    const { fade } = this.state;

    let formElement = document.getElementsByClassName("form-container")[0]
    console.log(formElement);

    return (
      <div>
        {!this.state.stopTimesDidRespond && 


        <form 
          className="form-container"
          onSubmit={(e) => {
            this.setState({
              fade: true,
            });
            this.submit();
            e.preventDefault();
          }}
          onAnimationEnd={() => this.setState({fade: false})}
          className={fade ? 'fade' : ''}>

          <Select 
            onChange={this.handleDeparture}
            placeholder="Select Departure..."
            options={this.state.stops}
          />


          <Select 
            placeholder="Select Destination..."
            onChange={this.handleDestination}
            options={this.state.destinations}
            isDisabled={this.state.destinationDisabled}
          />


          <Button 
            className="submit-stops" 
            color="success"
            disabled={this.state.submitDisabled}
          >Pick Times</Button>

        </form>


        }
        
        {/* Once the correct  metra times come in, we need to map and display them */}
        {this.state.stopTimesDidRespond &&
        <Stops stopsWithTimes={this.state.stopsWithTimes} />
        }

      </div>
    )
  }
}
