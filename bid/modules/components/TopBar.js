import React from 'react';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import RaisedButton from 'material-ui/lib/raised-button';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import TextField from 'material-ui/lib/text-field';
import request from 'superagent';


export default class TopBar extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  onClickAbout() {
    this.props.toggleAboutDialog({ open: true });
  }

  onClickLogin() {
    this.props.toggleLoginModal({ open: true });
  }

  onClickLogout() {
    this.props.userLogout();
  }

  onSearchTermChange(event) {
    this.props.searchTermChanged(event.target.value);
  }

  render() {
    let user = this.props.user;
    let uid = (user || {} ).uid || '';

    // render login / loginout

    let authButton = user?
      (<RaisedButton label="登出" secondary={true} onClick={this.onClickLogout.bind(this)}/>)
      :(<RaisedButton label="登录" primary={true} onClick={this.onClickLogin.bind(this)}/>);

    return (
      <Toolbar>
        <ToolbarGroup float="left">
          {uid}
        </ToolbarGroup>

        <ToolbarGroup float="right" lastChild={true}>
          <RaisedButton label="关于" onClick={this.onClickAbout.bind(this)}/>
          {authButton}
        </ToolbarGroup>

        <ToolbarGroup float="right" firstChild={true} >
          <TextField ref="uid" hintText="按成员姓名搜索" style={{ padding: 2 }} onChange={this.onSearchTermChange.bind(this)}/>
        </ToolbarGroup>
      </Toolbar>
    );
  }
}
