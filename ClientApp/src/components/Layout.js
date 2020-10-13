import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import MediaQuery from 'react-responsive';
import MobileHome from './MobileView/MobileHome';
import { Home } from './DesktopView/Home';

export class Layout extends Component {
  static displayName = Layout.name;


  render () {

    return (
      <div className="app">
        <MediaQuery query="(max-width: 500px)">
          <MobileHome/>
        </MediaQuery>

        <MediaQuery query="(min-width: 501px)">
          <Container className="desktop-container">
            <MobileHome/>

          </Container>
        </MediaQuery>

      </div>
    );
  }
}
