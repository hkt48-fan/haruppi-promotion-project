import React from 'react';
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
    width: 1200
  }
};

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    let state = {};
    console.log('init in client?');
    if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
      let { photoData, user } = window.__INITIAL_STATE__;
      state = {
        photoData,
        user
      };
    }

    state.openCompleteUserDetailsDialog = false;
    state.openAboutDialog = true;
    this.state = state;

  }

  componentDidMount() {
    // console.log('componentDidMount');
    // window.addEventListener('resize', ()=>{
    //   console.log('onresise');
    // });
  }

  componentWillUpdate() {
    console.log('componentWillUpdate');
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
    this.setState({ openAboutDialog: open });
  }

  render() {
    let { photoData, openCompleteUserDetailsDialog, openAboutDialog } = this.state;
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

