import React, { Component } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { Overlay } from 'react-portal-overlay';
import DateForm from './DateForm';
import { AnimatedList } from 'react-animated-list';
import { faPlaneArrival, faPlaneDeparture, faRandom, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Container, Button } from 'reactstrap';
import ScrollArea from 'react-scrollbar';

library.add(faPlaneArrival, faPlaneDeparture, faRandom);

export default class Stop extends Component {
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

export class Stops extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isStopSelected: false,
      selectedStop: [],
      userSelectedDate: false
    }
  }

  setSelectedStop(stop) {
    this.setState({
      selectedStop: stop,
      isStopSelected: true
    })
  }

  displayDate = () => {
    console.log("date function")
  }

  toggleOverlay = () => {
    this.setState({
      isStopSelected: !this.state.isStopSelected
    })
  }

  displayDate = () => {
    console.log("clicked");
    this.setState({
      userSelectedDate: !this.state.userSelectedDate
    });
  }

  render() {
    const currentTime = new Date().getTime();
    const parsedDatesToday = this.props.stopsWithTimes.filter(s => s.runs_today == true && Date.parse(s.departure_time) > Date.parse(currentTime))
    return (
      <div>
        <div className="button-container">
          <button 
            className="btn btn-secondary nav-button"
            onClick={this.displayDate}
          >Today</button>
          <button
            className="btn btn-secondary nav-button"
            onClick={this.displayDate}
          >Select Date</button>

        </div>

        <div className="stop-container">
          {!this.state.userSelectedDate
            ?
            <AnimatedList
              animation={"fade"}
              initialAnimationDuration={1000}
            >
              {parsedDatesToday.length > 0 ? <p className="date-tag">Today</p> : <p></p>}

              {parsedDatesToday.map((stop, i) => {
                return <div key={`div[${i}]`} className="stop-area" onClick={() => this.setSelectedStop(stop)}>
                  <Stop
                    key={i}
                    index={i}
                    stop={stop}
                  />
                </div>
              })}
              <p className="date-tag">Tomorrow</p>
              {this.props.stopsWithTimes.filter(s => s.runs_tomorrow == true).map((stop, i) => {
                return <div key={`div[${i}]`} className="stop-area" onClick={() => this.setSelectedStop(stop)}>
                  <Stop
                    key={i}
                    index={i}
                    stop={stop}
                  />

                </div>
              })}
            </AnimatedList>

            :
            <DateForm stop={this.props.stopsWithTimes[0]}/>


          }

        </div>

        <div className="information-tag">
          <FontAwesomeIcon
            icon={faInfoCircle}
          />
          <span>Select a stop for more information.</span>
        </div>
        <div>
          {this.state.isStopSelected &&
            <StopOverlay showOverlay={this.toggleOverlay} stop={this.state.selectedStop} />
          }
        </div>
      </div>

    )
  }
}

export class StopOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOverlay: true,
      stopInformation: []
    }
    fetch(`/metra/selected-trip-stops/${this.props.stop.trip_id}`, {
      method: 'POST',
      headers: {
        "Acess-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      }
    })

      .then(res => res.json())

      .then(res => {
        this.setState({
          stopInformation: res
        })
        console.log(this.state.stopInformation)
      })
  }


  toggle = () => {
    this.setState({
      showOverlay: !this.state.showOverlay
    })
  }

  render() {
    return (
      <Overlay
        open={this.state.showOverlay}
        onBlur={this.props.showOverlay}
      >
        <div className="overlay-container">
          <p>{this.props.stop.trip_id}</p>
          <p>Center Boarding: {this.state.stopInformation.center_boarding}</p>
          <Button className="btn-secondary" onClick={this.props.showOverlay}> close </Button>

        </div>
      </Overlay>
    );
  }
}