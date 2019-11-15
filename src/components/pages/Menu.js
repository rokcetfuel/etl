import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import db from '../../Database.js';
import { CSVLink } from "react-csv";
import { flatten } from '../../Helpers.js';

class Menu extends Component {

  constructor(props) {
    super(props);

    this.state = {
      alert: '',
      jsonDB: '',
      jsonReady: false,
      confirm: false
    }
  
    this.prepareExport = this.prepareExport.bind(this)
    this.exportCSV = this.exportCSV.bind(this)

    this.startReset = this.startReset.bind(this)
    this.doReset = this.doReset.bind(this)
    this.stopReset = this.stopReset.bind(this)
  }

  startReset() {
    this.setState({
      confirm: true,
      alert: '',
      jsonReady: false
    })
  }

  stopReset() {
    this.setState({
      confirm: false,
      alert: ''
    })
  }

  doReset() {
    db.recipes.clear()
    .then(() => {
      this.setState({
        alert: 'Database has been reset.',
        confirm: false
      });
    }).catch((err) => {
      this.setState({
        alert: 'Problem with the database reset. Try again.',
        confirm: false
      });
    });
  }

  prepareExport() {

    this.setState({
      confirm: false
    })

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

          {this.state.confirm ?
            <div className="menu__reset-db">
              <div className="menu__button-wrap">
                <button className="btn" disabled>Reset database</button>
              </div>
              <div className="menu__confirm">
                <div className="menu__confirm-wrap">
                  <span>Are you sure?</span>
                  <div className="menu__confirm-buttons">
                    <button className="btn" onClick={this.doReset}>Yes</button>
                    <button className="btn" onClick={this.stopReset}>No</button>
                  </div>
                </div>
              </div>
            </div>
          :
          <div className="menu__reset-db">
            <div className="menu__button-wrap">
              <button className="btn" onClick={this.startReset}>Reset database</button>
            </div>
          </div>
          }

          {this.state.jsonReady ? 
            <div className="menu__export-csv">
              <div className="menu__button-wrap">
                <button className="btn" disabled>Generate CSV</button>
              </div>
              <div className="menu__confirm">
                <div className="menu__confirm-wrap">
                  <span>Generated the CSV file.</span>
                  <div className="menu__confirm-buttons">
                    <CSVLink onClick={this.exportCSV} data={this.state.jsonDB} filename={"data.csv"} className="btn">Download</CSVLink>
                  </div>
                </div>
              </div>
            </div>
          : 
            <div className="menu__export-csv">
              <div className="menu__button-wrap">
                <button className="btn" onClick={this.prepareExport}>Generate CSV</button>
              </div>
            </div>
          }

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
