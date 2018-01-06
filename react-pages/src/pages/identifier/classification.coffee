import React, { Component } from 'react'
import { Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import MCProConsoleIdentifierRestrain from './restrain'
import './classification.css'

export class MCProConsoleIdentifierClassification extends Component
  renderTags: (arr, text) ->
    if arr and arr.length > 0
      self = this
      <div>
        <ListGroupItem disabled>{text}</ListGroupItem>
        <ListGroupItem>
          { arr.map (tag) -> <kbd onClick={self.onTagClick.bind(self)} className="tag">{tag.name}</kbd> }
        </ListGroupItem>
      </div>
    else null

  onTagClick: (event) ->
    this.props.onTagClick.call this, event if this.props.onTagClick

  render: ->
    classification = this.props.classification
    return null unless classification
    <Panel header={ classification.name } >
      优先级：{ classification.priority }
      <ListGroup fill>
        <ListGroupItem disabled>约束</ListGroupItem>
        { 
          self = this
          classification.restrains.map (restrain) -> 
            <MCProConsoleIdentifierRestrain restrain = {restrain} onSetClick = { if self.props.onSetClick then self.props.onSetClick.bind(self) else null } /> 
        }
        { this.renderTags(classification.checkTags, "检查标签") }
        { this.renderTags(classification.forceTags, "强制标签") }
        { this.renderTags(classification.refuseTags, "拒绝标签") }
      </ListGroup>
    </Panel>

MCProConsoleIdentifierClassification.defaultProps =
  classification: null
  onTagClick: null
  onSetClick: null

export default MCProConsoleIdentifierClassification