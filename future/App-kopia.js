import React, {Component} from 'react'
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Navigation from './components/Navigation.js'
import View from './components/View.js'
import {BrowserRouter as Router} from "react-router-dom";

class App extends Component {

  config = {}

  state = {
    error: false,
    isLoading: true
  }

  componentDidMount() {
    //setTimeout(function() {this.setState({isLoading: false})}, 10000);
    //this.setState({isLoading: false})
    // Handle this for DATA loading
    // Might just move the Loader only for DATA page
    document.querySelector('.app__preloader').style.display = 'none'
  }

  renderContent() {
    return (this.state.error ? 
      (<div className="app__error"><p>Error!</p></div>):
      (<div className="app__content">
        <Router>
          {<View/>}
          {<Navigation/>}
        </Router>
      </div>)
    )
  }

  render() {
    return (
      <div className="app">
        <div className="app__container">
          <div className="app__content">
            <Router>
              {<View/>}
              {<Navigation/>}
            </Router>
          </div>
          /*{this.state.isLoading ? 
		        <Loader className="app__loader"
		         type="MutatingDots"
		         color="#000"
		         height={100}
		         width={100}
		        />
     			: this.renderContent()}*/
        </div>
      </div>
    )
  }
}

export default App;
