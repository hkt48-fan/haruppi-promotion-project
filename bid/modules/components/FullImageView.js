import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

const styles={
  dialog:{
    // paddingTop: 0,
    height: 960
  },
  image:{
    height: 960

  }
};

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

    ];

    let { pid, open } = this.props;

    return (
      <Dialog
        style={styles.dialog}
        actions={actions}
        open={open}
        // autoDetectWindowHeight={false}
        onRequestClose={this.handleClose.bind(this)}>
        <div style={styles.image}><img src={`/resized/${pid}.jpg`} /></div>
      </Dialog>
    );
  }
}

