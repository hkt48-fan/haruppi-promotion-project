import React from 'react';
import PhotoList from './PhotoList';
import TopBar from './TopBar';
import AppBar from 'material-ui/lib/app-bar';
import LeftPanel from './LeftPanel';
import Title from 'react-title-component';

import About from './Dialogs/About';
import LoginModal from './Dialogs/LoginModal';
import FullImageView from './Dialogs/FullImageView';
import request from 'superagent';

import IconButton from 'material-ui/lib/icon-button';
import NavigationClose from 'material-ui/lib/svg-icons/navigation/close';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MoreVertIcon from 'material-ui/lib/svg-icons/navigation/more-vert';
import MenuItem from 'material-ui/lib/menus/menu-item';

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
      let { categories, photos } = photoData;
      state = {
        categories,
        photos,
        user
      };
      state.category = categories[0];
    }
    else {
      state.user = {};
    }

    state.openAboutDialog = false;
    state.openLeftNav = false;
    state.openFullImageView = false;
    state.openLoginModal = false;
    // state.searchTerm = '兒玉遥';

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

  userLogin({ uid, tid }) {
    request
      .post('/api/login')
      .send({ uid, tid, hello: 'hhh' })
      .end((err, res)=>{
        if (err) {
          console.log('request fail');
          console.log(err);
        }
        else if(res.body.result === 'ok') {
          let user = res.body.user;
          console.log('login success;', user);

          this.setState({
            user,
            openLoginModal: false
          });

        }
        else {
          console.log('login failed');
          let user = { loginFailed: true };
          this.setState({ user });
        }

        console.log(res.body);
      });


  }

  userLogout() {
    console.log('click logout');
    request
      .get('/api/logout')
      .end((err, res)=>{
        if (err) {
          console.log('logout fail');
          console.log(err);
        }
        else if(res.body.result === 'ok') {
          this.setState({ user: {} });
          console.log('logout succeed');

        }
      });
  }

  // toggleAboutDialog({ open }) {
  //   this.setState({ openAboutDialog: open });
  // }

  toggleAboutDialog() {
    let open = !this.state.openAboutDialog;
    this.setState({ openAboutDialog: open });
  }

  toggleLoginModal({ open }) {
    console.log('toggle login');
    let { user } = this.state;
    user.loginFailed = false;
    this.setState({
      user,
      openLoginModal: open
    });
  }

  toggleFullImageView(pid) {
    let { openFullImageView } = this.state;

    this.setState({
      openFullImageView: !openFullImageView,
      fullImageViewPID: pid
    });
  }

  toggleLeftNav() {
    let { openLeftNav } = this.state;
    openLeftNav = !openLeftNav;
    this.setState({ openLeftNav });
  }

  toggleCategory(category) {
    // console.log('toggleCategory: ', category);
    this.setState({ category });
  }

  handleBidClick(pid) {
    console.log('bid clicked', arguments);
    request
      .post('/api/transact')
      .send({ pid })
      .end((err, res)=>{
        if (err) {
          console.log(err);
        }
        else if(res.body.state === 0) {
          console.log('---------------');
          console.log(res.body);

          // update photodata
          let { stockStatus, pp } = res.body;
          let { photos, user } = this.state;
          photos.forEach((p, i)=>{
            let ss = stockStatus[i];
            if (ss == '1') {
              p.outOfStock = true;
            }
          });

          user.pp = pp
          this.setState({ photos, user });
        }
        else {
          console.log('state:', res.body.state);
        }
      })
  }

  searchTermChanged(text) {
    this.setState({ searchTerm: text });
  }

  render() {
    let {
      photos,
      categories,
      category,
      cols,
      photoListWidth,
      openAboutDialog,
      openLoginModal,
      openLeftNav,
      openFullImageView,
      searchTerm,
      fullImageViewPID,
      user
    } = this.state;

    let innerStyle = Object.assign({},styles.inner, { width: photoListWidth });
    categories = categories || [];
    // let categories = ((photoData || {}).categories)||[];
    return (

      <div>
        <Title render={prev => `${prev} | Home`}/>

        <AppBar
          title={category}
          onLeftIconButtonTouchTap={this.toggleLeftNav.bind(this)}
          iconElementRight={
            <IconMenu
              iconButtonElement={
                <IconButton><MoreVertIcon /></IconButton>
              }
              targetOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            >
              <MenuItem primaryText="关于" onClick={this.toggleAboutDialog.bind(this)}/>
              {user.uid && <MenuItem primaryText="登出" onClick={this.userLogout.bind(this)} />}
            </IconMenu>
          }
        />
        <LeftPanel
          items={categories}
          selectedCategory={category}
          open={openLeftNav}
          onRequestChange={this.toggleLeftNav.bind(this)}
          onTouchTap={this.toggleCategory.bind(this)}
        />

        <TopBar
          toggleLoginModal={this.toggleLoginModal.bind(this)}
          searchTerm={searchTerm}
          // toggleAboutDialog={this.toggleAboutDialog.bind(this)}
          searchTermChanged={this.searchTermChanged.bind(this)}
          // userLogout={this.userLogout.bind(this)}
          user={user}
          />
        <div style={styles.container}>
          <div style={styles.inner}>
          </div>
        </div>
        <div style={styles.container} >
          <div style={innerStyle}>
              {category && <PhotoList
                            user={user}
                            photos={photos}
                            category={category}
                            cols={cols}
                            width={photoListWidth}
                            searchTerm={searchTerm}
                            handleImageClick={this.toggleFullImageView.bind(this)}
                            handleBidClick={this.handleBidClick.bind(this)}
                            />}
          </div>
        </div>

        <About toggleDialog={this.toggleAboutDialog.bind(this)} open={openAboutDialog} />
        <LoginModal user={user} toggleDialog={this.toggleLoginModal.bind(this)} open={openLoginModal} userLogin={this.userLogin.bind(this)}/>
        <FullImageView pid={fullImageViewPID} toggleDialog={this.toggleFullImageView.bind(this)} open={openFullImageView} />
      </div>
    );
  }
}

