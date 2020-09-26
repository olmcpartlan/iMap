import React, { Component } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { AnimatedList } from 'react-animated-list';
import { faPlaneArrival, faPlaneDeparture, faRandom, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Container, Button } from 'reactstrap';
import ScrollArea from 'react-scrollbar';

library.add(faPlaneArrival, faPlaneDeparture, faRandom);

export class Stops extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStopSelected: false,
      selectedStop: []
    }
  }

  componentDidMount() {
    console.log(this.props.stopsWithTimes)
  }

  setSelectedStop(stop) {
    this.setState({
      selectedStop: stop,
      isStopSelected: true
    })
  }

  render() {
    return (
      <div>
        <div className="button-container">
          <button className="btn btn-secondary nav-button">Today</button>
          <button className="btn btn-secondary nav-button">Select Date</button>

        </div>
        <div className="stop-container">
          <AnimatedList
            animation={"fade"}
            initialAnimationDuration={1000}
          >
            {this.props.stopsWithTimes.map((stop, i) => {
              return <div key={`div[${i}]`} className="stop-area" onClick={() => this.setSelectedStop(stop)}>
                <Stop
                  className="stop-values"
                  key={i}
                  index={i}
                  stop={stop}
                />

              </div>
            })}
          </AnimatedList>

        </div>
        <div>
          <StopInfo isStopSelected={this.state.isStopSelected} stop={this.state.selectedStop} />
        </div>
      </div>

    )
  }
}

export class Stop extends Component {
  render() {
    try {
      const stop = this.props.stop;

      return (

        <div className="stop-card ">
          <div className="trip-id">
            <span>{stop.trip_id}</span>
          </div>
          <Row>
            <Col xs="6" className="stop-card-time">
              <FontAwesomeIcon icon={faPlaneArrival} />
              <label>{stop.departure_time}</label>
            </Col>

            <Col>
              <FontAwesomeIcon icon={faPlaneDeparture} />
              <label>{stop.destination_time}</label>
            </Col>
          </Row>
        </div>


      )
    } catch (e) {
      console.log(e)

    }
  }
}

export class StopInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allStopsInTrip: []
    }
  }

  // this is a problem
  componentDidUpdate(previous_props) {
    // if selected trip started, show the current location
    if (this.props.stop !== previous_props.stop) {
    fetch(`/metra/selected-trip-stops`, {
      body: JSON.stringify({
        trip_id: this.props.stop.trip_id,
      }),
      method: 'POST',
      headers: {
        "Acess-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    })

      .then(res => res.json())

      .then(res => this.setState({
        allStopsInTrip: res
      }));

      // this might loop infinitely
      console.log(this.state.allStopsInTrip.length);
    }

    const currentTime = `${new Date().toLocaleTimeString().split(':')[0]}:${new Date().toLocaleTimeString().split(':')[1]}`

    // need to get the trip headsign and final stop
    // then use the headisgn time to find out where the trip is currently at and next destination


  }

  render() {
    const isStopSelected = this.props.isStopSelected;
    const selectedStop = this.props.stop;


    const previousTrip = this.state.allStopsInTrip.filter(stop => stop.trip_id == selectedStop.trip_id);


    return (
      <div className="stop-info">
        {isStopSelected &&

          <Row>
            <h4>{selectedStop.trip_id}</h4>
          </Row>
        }

        {!isStopSelected &&

          <div>
            <FontAwesomeIcon
              icon={faInfoCircle}
            />
            <span>Select a stop for more information.</span>

          </div>

        }
      </div>
    );
  }


}