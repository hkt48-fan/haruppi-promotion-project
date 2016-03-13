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
  button: {
    margin: '6px 12px 6px 0',
    minWidth: 67
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

  _buildToggleFullImageViewEvent(pid) {
    return ()=>{
      this.props.toggleFullImageViewHandler(pid);
    };
  }

  renderPhotos(photoData) {
    let bidButton = (
      <RaisedButton
      label="PP: 1"
      secondary={true}
      style={styles.button}
      />
    );

    return photoData.map(photo =>{
      return (
        <PhotoTile key={photo.pid} bidButton={bidButton} photo={photo} onClick={this._buildToggleFullImageViewEvent(photo.pid)}/>
      );
    });
  }

  render() {
    let { cols, width, searchTerm, photoData, category } = this.props;
    if (!photoData || !category) {
      return null;
    }
    let photoPack = photoData.photoPack.find(pp=>pp.category===category);

    let filtered = photoPack.photos;
    if (searchTerm) {
      filtered = photoPack.filter(photo=>photo.members.includes(searchTerm));
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
          {this.renderPhotos(filtered)}
        </GridList>
      </div>
    );
  }
}
