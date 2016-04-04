import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';
import GridList from 'material-ui/lib/grid-list/grid-list';
import PhotoTile from './PhotoTile';


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

export default class PhotoList extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
    cols: React.PropTypes.number,
    width: React.PropTypes.number
  };

  constructor(props) {
    super(props);

  }

  // handleBidClick(pid){
  //   let open = false;
  //   ()=>{

  //   }
  // }

  // _buildToggleFullImageViewEvent(pid) {
  //   return ()=>{
  //     this.props.toggleFullImageViewHandler(pid);
  //   };
  // }

  // _buildBidButton(photo) {
  //   let { pid, cost } = photo;

  //   return (
  //     <div>
  //       <RaisedButton
  //         label={`PP: ${cost}`}
  //         secondary={true}
  //         style={styles.button}
  //       />
  //     </div>
  //   );
  // }

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
          handleBidClick={handleBidClick}
        />
      );
    });
  }

  render() {
    let {
      cols,
      width,
      searchTerm,
      photos,
      category,
      user,
      handleBidClick,
      handleImageClick
    } = this.props;

    let logined = !!user.uid;
    // if (!photoData || !category) {
    //   return null;
    // }
    // let photoPack = photoData.photoPack.find(pp=>pp.category===category);
    let filtered = photos.filter(p=>p.category===category);

    // let filtered = photoPack.photos;
    if (searchTerm) {
      filtered = filtered.filter(photo=>photo.members.includes(searchTerm));
    }
    if (!filtered && searchTerm) {
      searchTerm = searchTerm || '';
      return <div style={styles.noResult}>{`未找到与 "${searchTerm}" 相关的生写`}</div>;
    }
    styles.gridList.width = width;

    return (
      <div style={styles.root}>
        <GridList
          cellHeight={320}
          cols={cols}
          style={styles.gridList}>
          {this._renderPhotos(filtered, handleBidClick, handleImageClick, logined)}
        </GridList>
      </div>
    );
  }
}
