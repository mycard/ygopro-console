import React, { Component } from 'react'
import { Panel } from 'react-bootstrap'
import MCProConsoleIdentifierCard from "./card"

export class MCProConsoleIdentifierSet extends Component
    render: ->
        set = this.props.set
        return null unless set
        <Panel header={ set.name + if set.originName and set.originName.length > 0 then "[#{set.originName}]" else "" }>
            { set.ids.map (id) -> <MCProConsoleIdentifierCard id={id} /> }
        </Panel>

MCProConsoleIdentifierSet.defaultProps =
    set: null

export default MCProConsoleIdentifierSet