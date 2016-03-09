import React from 'react';
import PhotoList from './PhotoList';
import CompleteUserDetails from './CompleteUserDetails';
import TopBar from './TopBar';
import About from './About';
import _ from 'lodash';

const styles = {
  container:{
    display: 'flex',
    'justifyContent': 'center'
  },
  inner:{
    display: 'flex'
    // width: 1200
  }
};

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    let state = {};
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
    window.addEventListener('resize', _.bind(_.debounce(this.resizePhotoListGrid, 300),this));
    this.resizePhotoListGrid();
  }

  componentWillUpdate() {
  }

  resizePhotoListGrid() {
    let column = Math.floor((window.innerWidth - 100)/250);
    let width = column * 250;
    this.setState({ cols: column , photoListWidth: width });
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

  searchTermChanged(text) {
    this.setState({ searchTerm: text });
  }

  render() {
    let {
      photoData,
      cols,
      photoListWidth,
      openCompleteUserDetailsDialog,
      openAboutDialog,
      searchTerm
    } = this.state;

    let innerStyle = Object.assign({},styles.inner, { width: photoListWidth });
    return (

      <div>
        <TopBar toggleAboutDialog={this.toggleAboutDialog.bind(this)} searchTermChanged={this.searchTermChanged.bind(this)}/>
        <div style={styles.container}>
          <div style={styles.inner}>
          </div>
        </div>
        <div style={styles.container} >
          <div style={innerStyle}>
              <PhotoList photoData={photoData} cols={cols} width={photoListWidth} searchTerm={searchTerm}/>
          </div>
        </div>

        <CompleteUserDetails toggleDialog={this.toggleCompleteUserDetailsDialog.bind(this)} open={openCompleteUserDetailsDialog}/>
        <About toggleDialog={this.toggleAboutDialog.bind(this)} open={openAboutDialog} />
      </div>
    );
  }
}

