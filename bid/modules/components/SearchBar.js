import React from 'react';
import TextField from 'material-ui/lib/text-field';


const styles ={
  container:{
    flex: '1 0 0'
  }
}
export default class SearchBar extends React.Component {
  static propTypes = {
    name: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div style={styles.container}>
        <TextField ref="uid" hintText="按成员姓名搜索"/>
      </div>
    );
  }
}
