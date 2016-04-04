import React from 'react';
import GridTile from 'material-ui/lib/grid-list/grid-tile';
import RaisedButton from 'material-ui/lib/raised-button';
import Popover from 'material-ui/lib/popover/popover';


const styles = {
  gridTile: {
  },
  image:{
    cursor: 'pointer'
  },
  button: {
    margin: '6px 12px 6px 0',
    minWidth: 67
  },
  popover: {
    padding: 20,
  }
};

export default class PhotoTile extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor(props) {
    super(props);
    let state= {
      popoverOpen:false
    };
    this.state = state;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.popoverOpen !== this.state.popoverOpen) {
      return true;
    }

    if (nextProps.photo.outOfStock !== this.props.outOfStock) {
      return true;
    }

    if (nextProps.photo.pid === this.props.photo.pid
      && nextProps.logined === this.props.logined
      ) {
      return false;
    }
    return true;
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ popoverOpen: false });
  }

  _handleBidConfirmClick(event) {
    // console.log('click');
    this.setState({
      popoverOpen: true,
      anchorEl: event.currentTarget
    });
  }

  _handleImageClick() {
    let { photo, handleImageClick } = this.props;
    // console.log('image clicked', photo.pid);
    handleImageClick(photo.pid);
  }

  _handleBidClick() {
    let { photo, handleBidClick } = this.props;
    handleBidClick(photo.pid);
  }

  handleRequestClose() {
    this.setState({
      popoverOpen: false
    });
  }

  render() {
    let {
      photo,
      logined,
      handleImageClick,
      handleBidClick
    } = this.props;
    let imageUrl = '/thumbnail/' + photo.pid + '.jpg';

    handleImageClick = handleImageClick || function () {};
    handleBidClick = handleBidClick || function () {};

    // console.log(handleImageClick);
    // console.log(handleBidClick);

    let popover = logined? (
        <Popover
          open={this.state.popoverOpen}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          targetOrigin={{ horizontal: 'left', vertical: 'top' }}
          onRequestClose={this.handleRequestClose.bind(this)}>

          <div style={styles.popover}>
            <RaisedButton
              primary={true}
              label="继续兑换(无法撤销)"
              onTouchTap={this._handleBidClick.bind(this)}/>
          </div>

        </Popover>
    ):null;

    let bidButton = logined?(
      <div>
        <RaisedButton
          label={`PP: ${photo.cost}`}
          secondary={true}
          style={styles.button}
          disabled={photo.outOfStock}
          onTouchTap={this._handleBidConfirmClick.bind(this)}/>
        {popover}
      </div>
    ):null;


    return (
      <GridTile
        title={photo.members || ' '}
        cols={1}
        style={styles.gridTile}
        alt={'sfesfse'}
        subtitle={photo.details || ' '}
        actionIcon={bidButton}>
        <img
          style={styles.image}
          src={imageUrl}
          onTouchTap={this._handleImageClick.bind(this)}/>
      </GridTile>
    );
  }
}
