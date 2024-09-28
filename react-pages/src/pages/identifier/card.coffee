import React, { Component } from 'react'
import { } from 'react-bootstrap'

export class MCProConsoleIdentifierCard extends Component   
    render: ->
        id = this.props.id
        return null unless id
        <a href={"https://mycard.world/ygopro/arena/index.html?id=" + id.toString() + "#/cardinfo"}>
            <img src={"http://ygo233.my-card.in/ygopro/pics/" + id.toString() + ".jpg!thumb"} alt="" target='_blank'></img>
        </a>

MCProConsoleIdentifierCard.defaultProps = 
    id: 0

export default MCProConsoleIdentifierCard
