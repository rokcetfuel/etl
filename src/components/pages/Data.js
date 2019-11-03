import React, {Component} from 'react'
import PageTitle from './partials/PageTitle.js'
import PageContent from './partials/PageContent.js'

class Data extends Component {
	
  render() {

  	let data = this.props.data

    return (
	    <div className="page page__data">
        	<PageTitle title="Data"/>
        	<PageContent data={data} />
      	</div>
    );
  }
}

export default Data;
