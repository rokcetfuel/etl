import React, {Component} from 'react';
import db from '../../../Database.js';

class PageContent extends Component {

	handleAddTodo(title) {
		const todo = {
		  title: title,
		  rate: 4,
		  time: {
		  	cook: 10,
		  	prepare: 30,
		  	all: 40
		  }
		};
		db.table('recipes').add(todo).then((id) => {
	    console.log('yea');
	  });
  }


  render() {

  	let data = this.props.data

    return (
	    <div className="page-content">
	    	{data}
	    	<button onClick={this.handleAddTodo('hello')}>Add data to DB</button>
	    </div>
    );
  }
}

export default PageContent;
