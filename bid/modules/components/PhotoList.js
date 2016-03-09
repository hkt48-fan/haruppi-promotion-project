import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';

import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';

const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  button: {
    margin: 12
  },
  gridList: {
    height: '100%',
    overflowY: 'auto',
    marginBottom: 24
  },
  gridTile: {
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

  renderPhotos(photoData) {
    let bidButton = (
      <RaisedButton
      label="PP: 1"
      secondary={true}
      style={styles.button}
      />
    );

    return photoData.map(photo =>{
      let imageUrl = '/thumbnail/' + photo.pid + '.jpg';
      return (
        <GridTile
          key={photo.pid}
          title={'生写真'}
          cols={1}
          style={styles.gridTile}
          alt={'sfesfse'}
          subtitle={photo.members || ' '}
          actionIcon={bidButton}>
          <img src={imageUrl} />
        </GridTile>
      );
    });
  }

  render() {
    let { cols, width, searchTerm, photoData } = this.props;
    if (!photoData) {
      return null;
    }

    // console.log(photoData);

    let filtered = photoData;
    if (searchTerm) {
      filtered = photoData.filter(photo=>photo.members.includes(searchTerm));
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
