import React from 'react';
import RaisedButton from 'material-ui/lib/raised-button';

import GridList from 'material-ui/lib/grid-list/grid-list';
import GridTile from 'material-ui/lib/grid-list/grid-tile';
import StarBorder from 'material-ui/lib/svg-icons/toggle/star-border';
import CheckBox from 'material-ui/lib/svg-icons/toggle/check-box';
import IconButton from 'material-ui/lib/icon-button';
import FontIcon from 'material-ui/lib/font-icon';


const styles = {
  root: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  button: {
    margin: 12,
  },
  gridList: {
    width: 1280,
    height: '100%',
    overflowY: 'auto',
    marginBottom: 24,
  },
  gridTile: {
    // margin: 0
  }
};

export default class PhotoList extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    // //rehydrate data
    // if (window && window.__INITIAL_STATE__) {
    //   this.state = window.__INITIAL_STATE__;
    // }
  }

  renderPhotos() {
    console.log(this.props);
    let photoData = this.props.photoData || [];
    let bidButton = (
      <RaisedButton
      label="PP: 5"
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

      )
    })
  }

  render() {
    // console.log(this.state);
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
