import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import MaterialTable from "material-table";
import db, { keys } from '../../Database.js';
import { flatten } from '../../Helpers.js';

class Data extends Component {

  constructor(props) {
    super(props)

    this.state = { 
      isFetching: true,
      tableHeaders: keys,
      tableData: []
    }

    this.handleAddRecipe = this.handleAddRecipe.bind(this)
    this.loadTable = this.loadTable.bind(this)
  }

  componentDidMount() {
    db.table('recipes').toArray().then((recipes) => {
      let flatRecipes = []
      recipes.forEach((record) => {
        let flatRecord = flatten(record)
        flatRecipes.push(flatRecord)
      })
      flatRecipes = JSON.stringify(flatRecipes)
      this.setState({
        tableData: flatRecipes,
        isFetching: false
      })
    })
  }

  handleAddRecipe(recipeTitle) {
    let recipe = {
      title: recipeTitle,
      recipe_id: 2,
      cuisine: 'Chinese',
      time: {
        cook: 5,
        prepare: 5,
        all: 10
      }
    }
    db.table('recipes').add(recipe).then((id) => {
      console.log('Added.')
    })
  }

  loadTable() {

    let tableData = JSON.parse(this.state.tableData)
    return (
      <MaterialTable 
        options = {{
          pageSize: 25,
          pageSizeOptions: [25, 50, 100],
          toolbar: false,
          headerStyle: {
            fontWeight: '700'
          }
        }}
        columns = {this.state.tableHeaders}
        data = {tableData}
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

            <button className="btn" onClick={() => this.handleAddRecipe('Hot Pot')}>Add test data to DB</button>
          </div>
      	</div>
    );
  }
}

export default Data;
