import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';

export default class About extends React.Component {
  constructor(props) {
    super(props);

    let open = !!props.open;
    this.state = { open };
  }


  componentWillReceiveProps(nextProps) {
    let { open } = nextProps;
    this.setState({ open });
  }

  handleOpen = () => {
    console.log('about open');
    this.props.toggleDialog({ open: true });
    // this.setState({open: true});
  };

  handleClose = () => {
    console.log('about close');
    this.props.toggleDialog({ open: false });
    // this.setState({open: false});
  };

  render() {
    console.log('render about.........');
    console.log(this.state.open);
    const actions = [
      <FlatButton
        label="关闭"
        secondary={true}
        onTouchTap={this.handleClose}
      />
    ];

    return (
      <div>
        <Dialog
          title="庆祝儿玉7单C位！投票送生写活动！"
          actions={actions}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
        >
          详情关注 <a target="_blank" href="http://tieba.baidu.com/p/4391140484">兒玉遥吧讨论楼</a>
        </Dialog>
      </div>
    );
  }
}

