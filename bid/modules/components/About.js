import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

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
    this.props.toggleDialog({ open: true });
  };

  handleClose = () => {
    this.props.toggleDialog({ open: false });
  };

  render() {
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

