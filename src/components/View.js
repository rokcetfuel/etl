import React, {Component} from 'react'
import {Switch, Route, Redirect} from "react-router-dom"
import Etl from './pages/Etl.js'
import Menu from './pages/Menu.js'
import Data from './pages/Data.js'

class View extends Component {

  render() {
    return (
	    <Switch>
	      <Route path="/home">
	        <Etl/>
	      </Route>
	      <Route path="/menu">
	        <Menu />
	      </Route>
	      <Route path="/data">
	        <Data/>
	      </Route>
	      <Redirect from="/" to="/home" />
	    </Switch>
    );
  }
}

export default View;
