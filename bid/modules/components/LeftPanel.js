import React from 'react';
import LeftNav from 'material-ui/lib/left-nav';
import MenuItem from 'material-ui/lib/menus/menu-item';
import AppBar from 'material-ui/lib/app-bar';
import NavigationClose from 'material-ui/lib/svg-icons/navigation/close';
import IconButton from 'material-ui/lib/icon-button';

export default class LeftPanel extends React.Component {
  static propTypes = {
    name: React.PropTypes.string
  };

  constructor(props) {
    super(props);
  }

  _buildMenuTouchTapEventHandler(category) {
    let handler = this.props.onTouchTap;
    return ()=>{
      handler(category);
    };
  }

  render() {
    let { open, items, selectedCategory } = this.props;
    return (
      <LeftNav
        open={open}
        onRequestChange={this.props.onRequestChange}
        docked={false}>

        <AppBar
          title="切换分类"
          iconElementLeft={<div></div>}
          onLeftIconButtonTouchTap={this.props.onRequestChange}
        />

        {items.map(category=>{
          return (
            <MenuItem key={category} checked={category === selectedCategory} onTouchTap={this._buildMenuTouchTapEventHandler(category)}>{category}</MenuItem>
          );
        })}
      </LeftNav>
    );
  }
}
