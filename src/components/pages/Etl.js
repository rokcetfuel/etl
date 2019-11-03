import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
//import PageContent from './partials/PageContent.js'

class Etl extends Component {
  render() {
    return (
	    <div className="page page__etl">
      	<PageTitle title="Etl"/>
      	<div className="page-content">
          
          <div className="etl__home-buttons">
            <div className="etl__home-buttons__wrap">
        		  <button className="btn">Pełen proces ETL</button>
            </div>
            <div className="etl__home-buttons__wrap">
        		  <button className="btn">Krok po kroku</button>
            </div>
          </div>

      	</div>
    	</div>
    );
  }
}

export default Etl;
