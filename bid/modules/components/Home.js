import React from 'react';
import PhotoList from './PhotoList';
import CompleteUserDetails from './CompleteUserDetails';
import TopBar from './TopBar';
import About from './About';
import AppBar from 'material-ui/lib/app-bar';
import LeftPanel from './LeftPanel';
import FullImageView from './FullImageView';

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
      // photoData = photoData.slice(0,1)
      state = {
        photoData,
        user
      };

      state.category = photoData.categories[0];
      console.log(photoData);
    }


    state.openCompleteUserDetailsDialog = false;
    state.openAboutDialog = true;
    state.openLeftNav = false;
    state.openFullImageView = false;
    this.state = state;

  }

  componentDidMount() {
    window.addEventListener('resize', this.debounce(this.resizePhotoListGrid, 300));
    this.resizePhotoListGrid();
  }

  componentWillUpdate() {
  }

  debounce(func, wait, immediate) {
    let timeout;
    return ()=>{
      let context = this, args = arguments;
      let later = ()=>{
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      let callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  resizePhotoListGrid() {
    let column = Math.floor((window.innerWidth - 60)/250);
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

  toggleFullImageView({ open, pid }) {
    console.log('test');
    this.setState({
      openFullImageView: open,
      fullImageViewPID: pid
    });
  }

  toggleLeftNav(open) {
    // console.log('toggleLeftNav');
    let { openLeftNav } = this.state;
    openLeftNav = !openLeftNav;
    // if (open === undefined) {
    //   openLeftNav = !openLeftNav;
    // }
    // else {
    //   openLeftNav = open;
    // }
    this.setState({ openLeftNav });
  }

  toggleCategory(category) {
    // console.log('toggleCategory: ', category);
    this.setState({ category });
  }

  searchTermChanged(text) {
    this.setState({ searchTerm: text });
  }

  render() {
    let {
      photoData,
      category,
      cols,
      photoListWidth,
      openCompleteUserDetailsDialog,
      openAboutDialog,
      openLeftNav,
      openFullImageView,
      searchTerm
    } = this.state;

    let innerStyle = Object.assign({},styles.inner, { width: photoListWidth });
    return (

      <div>
        <AppBar
          title={category}
          iconClassNameRight="muidocs-icon-navigation-expand-more"
          onLeftIconButtonTouchTap={this.toggleLeftNav.bind(this)}
        />
        <LeftPanel
          items={photoData.categories}
          selectedCategory={category}
          open={openLeftNav}
          onRequestChange={this.toggleLeftNav.bind(this)}
          onTouchTap={this.toggleCategory.bind(this)}
        />

        <TopBar toggleAboutDialog={this.toggleAboutDialog.bind(this)} searchTermChanged={this.searchTermChanged.bind(this)}/>
        <div style={styles.container}>
          <div style={styles.inner}>
          </div>
        </div>
        <div style={styles.container} >
          <div style={innerStyle}>
              {category && <PhotoList
                            photoData={photoData}
                            category={category}
                            cols={cols}
                            width={photoListWidth}
                            searchTerm={searchTerm}
                            onClick={this.toggleFullImageView.bind(this)}
                            />}
          </div>
        </div>

        <CompleteUserDetails toggleDialog={this.toggleCompleteUserDetailsDialog.bind(this)} open={openCompleteUserDetailsDialog}/>
        <About toggleDialog={this.toggleAboutDialog.bind(this)} open={openAboutDialog} />
        <FullImageView pid={''} toggleDialog={this.toggleFullImageView.bind(this)} open={openFullImageView} />
      </div>
    );
  }
}

