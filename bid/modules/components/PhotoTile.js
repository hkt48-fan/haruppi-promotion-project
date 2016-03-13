import React from 'react';
import GridTile from 'material-ui/lib/grid-list/grid-tile';

const styles = {
  gridTile: {
  },
  image:{
    cursor: 'pointer'
  }
};

export default class PhotoTile extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps, nextState) {

    if (nextProps.photo.pid === this.props.photo.pid) {
      return false;
    }
    return true;
  }

  render() {
    let { photo, bidButton, onClick } = this.props;
    let imageUrl = '/thumbnail/' + photo.pid + '.jpg';

    return (
      <GridTile
        title={photo.members || ' '}
        cols={1}
        style={styles.gridTile}
        alt={'sfesfse'}
        subtitle={photo.details || ' '}
        actionIcon={bidButton}

      >
        <img style={styles.image} src={imageUrl} onClick={onClick}/>
      </GridTile>
    );
  }
}
