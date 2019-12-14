import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import MaterialTable from "material-table";
import db, { keys } from '../../Database.js';

class Data extends Component {

  constructor(props) {
    super(props)

    this.state = { 
      isFetching: true,
      tableHeaders: keys,
      tableData: []
    }

    this.loadTable = this.loadTable.bind(this)
    this.saveToTxt = this.saveToTxt.bind(this)
  }

  componentDidMount() {
    db.table('recipes').toArray().then((recipes) => {
      let flatRecipes = JSON.stringify(recipes)
      this.setState({
        tableData: flatRecipes,
        isFetching: false
      })
    })
  }

  saveToTxt(e, row) {

    let textInput = JSON.stringify(row, null, 2)
    const element = document.createElement("a")
    const file = new Blob([textInput], {type: 'text/plain'})
    element.href = URL.createObjectURL(file)
    element.download = row.recipe_id + ".txt"
    document.body.appendChild(element)
    element.click()

  }

  loadTable() {
    let tableData = JSON.parse(this.state.tableData)
    return (
      <MaterialTable 
        options = {{
          pageSize: 20,
          pageSizeOptions: [20, 40, 60, 80, 100],
          headerStyle: {
            fontWeight: '700'
          }
        }}
        title = ''
        columns = {this.state.tableHeaders}
        data = {tableData}
        actions = {[
          {
            icon: 'save',
            tooltip: 'Get Text file',
            onClick: (e, row) => this.saveToTxt(e, row)
          }
        ]}
      />
    )
  }
	
  render() {
    return (
	    <div className="page page__data">
        	<PageTitle title="Data"/>
        	<div className="page-content">
            <div className="data__table">

              {this.state.isFetching ? 
                <div className="data__table-loading">
                  <span>Loading data...</span>
                </div>
              : 
                this.loadTable()
              }

            </div>
          </div>
      	</div>
    );
  }
}

export default Data;
