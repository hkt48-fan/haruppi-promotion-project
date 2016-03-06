import React from 'react';
import UserPanel from './UserPanel';
import SearchBar from './SearchBar';
import PhotoList from './PhotoList';
import Term from './Term';

const styles = {
  container:{
    display: 'flex',
    'justifyContent': 'center'
  },
  inner:{
    display: 'flex',
    width: 1280
  },

}

export default class Home extends React.Component {
  constructor(props) {
    super(props)
    if (window && window.__INITIAL_STATE__) {
      let { photoData, user } = window.__INITIAL_STATE__;
      let state = {
        photoData,
        user
      };
      this.state = state;
      // state.photoData = photoData;
      // this.user = user;
    }
  }

  render() {
    // console.log('render home');
    // console.log(this.state);
    let { photoData, user } = this.state;

    return (

      <div>
        <div style={styles.container}>

          <div style={styles.inner}>
            <UserPanel user={user}/>

            <SearchBar />
          </div>
        </div>

        <div style={styles.container} >
          <div style={styles.inner}>
              <PhotoList photoData={photoData}/>
          </div>
        </div>
      </div>

    );
  }
}

