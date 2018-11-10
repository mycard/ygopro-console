import React, { Component } from 'react'
import { Panel, ListGroup, ListGroupItem } from 'react-bootstrap'

export class MCProConsoleIdentifierResult extends Component
    constructor: ->
        super()
        
    componentDidMount: ->

    renderDeck: (result) ->
        if result.polymerizedTags
            return <div>
                聚合&nbsp;
                { result.polymerizedTags.map (tag) => <kbd>{tag}</kbd> } 
            </div>
        return <div>{this.props.result.deck}</div>

    render: ->
        return null unless this.props.result
        <Panel header="检验结果">
            { this.renderDeck(this.props.result) }
            { 
                if this.props.result.tag then <ListGroup fill>
                        {this.props.result.tag.map (tag) => <ListGroupItem>{tag}</ListGroupItem>}
                    </ListGroup>
                else null
            }
        </Panel>

MCProConsoleIdentifierResult.defaultProps = 
    result: null

export default MCProConsoleIdentifierResult