import React, { Component } from 'react'
import {} from 'react-bootstrap'
import "./deck.css"
import MCProConsoleIdentifierCard from "./card"

export class MCProConsoleIdentifierDeck extends Component
    constructor: ->
        super()
        this.state = 
            mode: 'text'

    render: ->
        deck = this.props.deck
        return null unless deck
        deck = MCProConsoleIdentifierDeck.loadFromString deck, this.props.name if typeof(deck) == 'string'
        <div id="deck" className="deck">
            <label className="pull-right" id="deckname">{deck.name}</label>
            <label>主卡组：<b>{deck.main.length}</b></label>
            <div className={"line" + Math.ceil(deck.main.length / 4)}>
                { deck.main.map (card) -> <MCProConsoleIdentifierCard id={card} /> }
            </div>
            <label>额外卡组：<b>{deck.ex.length}</b></label>
            <div className={"line" + deck.ex.length}>
                { deck.ex.map (card) -> <MCProConsoleIdentifierCard id={card} /> }
            </div>
            {
                if deck.side && deck.side.length > 0
                    <label>副卡组：<b>{deck.side.length}</b></label>
                    <div className={"line" + deck.side.length}>
                        { deck.side.map (card) -> <MCProConsoleIdentifierCard id={card} /> }
                    </div>
                else null
            }
        </div>

MCProConsoleIdentifierDeck.loadFromString = (str, name) ->
    lines = str.split '\n'
    flag = 'main'
    deck =
        name: name
        main: []
        side: []
        ex: []
    for line from lines
        line = line.trim()
        if line == '!side'
            flag = 'side'
        else if line == '#extra'
            flag = 'ex'
        else
            id = parseInt line, 10
            deck[flag].push id if id > 0
    deck

MCProConsoleIdentifierDeck.defaultProps =
    name: ""
    deck: null

export default MCProConsoleIdentifierDeck