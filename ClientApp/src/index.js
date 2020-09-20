import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');

var noScroll = require('no-scroll');
 
// To turn off the document's scrolling
noScroll.on();
 

const rootElement = document.getElementById('root');

document.body.style.height = `${window.screen.height - 50}px`;

document.body.style.overflow = "auto";

ReactDOM.render(
  <BrowserRouter basename={baseUrl}>
    <App />
  </BrowserRouter>,
  rootElement);

registerServiceWorker();

