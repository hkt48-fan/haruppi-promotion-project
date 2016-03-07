import React from 'react';
import UserPanel from './UserPanel';
import SearchBar from './SearchBar';
import PhotoList from './PhotoList';
import CompleteUserDetails from './CompleteUserDetails';
import Term from './Term';
import TopBar from './TopBar';
import About from './About';


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
    let state = {}
    if (window && window.__INITIAL_STATE__) {
      let { photoData, user } = window.__INITIAL_STATE__;
      state = {
        photoData,
        user
      };
      // state.photoData = photoData;
      // this.user = user;
    }

    state.openCompleteUserDetailsDialog = false;
    state.openAboutDialog = true;
    this.state = state;

  }

  toggleCompleteUserDetailsDialog({ open }) {
    this.setState({
      openToggleCompleteUserDetailsDialog: open
    });
  }

  userLogin(user) {
    this.setState({
      user,
      completeUserDetailsOpen: true
    });
  }

  toggleAboutDialog({ open }) {
    // let { aboutOpen } = this.state;
    console.log('toggle open');
    console.log(open);
    this.setState({ openAboutDialog: open });
  }

  render() {
    // console.log('render home');
    // console.log(this.state);
    let { photoData, user, openCompleteUserDetailsDialog, openAboutDialog } = this.state;

    console.log('render....');
    console.log(openAboutDialog);
    return (

      <div>

        <TopBar toggleAboutDialog={this.toggleAboutDialog.bind(this)}/>

        <div style={styles.container}>

          <div style={styles.inner}>
          </div>
        </div>

        <div style={styles.container} >
          <div style={styles.inner}>
              <PhotoList photoData={photoData}/>
          </div>
        </div>


        <CompleteUserDetails toggleDialog={this.toggleCompleteUserDetailsDialog.bind(this)} open={openCompleteUserDetailsDialog}/>
        <About toggleDialog={this.toggleAboutDialog.bind(this)} open={openAboutDialog} />
      </div>


    );
  }
}

