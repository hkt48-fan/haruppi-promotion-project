import React from 'react';
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();
console.log('injected');

export default React.createClass({
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
});

