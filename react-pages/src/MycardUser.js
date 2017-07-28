import React, { Component } from 'react';
import { NavItem } from 'react-bootstrap';

class MycardUser extends Component
{
    constructor()
    {
        super();
        this.state = {
            username: '登录',
            avatar: ''
        };
        this.data = null;
    }

    componentDidMount()
    {
        this.deserializeURI();
    }

    deserializeURI() {
        let sso = getURLParameter('sso');
        let sig = getURLParameter('sig');
        if (sso) {
            let text = decodeURI(atob(sso));
            this.setFromToken(text);
            window.localStorage.token = sso;
            window.localStorage.signature = sig;
        }
        else if (window.localStorage.token) {
            sso = window.localStorage.token;
            let text = decodeURI(atob(sso));
            this.setFromToken(text);
        }
        else {
            this.data = null;
            this.setState({
                username: '登录',
                avatar: ''
            })
        }
    }

    setFromToken(text)
    {
        let name = getURLParameter('name', text);
        let admin = getURLParameter('admin', text);
        let avatar = getURLParameter('avatar_url', text);
        if (admin !== 'true') return false;
        this.data = text;
        this.setState({
            username: name,
            avatar: decodeURI(avatar)
        });
        return true;
    }

    getJumpURI() {
        let params = new URLSearchParams();
        params.set('return_sso_url', window.location.href);
        let payload = btoa(params.toString());

        let url = new URL('https://accounts.moecube.com');
        params = url['searchParams'];
        params.set('sso', payload);
        return url.toString();
    }

    onLogClick()
    {
        if (this.data)
            this.logout();
        else
            this.login();
    }

    login()
    {
        window.location.href = this.getJumpURI();
    }

    logout()
    {
        this.data = null;
        window.localStorage.token = undefined;
        this.setState({
            username: '登录',
            avatar: ''
        });
    }

    render()
    {
        return (
            <NavItem onClick={this.onLogClick.bind(this)}>
                <img className="img-circle" width={24} height={24} src={this.state.avatar} alt="" />
                &nbsp;&nbsp;{this.state.username}
            </NavItem>
        )
    }

}

function getURLParameter(name, target) {
    if (!target) target = window.location.search;
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(target) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

export default MycardUser