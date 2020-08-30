import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import MediaQuery from 'react-responsive';
import MobileHome from './MobileHome';

export class Layout extends Component {
  static displayName = Layout.name;


  render () {
    return (
      <div>
        <NavMenu />

        <MediaQuery query="(max-width: 375px)">
          <MobileHome/>
        </MediaQuery>

        <MediaQuery query="(min-width: 376px)">
          <p>large screen</p>
        </MediaQuery>

        <Container>
          {this.props.children}
        </Container>
      </div>
    );
  }
}
