import React from 'react';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import RaisedButton from 'material-ui/lib/raised-button';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import TextField from 'material-ui/lib/text-field';
import request from 'superagent';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import IconButton from 'material-ui/lib/icon-button';
import FontIcon from 'material-ui/lib/font-icon';
import NavigationExpandMoreIcon from 'material-ui/lib/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Badge from 'material-ui/lib/badge';
import NotificationsIcon from 'material-ui/lib/svg-icons/social/notifications';
import ShoppingCartIcon from 'material-ui/lib/svg-icons/action/shopping-cart';
import LocalActivityIcon from 'material-ui/lib/svg-icons/maps/local-activity';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';


export default class TopBar extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  // onClickAbout() {
  //   this.props.toggleAboutDialog({ open: true });
  // }

  onClickLogin() {
    this.props.toggleLoginModal({ open: true });
  }

  // onClickLogout() {
  //   this.props.userLogout();
  // }

  onSearchTermChange(event) {
    this.props.searchTermChanged(event.target.value);
  }

  onClickCart() {
    console.log('cart onClick');
    this.props.toggleCartView();
  }

  render() {
    let { user, searchTerm, showCart } = this.props;
    user = user || {};
    let uid = user.uid || '';
    let pp = user.pp || '0';
    // render login / loginout

    // let authButton = user?
    //   (<RaisedButton label="登出" secondary={true} onClick={this.onClickLogout.bind(this)}/>)
    //   :(<RaisedButton label="登录" primary={true} onClick={this.onClickLogin.bind(this)}/>);

        // <ToolbarGroup float="right" lastChild={true}>
        //   <RaisedButton label="关于" onClick={this.onClickAbout.bind(this)}/>
        // </ToolbarGroup>

    let viewButtonLable = showCart? '关闭购物车': '显示购物车';
    let userInfo = (<div>
        <RaisedButton
          label={viewButtonLable}
          linkButton={true}
          primary={true}
          style={{ margin: '6px 10px' }}
          icon={<ShoppingCartIcon />}
          onClick={this.onClickCart.bind(this)}
        />
      </div>);

    return (
      <Toolbar>

        <ToolbarGroup float="left">
          {!uid && <RaisedButton label="登录" primary={true} onClick={this.onClickLogin.bind(this)}/>}
          { uid && userInfo}
        </ToolbarGroup>

        <ToolbarGroup float="left">
          <ToolbarTitle text={`PP: ${pp}`} style={{ width: 90 }} />
        </ToolbarGroup>

        <ToolbarGroup float="right" firstChild={true} >
          <TextField ref="uid" hintText="按成员姓名搜索" style={{ padding: 2 }} value={searchTerm} onChange={this.onSearchTermChange.bind(this)}/>
        </ToolbarGroup>

      </Toolbar>
    );
  }
}
