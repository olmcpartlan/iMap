import React, { Component } from 'react';
import { Row, Col, Button } from 'reactstrap';
import MetraForm from './MetraForm';
import CTAForm from '../CTAForm';

export default class MobileHome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showMetraForm: true,
      showCTAForm: false,

    }
  }
  componentDidMount() {
  }

  handleCTA = () => {
    console.log("CTA clicked");
    this.setState({
      showMetraForm: false,
      showCTAForm: true,
    })

  }

  handleMetra = () => {
    this.setState({
      showCTAForm: false,
      showMetraForm: true
    })

  }

  render() {
    return (
      <div>
        <Row>
          <Col>
            {/* 
          <Button
            className="train-type-button"
            color="primary"
            onClick={this.handleMetra}
          >Metra</Button>

          <Button
            className="train-type-button"
            color="danger"
            onClick={this.handleCTA}
            disabled={true}
          >CTA</Button>


        */}

            {this.state.showMetraForm &&
              <MetraForm />
            }

            {this.state.showCTAForm &&
              <CTAForm />
            }


          </Col>
        </Row>
      </div>
    )
  }

}