import React from 'react';

// import { IndexLink, Link } from 'react-router'
// import Title from 'react-title-component'

export default React.createClass({
  render() {
    // console.log('appjsx');
    // console.log(this.props);
    // console.log(this.state);
    return (
      <div>

        {this.props.children}
      </div>
    );
  }
});

