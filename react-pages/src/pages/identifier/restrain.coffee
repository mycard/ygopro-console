import React, { Component } from 'react'
import MCProConsoleIdentifierCard from './card'
import './restrain.css'

export class MCProConsoleIdentifierRestrain extends Component
    constructor: ->
        super()
        this.state =
            expandGroup: false
            expandImage: false
        this.style = {}
        this.followRenders = null

    onExpandClicked: ->
        this.setState
            expandGroup: !this.state.expandGroup

    onImageClicked: ->
        this.setState
            expandImage: !this.state.expandImage

    onSetClicked: (event) ->
        console.log "set!"
        this.props.onSetClick.call this, event if this.props.onSetClick

    renderCardRestrain: (restrain) ->
        num = restrain.condition.number
        <div style={this.style}>
            { 
                if this.props.renderImage
                    [1..num].map -> <MCProConsoleIdentifierCard id = {restrain.id} /> 
                else null
            }
            { this.renderRestrainText(restrain) }
        </div>

    renderSetRestrain: (restrain) ->
        num = restrain.condition.number
        len = restrain.set.ids.length
        times = Math.floor(num / len)
        mods = num % len
        <div style={this.style}>
        {
            if this.props.renderImage
                restrain.set.ids.map (id, index) ->
                    repeat = if index < mods then times + 1 else times
                    return null if repeat == 0
                    [1..repeat].map -> <MCProConsoleIdentifierCard id = {id} />
            else null
        }
        { this.renderRestrainText(restrain) }
        </div>

    renderRestrainText: (restrain) ->
        <p className="description">
            {if restrain.name then <kbd className="card">{restrain.name}</kbd> else <kbd className="set" onClick={this.onSetClicked.bind(this)}>{restrain.set.name}</kbd>}&nbsp;
            {if restrain.range then <kbd className="range">{restrain.range}</kbd> else null}&nbsp;
            {restrain.condition.operator}&nbsp;
            {restrain.condition.number}
        </p>

    renderGroupRestrain: (restrain) ->
        text = ""
        if restrain.condition.operator == 'and' then text = '全部满足'
        else if restrain.condition.operator == 'or' then text = '部分满足'
        else text = "部分满足 [#{restrain.condition.operator} #{restrain.condition.number}]"
        if this.state.expandGroup
            indent = this.props.indent + 1     
            image = true#this.state.expandImage
            this.followRenders = restrain.restrains.map (child) -> <MCProConsoleIdentifierRestrain restrain={child} indent={indent} renderImage={image} />
        <div style={this.style}>
            约束组：{text} 
            &nbsp;<a onClick={this.onExpandClicked.bind(this)}>{if this.state.expandGroup then '收起' else '展开'}</a>
        </div>
        #&nbsp;<a onClick={this.onImageClicked.bind(this)}>{if this.state.expandImage then '隐藏卡图' else '显示卡图'}</a>

    renderRestrain: (restrain) ->
        this.style = {padding: "0px 0px 0px #{this.props.indent * 20}px"}
        switch restrain.type
            when 'Card'  then this.renderCardRestrain restrain
            when 'Set'   then this.renderSetRestrain restrain
            when 'Group' then this.renderGroupRestrain restrain
            else return ""

    render: ->
        restrain = this.props.restrain
        return null unless restrain
        this.followRenders = null
        <div>
            <li className="list-group-item">
                { this.renderRestrain(this.props.restrain) }
            </li>
            { this.followRenders }
        </div>
MCProConsoleIdentifierRestrain.defaultProps = 
    restrain: null
    indent: 0
    renderImage: true
    onSetClick: null

export default MCProConsoleIdentifierRestrain