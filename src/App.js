import React, {Component} from 'react'
import Navigation from './components/Navigation.js'
import View from './components/View.js'
import { HashRouter as Router } from "react-router-dom";
import db from './Database.js';
import { flatten } from './Helpers.js';

class App extends Component {

  constructor() {
    super()

    this.state = { 
      isLoading: true,
      recipes: []
    }

    db.table('recipes').toArray().then((recipes) => {
      let flatRecipes = []
      recipes.forEach((record) => {
        let flatRecord = flatten(record)
        flatRecipes.push(flatRecord)
      })
      flatRecipes = JSON.stringify(flatRecipes)
      this.setState({
        recipes: flatRecipes
      })
    })
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
              <View data={this.state.recipes} />
              <Navigation/>
            </Router>
          </div>
        </div>
      </div>
    )
  }
}

export default App;
