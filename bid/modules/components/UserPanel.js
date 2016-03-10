import React from 'react';
// import request from 'superagent';
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';

const styles={
  container:{
    flex: '4 0 0'
  },
  user:{
    flex: '4 0 0',
    margin: 12
  },
  button:{
    margin: 5
  }
}

export default class UserPanel extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor(props) {
    super(props);

    let { user }=props;
    this.state = { user }

  }

  login() {

    let uid = this.refs.uid.getValue();
    let tid = this.refs.tid.getValue();

    fetch
      .post('/api/login')
      .send({ uid, tid, hello: 'hhh' })
      .end((err, res)=>{
        if (err) {
          console.log('request fail');
          console.log(err);
        }
        else if(res.body.result === 'ok') {
          console.log('success');
          // document.cookie = res.body.setCookie;
          // document.cookie = 'connect.uid=aabbcc; expires=Sun Mar 06 2016 22:56:04 GMT+0800 (CST); path=/; max-age=60000; httpOnly: true'
          let user = res.body.user;
          // this.setState({ user });
          this.props.userLogin(user);
        }
        else {
          console.log('auth fail');
        }
      });
  }

  keyPressed(kbEvent) {
    console.log(kbEvent.keyCode);
  }

  renderLoginFields() {
    return (
      <div style={styles.container}>
      <TextField ref="uid" hintText="您的淘宝登录id" />
      <TextField ref="tid" hintText="任意77订单号" onEnterKeyDown={this.login.bind(this)}/>
      <FlatButton label="登录" style={styles.button} onClick={this.login.bind(this)}/>

      </div>
    );
  }

  renderUserInfo(user) {
    return (
      <div style={styles.user}>昵称:{user.uid} PP:{user.pp}</div>
    );
  }

  render() {
    let { user } = this.state;
    if (!user) {
      return this.renderLoginFields();
    }
    else {
      return this.renderUserInfo(user);
    }
  }
}
