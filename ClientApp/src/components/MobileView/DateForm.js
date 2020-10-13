import React, { Component } from 'react';
import Stop from './MetraStop';
import { AnimatedList } from 'react-animated-list';

export default class DateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stopsOnDate: [],
      apiDidRespond: false
    };
  }


  setSelectedStop(stop) {
    this.setState({
      selectedStop: stop,
      isStopSelected: true
    })
  }


  getStops = (e) => {
    this.setState({
      apiDidRespond: false
    })
    const stop = this.props.stop;


    fetch('/metra/stopsbydate', {
      method: 'POST',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        selectedDepartureId: stop.departure_id,
        selectedDestinationId: stop.destination_id,
        selectedDate: e.target.value
      })
    })
      .then(res => res.json())
      .then(res => this.setState({
        stopsOnDate: res,
        apiDidRespond: true
      }))
      .then(res => console.log(this.state.stopsOnDate))

  }


  render() {
    return (

      <div className="date-form">
        <input
          className="form-control"
          onChange={this.getStops}
          type="date"
          placeholder="Select Date..."
        />
        {this.state.apiDidRespond &&
          <AnimatedList
            animation={"fade"}
            initialAnimationDuration={1000}
          >
            {this.state.stopsOnDate.map((stop, i) => {
              return <div key={`div[${i}]`} className="stop-area" onClick={() => this.setSelectedStop(stop)}>
                <Stop
                  key={i}
                  index={i}
                  stop={stop}
                />
              </div>
            })}
          </AnimatedList>
        }

      </div>

    )
  }
}

