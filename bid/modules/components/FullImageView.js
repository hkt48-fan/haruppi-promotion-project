import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

export default class FullImageView extends React.Component {
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

    let { pid, open } = this.props;

    return (
      <div>
        <Dialog
          title="庆祝儿玉7单C位！投票送生写活动！"
          actions={actions}
          open={open}
          onRequestClose={this.handleClose.bind(this)}
        >
          <img src={`/thumbnail/${pid}.jpg`} />
        </Dialog>
      </div>
    );
  }
}

