import React, { Component } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { AnimatedList } from 'react-animated-list';
import { faPlaneArrival, faPlaneDeparture, faRandom } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Container, Button } from 'reactstrap';
import ScrollArea from 'react-scrollbar';

library.add(faPlaneArrival, faPlaneDeparture, faRandom);

export class Stops extends Component {
  componentDidMount() {
    console.log(this.props.stopsWithTimes)
  }

  render() {
    const stops = this.props.stopsWithTimes
    return (
      <div>


        <AnimatedList
          animation={"fade"}
          initialAnimationDuration={1000}
        >
          {this.props.stopsWithTimes.map((stop, i) => {
            return <Stop key={i} index={i} stop={stop} />
          })}

        </AnimatedList>

      </div>
    )
  }
}

export class Stop extends Component {
  render() {
    try
    {
      const stop = this.props.stop;
      return (

        <div className="stop-card">
          <Row>
            <Col xs="6" className="stop-card-time">
              <FontAwesomeIcon icon={faPlaneArrival} />
              <label>{stop.departure_time}</label>
              <p>{stop.departure_name}</p>
            </Col>

            <Col>
              <FontAwesomeIcon icon={faPlaneDeparture}/>
              <label>{stop.destination_time}</label>
              <p>{stop.destination_name}</p>
            </Col>
          </Row>
        </div>

    ) 
    } catch(e) {
      console.log(e)

    }
  }
}