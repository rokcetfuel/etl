import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import db from '../../Database.js';
import { CSVLink } from "react-csv";
import { flatten } from '../../Helpers.js';

class Menu extends Component {

  state = {
    alert: '',
    jsonDB: '',
    jsonReady: false
  }

  constructor(props) {
    super(props);
    this.resetDB = this.resetDB.bind(this)
    this.prepareExport = this.prepareExport.bind(this)
    this.exportCSV = this.exportCSV.bind(this)
  }

  resetDB() {
    let confirmDbReset = window.confirm('Are you sure you want to reset the database?')
    if (confirmDbReset) {
      this.setState({
        alert: ''
      });
      db.recipes.clear().then(() => {
        this.setState({
          alert: 'Database has been reset.'
        });
      }).catch((err) => {
        this.setState({
          alert: 'There was a problem with resetting the database.'
        });
      });
    } else {
      this.setState({
        alert: ''
      });
    }
  }

  prepareExport() {
    db.recipes.toArray().then((jsonDB) => {
      let newArray = [];

      jsonDB.forEach((record) => {
        let newRecord = flatten(record);
        newArray.push(newRecord);
      });

      console.log(newArray)

      this.setState({
        jsonDB: newArray,
        jsonReady: true
      })
    });
  }

  exportCSV() {
    this.setState({
      alert: '',
      jsonReady: false
    });
  }

  render() {
    return (
	    <div className="page page__menu">
      	<PageTitle title="Menu"/>
        <div className="page-content">
          <div className="menu__buttons">
            <div className="menu__button-wrap">
              <button className="btn" onClick={this.resetDB}>Reset database</button>
            </div>
            <div className="menu__button-wrap">
              <button className="btn" onClick={this.prepareExport}>Generate CSV</button>
            </div>
            <div className="menu__button-wrap">
              {this.state.jsonReady ? 
                <CSVLink onClick={this.exportCSV} data={this.state.jsonDB} filename={"data.csv"} className="btn">Download</CSVLink>
              : '' }
            </div>
          </div>
          <div className="menu__alerts">
            <div className="menu__alert-wrap">
              {this.state.alert}
            </div>
          </div>
        </div>
    	</div>
    );
  }
}

export default Menu;
