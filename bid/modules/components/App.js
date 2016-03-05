import React from 'react';
// import { IndexLink, Link } from 'react-router'
// import Title from 'react-title-component'

export default React.createClass({
  render() {
    return (
      <div>
        <h1>haruppi</h1>

        {this.props.children}
      </div>
    );
  }
});

