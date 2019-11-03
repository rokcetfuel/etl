import React, {Component} from 'react'
import {NavLink} from 'react-router-dom'
import iconBook from './../svg/book.svg'
import iconBolt from './../svg/bolt.svg'
import iconMenu from './../svg/menu.svg'

class Navigation extends Component {

  render() {
    return (
      <div className="app__navigation">
		    <div className="app__navigation-inner">

		      <div className="app__navigation-link">
			      <NavLink className="app__navigation-a" to="/menu">
			      	<img src={iconMenu} alt="Menu" />
			      </NavLink>
		      </div>

		      <div className="app__navigation-link">
			      <NavLink className="app__navigation-a" to="/etl">
			      	<img src={iconBolt} alt="Process" />
			      </NavLink>
		      </div>

		      <div className="app__navigation-link">
			      <NavLink className="app__navigation-a" to="/data">
			      	<img src={iconBook} alt="Data" />
			      </NavLink>
		      </div>

	      </div>
      </div>
    );
  }
}

export default Navigation;
