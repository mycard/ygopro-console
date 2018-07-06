// Generated by CoffeeScript 2.1.0
import React, {
  Component
} from 'react';

import {
  Panel,
  ListGroup,
  ListGroupItem
} from 'react-bootstrap';

import MCProConsoleIdentifierRestrain from './restrain';

import './classification.css';

export var MCProConsoleIdentifierClassification = class MCProConsoleIdentifierClassification extends Component {
  renderTags(arr, text) {
    var self;
    if (arr && arr.length > 0) {
      self = this;
      return <div>
        <ListGroupItem disabled>{text}</ListGroupItem>
        <ListGroupItem>
          {arr.map(function(tag) {
        return <kbd onClick={self.onTagClick.bind(self)} className="tag">{tag.name}</kbd>;
      })}
        </ListGroupItem>
      </div>;
    } else {
      return null;
    }
  }

  onTagClick(event) {
    if (this.props.onTagClick) {
      return this.props.onTagClick.call(this, event);
    }
  }

  render() {
    var classification, self;
    classification = this.props.classification;
    if (!classification) {
      return null;
    }
    console.log(this.props.verbose);
    return <Panel header={classification.name}>
      优先级：{classification.priority}
      <div>
        {(this.props.verbose ? this.props.verbose.is ? "通过" : "否决" : null)}
      </div>
      <ListGroup fill>
        <ListGroupItem disabled>约束</ListGroupItem>
        {(self = this, classification.restrains.map(function(restrain, i) {
      return <MCProConsoleIdentifierRestrain restrain={restrain} onSetClick={self.props.onSetClick ? self.props.onSetClick.bind(self) : null} verbose={self.props.verbose ? self.props.verbose.children[i] : null} />;
    }))}
        {this.renderTags(classification.checkTags, "检查标签")}
        {this.renderTags(classification.forceTags, "强制标签")}
        {this.renderTags(classification.refuseTags, "拒绝标签")}
      </ListGroup>
    </Panel>;
  }

};

MCProConsoleIdentifierClassification.defaultProps = {
  classification: null,
  onTagClick: null,
  onSetClick: null,
  verbose: null
};

export default MCProConsoleIdentifierClassification;

//# sourceMappingURL=classification.js.map
