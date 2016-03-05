import React from 'react';
import LoginPanel from './LoginPanel';
import CatalogList from './CatalogList';
import PhotoList from './PhotoList';
import Term from './Term';

export default React.createClass({

  render() {
    return (
      <div>

        <div className="panel left">
          <LoginPanel />
          <CatalogList />
        </div>

        <div className="panel right">
          <PhotoList />
        </div>
      </div>
    );
  }
});

