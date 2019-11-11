import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'

class Etl extends Component {
  render() {
    return (
	    <div className="page page__etl">
      	<PageTitle title="Etl"/>
      	<div className="page-content">
          
          <div className="etl__home-buttons">
            <div className="etl__home-buttons__wrap">
        		  <button disabled className="btn">Full ETL Process</button>
            </div>
            <div className="etl__home-buttons__wrap">
        		  <button disabled className="btn">ETL Step by step</button>
            </div>
          </div>

      	</div>
    	</div>
    );
  }
}

export default Etl;
