import React, {Component} from 'react'
import Navigation from './components/Navigation.js'
import View from './components/View.js'
import {BrowserRouter as Router} from "react-router-dom";
import db from './Database.js';

class App extends Component {

  constructor() {
    super();
    this.state = { 
      error: false,
      isLoading: true,
      recipes: [],
      name: 'lol'
    };
  }

  componentDidMount() {
    document.querySelector('.app__preloader').style.display = 'none'

    db.table('recipes').toArray().then((recipes) => {
      this.setState({ recipes });
    });
  }

  render() {

    let data = JSON.stringify(this.state.recipes);

    return (
      <div className="app">
        <div className="app__container">
          <div className="app__content">
            <Router>
              <View data={data} />
              <Navigation/>
            </Router>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
