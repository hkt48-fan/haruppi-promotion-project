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
    width: 1200,
    height: '100%',
    overflowY: 'auto',
    marginBottom: 24
  },
  gridTile: {
    // margin: 0
  }
};

export default class PhotoList extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
    cols: React.PropTypes.number
  };

  constructor(props) {
    super(props);

  }

  renderPhotos() {
    let photoData = this.props.photoData || [];
    let bidButton = (
      <RaisedButton
      label="PP: 1"
      // linkButton={true}
      // href="https://github.com/callemall/material-ui"
      secondary={true}
      style={styles.button}
      // icon={<FontIcon className="muidocs-icon-custom-github"/>}
      />
    );

    return photoData.map(photo =>{
      // console.log(photo);
      let imageUrl = '/thumbnail/' + photo.id + '.jpg';
      return (
        <GridTile
          key={photo.id}
          title={'兒玉遥'}
          cols={1}
          style={styles.gridTile}
          alt={'sfesfse'}
          subtitle={'生写真生写真生写真生写真生写真生写真'}
          actionIcon={bidButton}>

          <img src={imageUrl} />

        </GridTile>

      );
    });
  }

  render() {
    return (
      <div style={styles.root}>
        <GridList
          cellHeight={320}
          cols={5}
          style={styles.gridList}>
          {this.renderPhotos()}
        </GridList>
      </div>
    );
  }
}
