import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import MediaQuery from 'react-responsive';
import MobileHome from './MobileHome';

export class Layout extends Component {
  static displayName = Layout.name;

  componentDidMount() {
    console.log(window.outerHeight);
    console.log(window.outerWidth);
  }


  render () {

    return (
      <div className="app">
        <MediaQuery query="(max-width: 376px)">
          <MobileHome/>
        </MediaQuery>

        <MediaQuery query="(min-width: 376px)">
          <p>This application currently only supports mobile browsers.</p>
          <p>Please resize your browser to less that 376px wide.</p>
        </MediaQuery>

        <Container>
          {this.props.children}
        </Container>
      </div>
    );
  }
}
