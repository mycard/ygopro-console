import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class MCProConsoleMycardUser extends Component {

    render() {
        return <Link style={{textDecoration: 'none', color: "black"}} to={{
                pathname: '/users/query',
                search: '?user=' + this.props.username,
                state: "fromLink"
            }}><div className="user-link">{this.props.username}</div></Link>
    }
}

MCProConsoleMycardUser.defaultProps = {
    username: '神秘用户'
};

export default MCProConsoleMycardUser;