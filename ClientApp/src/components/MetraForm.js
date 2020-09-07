import React, { Component } from 'react';
import Select from 'react-select';
import { Button } from 'reactstrap';
import { Stop, Stops } from './MetraStop';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlaneArrival, faPlaneDeparture, faRandom } from "@fortawesome/free-solid-svg-icons";

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
      stopsWithTimes: [],
      destinationIsSwapped: true,
    }
  }

  // start by getting all stop names with the stop ids
  componentDidMount() {
    fetch("/metra/stops")
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
    fetch("/metra/destinations", {
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
          destinationDisabled: false,

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
    fetch("/metra/stoptimes", {
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
      })
      .catch(err => console.log(err));
  }


  swapDestinations = () => {
    const currentDeparture = this.state.selectedDepartureId;
    const currentDestination = this.state.selectedDestinationId;
    const isSwapped = this.state.destinationIsSwapped;
    this.setState({
      destinationIsSwapped: !isSwapped,
      selectedDepartureId: currentDestination,
      selectedDestinationId: currentDeparture
    })
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
        <div>
          <div className="destinations-container">
            <Button 
              className="destination-button"
              disabled={true}
            >{this.state.stopsWithTimes[0].destination_name}</Button>
            <Button onClick={this.swapDestinations} >
              <FontAwesomeIcon 
                size='1x' 
                className="swap-destination-icon" 
                
                icon={faRandom} 
              />

            </Button>
            <Button 
              className="destination-button"
              disabled={true}
            >{this.state.stopsWithTimes[0].departure_name}</Button>

          </div>
          <Stops 
            stopsWithTimes={this.state.destinationIsSwapped 
              ? this.state.stopsWithTimes.filter(s => s.departure_id == this.state.selectedDepartureId)
              : this.state.stopsWithTimes.filter(s => s.departure_id == this.state.selectedDestinationId)
            } 
          />

        </div>
        }

      </div>
    )
  }
}
