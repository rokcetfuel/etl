import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import db from '../../Database.js';
import { CSVLink } from "react-csv";

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
    this.flatten = this.flatten.bind(this)
  }

  flatten(data) {
    var result = {};
    function recurse(cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for (var i = 0, l = cur.length; i < l; i++)
            recurse(cur[i], prop + "[" + i + "]");
            if (l === 0) result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop + "_" + p : p);
            }
            if (isEmpty && prop) result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
  };


  resetDB() {
    let confirmDbReset = window.confirm('Na pewno chcesz zresetować bazę danych?')
    if (confirmDbReset) {
      this.setState({
        alert: ''
      });
      db.recipes.clear().then(() => {
        this.setState({
          alert: 'Baza danych została zresetowana.'
        });
      }).catch((err) => {
        this.setState({
          alert: 'Nie udało się wyczyścić bazy danych.'
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
        let newRecord = this.flatten(record);
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
              <button className="btn" onClick={this.resetDB}>Reset Bazy Danych</button>
            </div>
            <div className="menu__button-wrap">
              <button className="btn" onClick={this.prepareExport}>Wygeneruj CSV</button>
            </div>
            <div className="menu__button-wrap">
              {this.state.jsonReady ? 
                <CSVLink onClick={this.exportCSV} data={this.state.jsonDB} filename={"data.csv"} className="btn">Pobierz</CSVLink>
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
