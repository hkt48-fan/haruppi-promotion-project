import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';


export default class LoginModal extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    let open = !!props.open;
    let loginFailed = false;
    this.state = { open, loginFailed };
  }

  componentWillReceiveProps(nextProps) {
    let { open } = nextProps;
    let loginFailed = false;
    this.setState({ open, loginFailed });
  }

  handleOpen = () => {
    this.props.toggleDialog({ open: true });
  };

  handleClose = () => {
    this.props.toggleDialog({ open: false });
  };

  handleLogin = () =>{
    let uid = this.refs.uid.getValue();
    let tid = this.refs.tid.getValue();

    this.props.userLogin({ uid, tid });
  };

  render() {
    let { loginFailed } = this.state;

    const actions = [
      <FlatButton
        label="登录"
        primary={true}
        onTouchTap={this.handleLogin}
      />,

      <FlatButton
        label="关闭"
        onTouchTap={this.handleClose}
      />

    ];

    return (
      <div>
        <Dialog
          actions={actions}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
        >
            <TextField ref="tid"
              hintText="输入任意淘宝订单交易号"
            />
            <TextField ref="uid"
              hintText="输入淘宝ID"
            /><br/>
            {loginFailed&&<span style={{ color: 'red' }}>登录信息不正确</span>}
            <br />

        </Dialog>
      </div>
    );
  }
}
