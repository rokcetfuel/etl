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
      resetReady: false
    }
  
    this.startExport = this.startExport.bind(this)
    this.doExport = this.doExport.bind(this)
    this.startReset = this.startReset.bind(this)
    this.doReset = this.doReset.bind(this)
    this.comeBack = this.comeBack.bind(this)
  }

  comeBack() {
    this.setState({
      resetReady: false,
      alert: '',
      jsonReady: false
    })
  }

  startReset() {
    this.setState({
      resetReady: true,
      alert: '',
      jsonReady: false
    })
  }

  doReset() {
    db.delete()
    .then(() => db.open())
    .then(() => {
      this.setState({
        alert: 'Database has been reset.',
        resetReady: false
      });
    }).catch((err) => {
      this.setState({
        alert: 'Problem with the database reset. Try again.',
        resetReady: false
      });
    });
  }

  startExport() {
    this.setState({resetReady: false})

    db.recipes.toArray().then((jsonDB) => {
      let flatDBArray = [];

      jsonDB.forEach((record) => {
        let newRecord = flatten(record);
        flatDBArray.push(newRecord);
      });

      this.setState({
        jsonDB: flatDBArray,
        jsonReady: true
      })
    });
  }

  doExport() {
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

          {this.state.resetReady ?
            <div className="menu__reset-db">
              <div className="menu__button-wrap">
                <button className="btn" disabled>Reset database</button>
              </div>
              <div className="menu__confirm">
                <div className="menu__confirm-wrap">
                  <span>Are you sure?</span>
                  <div className="menu__confirm-buttons">
                    <button className="btn" onClick={this.doReset}>Yes</button>
                    <button className="btn" onClick={this.comeBack}>No</button>
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
                  <span>Generated the CSV file. Download?</span>
                  <div className="menu__confirm-buttons">
                    <CSVLink onClick={this.doExport} data={this.state.jsonDB} filename={"data.csv"} className="btn">Yes</CSVLink>
                    <button className="btn" onClick={this.comeBack}>No</button>
                  </div>
                </div>
              </div>
            </div>
          : 
            <div className="menu__export-csv">
              <div className="menu__button-wrap">
                <button className="btn" onClick={this.startExport}>Generate CSV</button>
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
