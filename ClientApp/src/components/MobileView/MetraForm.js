import React, { Component } from 'react';
import Spinner from 'react-bootstrap/Spinner'
import Select from 'react-select';
import { Button, Col, Row } from 'reactstrap';
import { Stop, Stops } from './MetraStop';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlaneArrival, faPlaneDeparture, faRandom } from "@fortawesome/free-solid-svg-icons";
import { withRouter } from 'react-router-dom';
import StopInfo from './StopInfo';
import { setConstantValue } from 'typescript';

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
      loadingMessage: "",
      departureMessage: "Loading all Metra Stops..."


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
    this.setState({
      loadingMessage: "Loading possible destinations...",
      destinationDisabled: false,
    })
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
          loadingMessage: "",

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
        console.log(res);
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

    console.log(currentDeparture)

  }

  render() {
    const { fade } = this.state;
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
            onAnimationEnd={() => this.setState({ fade: false })}
            className={fade ? 'fade' : ''}
          >
            <Select
              onChange={this.handleDeparture}
              className="station-select"
              placeholder="Select Departure..."
              options={this.state.stops}
              noOptionsMessage={() => "Loading Stations..."}
            />

            <Select
              placeholder="Select Destination..."
              className="station-select"
              onChange={this.handleDestination}
              options={this.state.destinations}
              isDisabled={this.state.destinationDisabled}
              noOptionsMessage={() => "Loading Destinations..."}
            />


            <Button
              className="submit-stops"
              color="secondary"
              disabled={this.state.submitDisabled}
            >Pick Times</Button>

          </form>


        }

        {/* Once the correct  metra times come in, we need to map and display them */}
        {this.state.stopTimesDidRespond &&
          <div>
            <div className="destinations-container">
              <Row>

                <Col className="destination-button">
                  {this.state.stopsWithTimes.filter(s => s.destination_id == this.state.selectedDestinationId)[0].departure_name}
                </Col>

                <Col className="swap-destination-icon">
                  <button onClick={this.swapDestinations} className="btn swap-button">
                    <FontAwesomeIcon
                      size='1x'
                      icon={faRandom}
                    />

                  </button>
                </Col>

                <Col className="destination-button" >
                  {this.state.stopsWithTimes.filter(s => s.destination_id == this.state.selectedDestinationId)[0].destination_name}
                </Col>

              </Row>
            </div>
            {!this.state.destinationIsSwapped &&

              <Stops
                stopsWithTimes={this.state.stopsWithTimes.filter(s => s.destination_id == this.state.selectedDestinationId)}
              />

            }
            {this.state.destinationIsSwapped &&

              <Stops
                stopsWithTimes={this.state.stopsWithTimes.filter(s => s.departure_id == this.state.selectedDepartureId)}
              />

            }



          </div>
        }

      </div>
    )
  }
}
