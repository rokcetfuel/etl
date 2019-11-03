import React, {Component} from 'react';

class PageTitle extends Component {
  render() {
    return (
	    <div className="page-title">
	    	<span className="page-title_span">{this.props.title}</span>
	    </div>
    );
  }
}

export default PageTitle;
