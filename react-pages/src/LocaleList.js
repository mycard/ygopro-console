import React, {Component} from 'react'
import {DropdownButton, MenuItem} from 'react-bootstrap'
import Config from './Config.json'

class MCProConsoleLocaleList extends Component
{
    constructor(props)
    {
        super(props);
        this.state = {
            locales: [],
            currentLocale: ''
        }
    }

    propTypes() {

    }

    handleBranchSelect(key)
    {
        this.setState({currentLocale: key});
        if (this.props.localeChanged)
            this.props.localeChanged.call(this, key);
    }

    componentDidMount()
    {
        fetch(Config.imageServerHost + "locale_list").then(function (result) {
            return result.json()
        }).then(function (json) {
            if (this.props.showAll)
                json.push('all');
            this.setState({
                locales: json,
                currentLocale: json[0]
            })
        }.bind(this))
    }

    render()
    {
        return (
        <DropdownButton title={this.state.currentLocale} id="branchSelector">
            {this.state.locales.map(locale => <MenuItem key={locale} eventKey={locale} onSelect={this.handleBranchSelect.bind(this)}>{locale}</MenuItem>)}
        </DropdownButton>
        )
    }
}

MCProConsoleLocaleList.defaultProps = {
    showAll: false,
    localeChanged: null
};

export default MCProConsoleLocaleList