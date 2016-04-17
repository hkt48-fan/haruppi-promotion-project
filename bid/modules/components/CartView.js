import React from 'react';
import ReactDOM from 'react-dom';
import RaisedButton from 'material-ui/lib/raised-button';
import GridList from 'material-ui/lib/grid-list/grid-list';
import PhotoTile from './PhotoTile';
import TextField from 'material-ui/lib/text-field';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  gridList: {
    height: '100%',
    overflowY: 'auto',
    marginBottom: 24
  },
  noResult: {
    margin: 'auto',
    paddingTop: 100,
    fontSize: 24
  }
};

export default class CartView extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
    cols: React.PropTypes.number,
    width: React.PropTypes.number
  };

  constructor(props) {
    super(props);

  }


  _renderPhotos(photoData, handleBidClick, handleImageClick, logined) {
    return photoData.map(photo =>{
      // let bidButton = logined?this._buildBidButton(photo):null;
      return (
        <PhotoTile
          key={photo.pid}
          logined={logined}
          // bidButton={bidButton}
          photo={photo}
          handleImageClick={handleImageClick}
        />
      );
    });
  }

  // componentDidMount(prevProps, prevState) {
  //   console.log(this.refs.address);
  //   let ele = ReactDOM.findDOMNode(this.refs.address);
  //   ele.value = this.props.user.address;
  //   // this.refs.address.value = this.props.user.address;
  // }

  handleUpdateProfile() {
    let { updateUserProfile } = this.props;
    let address = this.refs.address.getValue();

    updateUserProfile({ address });
  }

  render() {
    let {
      cols,
      width,
      photos,
      user,
      handleImageClick
    } = this.props;

    let logined = !!user.uid;
    styles.gridList.width = width;

    return (
      <div style={styles.root}>


        <TextField
          ref="address"
          fullWidth={true}
          defaultValue={user.address}
          hintText="填写收货地址和联系信息"
          multiLine={true}
          rows={2}
          rowsMax={4}
        />
        <RaisedButton label="保存收货地址" secondary={true} onTouchTap={this.handleUpdateProfile.bind(this)}/>

        <GridList
          cellHeight={320}
          cols={cols}
          style={styles.gridList}>
          {this._renderPhotos(photos, handleImageClick, logined)}
        </GridList>
      </div>
    );
  }
}
