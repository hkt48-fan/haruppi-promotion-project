import React from 'react';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import DatePicker from 'material-ui/lib/date-picker/date-picker';

export default class CompleteUserDetails extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor(props) {
    super(props);

    let { open } = props;
    this.state = { open };
  }

  handleOpen() {
    this.props.toggleDialog({ open: true });
  }

  handleClose() {
    this.props.toggleDialog({ open: false });
  }

  render() {
    if (!this.props.open) {
      return null;
    }
    const actions = [
      <FlatButton
        label="更新"
        primary={true}
        keyboardFocused={true}
        onClick={this.handleClose.bind(this)}
      />
    ];

    return (
      <div>
        <Dialog
          title="Dialog With Date Picker"
          modal={false}
          open={this.props.open}
          onRequestClose={this.handleClose}
          actions={actions}
        >
          Open a Date Picker dialog from within a dialog.
          <DatePicker hintText="Date Picker" />
        </Dialog>
      </div>
    );
  }
}
