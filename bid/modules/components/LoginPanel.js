import React from 'react';
import request from 'superagent';

export default class LoginPanel extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  login() {
    console.log('test');

    let uid = this.refs.uid.value;
    let tid = this.refs.tid.value;

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
          console.log(res.body.token);
        }
        else {
          console.log('auth fail');
        }
      });
  }

  render() {
    return (
      <div>
        <input ref="uid" placeholder="taobao id" value="aaa"/>
        <input ref="tid" placeholder="transaction" value="bbb"/>
        <button onClick={this.login}>Login</button>
      </div>
    );
  }
}
