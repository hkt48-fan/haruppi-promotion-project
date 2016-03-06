import React from 'react';
import request from 'superagent';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import FlatButton from 'material-ui/lib/flat-button';

const styles={
  container:{
    flex: '4 0 0'
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
    console.log('test');

    let uid = this.refs.uid.getValue();
    let tid = this.refs.tid.getValue();

    request
      .post('/api/login')
      .send({ uid, tid, hello: 'hhh' })
      .end((err, res)=>{
        if (err) {
          console.log('request fail');
          console.log(err);
        }
        else if(res.body.result === 'ok') {
          console.log('success');
          console.log(res.body);
          console.log(res.body.setCookie);
          // document.cookie = res.body.setCookie;
          // document.cookie = 'connect.uid=aabbcc; expires=Sun Mar 06 2016 22:56:04 GMT+0800 (CST); path=/; max-age=60000; httpOnly: true'
          let user = res.body.user;
          this.setState({ user });

        }
        else {
          console.log('auth fail');
        }
      });
  }

  renderLoginFields() {
    return (
      <div style={styles.container}>
      <TextField ref="uid" hintText="您的淘宝登录id" />
      <TextField ref="tid" hintText="任意77订单号" />
      <FlatButton label="登录" style={styles.button} onClick={this.login.bind(this)}/>

      </div>
    );
  }

  renderUserInfo(user) {
    return (
      <div style={styles.container}>{user.uid}</div>
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
