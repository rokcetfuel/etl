import React, {Component} from 'react'
import Navigation from './components/Navigation.js'
import View from './components/View.js'
import { HashRouter as Router } from "react-router-dom";

class App extends Component {

  constructor() {
    super()

    this.state = { 
      isLoading: true
    }
  }

  componentDidMount() {
    document.querySelector('.app__preloader').style.display = 'none'
  }

  render() {
    return (
      <div className="app">
        <div className="app__container">
          <div className="app__content">
            <Router>
              <View/>
              <Navigation/>
            </Router>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
