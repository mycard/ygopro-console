// Generated by CoffeeScript 2.1.0
import React, {
  Component
} from 'react';

import MCProConsoleIdentifierCard from './card';

import './restrain.css';

export var MCProConsoleIdentifierRestrain = class MCProConsoleIdentifierRestrain extends Component {
  constructor() {
    super();
    this.state = {
      expandGroup: false,
      expandImage: false
    };
    this.style = {};
    this.followRenders = null;
  }

  onExpandClicked() {
    return this.setState({
      expandGroup: !this.state.expandGroup
    });
  }

  onImageClicked() {
    return this.setState({
      expandImage: !this.state.expandImage
    });
  }

  onSetClicked(event) {
    console.log("set!");
    if (this.props.onSetClick) {
      return this.props.onSetClick.call(this, event);
    }
  }

  renderCardRestrain(restrain) {
    var i, num, results;
    num = restrain.condition.number;
    return <div style={this.style}>
            {(this.props.renderImage ? (function() {
      results = [];
      for (var i = 1; 1 <= num ? i <= num : i >= num; 1 <= num ? i++ : i--){ results.push(i); }
      return results;
    }).apply(this).map(function() {
      return <MCProConsoleIdentifierCard id={restrain.id} />;
    }) : null)}
            {this.renderRestrainText(restrain)}
        </div>;
  }

  renderSetRestrain(restrain) {
    var len, mods, num, times;
    num = restrain.condition.number;
    len = restrain.set.ids.length;
    times = Math.floor(num / len);
    mods = num % len;
    return <div style={this.style}>
        {(this.props.renderImage ? restrain.set.ids.map(function(id, index) {
      var i, repeat, results;
      repeat = index < mods ? times + 1 : times;
      if (repeat === 0) {
        return null;
      }
      return (function() {
        results = [];
        for (var i = 1; 1 <= repeat ? i <= repeat : i >= repeat; 1 <= repeat ? i++ : i--){ results.push(i); }
        return results;
      }).apply(this).map(function() {
        return <MCProConsoleIdentifierCard id={id} />;
      });
    }) : null)}
        {this.renderRestrainText(restrain)}
        </div>;
  }

  renderRestrainText(restrain) {
    return <p className="description">
            {(restrain.name ? <kbd className="card">{restrain.name}</kbd> : <kbd className="set" onClick={this.onSetClicked.bind(this)}>{restrain.set.name}</kbd>)}&nbsp;
            {(restrain.range ? <kbd className="range">{restrain.range}</kbd> : null)}&nbsp;
            {restrain.condition.operator}&nbsp;
            {restrain.condition.number}
        </p>;
  }

  renderGroupRestrain(restrain) {
    var image, indent, text;
    text = "";
    if (restrain.condition.operator === 'and') {
      text = '全部满足';
    } else if (restrain.condition.operator === 'or') {
      text = '部分满足';
    } else {
      text = `部分满足 [${restrain.condition.operator} ${restrain.condition.number}]`;
    }
    if (this.state.expandGroup) {
      indent = this.props.indent + 1;
      image = true; //this.state.expandImage
      this.followRenders = restrain.restrains.map(function(child) {
        return <MCProConsoleIdentifierRestrain restrain={child} indent={indent} renderImage={image} />;
      });
    }
    return <div style={this.style}>
            约束组：{text} 
            &nbsp;<a onClick={this.onExpandClicked.bind(this)}>{(this.state.expandGroup ? '收起' : '展开')}</a>
        </div>;
  }

  //&nbsp;<a onClick={this.onImageClicked.bind(this)}>{if this.state.expandImage then '隐藏卡图' else '显示卡图'}</a>
  renderRestrain(restrain) {
    this.style = {
      padding: `0px 0px 0px ${this.props.indent * 20}px`
    };
    switch (restrain.type) {
      case 'Card':
        return this.renderCardRestrain(restrain);
      case 'Set':
        return this.renderSetRestrain(restrain);
      case 'Group':
        return this.renderGroupRestrain(restrain);
      default:
        return "";
    }
  }

  render() {
    var restrain;
    restrain = this.props.restrain;
    if (!restrain) {
      return null;
    }
    this.followRenders = null;
    return <div>
            <li className="list-group-item">
                {this.renderRestrain(this.props.restrain)}
            </li>
            {this.followRenders}
        </div>;
  }

};

MCProConsoleIdentifierRestrain.defaultProps = {
  restrain: null,
  indent: 0,
  renderImage: true,
  onSetClick: null
};

export default MCProConsoleIdentifierRestrain;