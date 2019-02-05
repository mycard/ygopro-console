import React, { Component } from 'react'
import {DropdownButton, MenuItem} from 'react-bootstrap'

class MCProConsoleSelectableButton extends Component {
    constructor(props) {
        super(props);
        this.state = {
            choice: Object.keys(this.props.choices)[0]
        }
    }

    static defaultProps = {
        choices: {},
        id: "selectableButton",
        onSelect: null
    };

    onSelect(eventKey) {
        this.setState({choice: eventKey}, function () {
            if (this.props.onSelect != null)
                this.props.onSelect.call(this);
        }.bind(this));
    }

    render() {
        return <DropdownButton title={this.props.choices[this.state.choice]}
                               id={this.props.id}
                               onSelect={this.onSelect.bind(this)}>
            {Object.keys(this.props.choices).map(function (key) {
                return <MenuItem eventKey={key}>{this.props.choices[key]}</MenuItem>
            }.bind(this))}
        </DropdownButton>
    }
}

export default MCProConsoleSelectableButton;