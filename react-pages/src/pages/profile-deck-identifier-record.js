import React, { Component } from 'react'
import { InputGroup, FormControl, Button, ButtonGroup, Panel } from 'react-bootstrap'
import MCProConsoleTimeRangePicker from "../components/Timerange"
import MCProConsoleIdentifierDeck from './identifier/deck'
import config from '../Config.json'
import moment from 'moment'
import { message_object } from "../components/Message";

class MCProConsoleProfileDeckIdentifierRecordPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCount: -1,
            sufficientDeckCount: -1,
            currentDeck: null
        };
        this.idInputer = null;
        this.userInputer = null;
        this.sourceInputer = null;
    }

    async startQuery() {
        let url = new URL('profile/record/count', config.serverHost);
        this.refs.time.setUrl(url);
        url.searchParams.append("user", this.userInputer.value);
        url.searchParams.append("source", this.sourceInputer.value);
        let count_response = await message_object.doFetch("identifier query", url.toString(), {});
        let count = await count_response.json();
        if (count <= 0) {
            alert('搜索条件下无卡组。');
            return;
        }
        url = new URL('profile/record/id', config.serverHost);
        this.refs.time.setUrl(url);
        url.searchParams.append("user", this.userInputer.value);
        url.searchParams.append("source", this.sourceInputer.value);
        let id_response = await message_object.doFetch('identifier query id', url.toString(), {});
        let id = await id_response.json();
        this.setState({
            currentCount: 1,
            sufficientDeckCount: count
        }, this.setDeckAccordingToId.bind(this, id.id));
    }

    async setDeckAccordingToId(id) {
        let url = new URL('profile/record/deck', config.serverHost);
        url.searchParams.append("id", id);
        let deck_response = await message_object.doFetch("identifier get deck", url.toString(), {});
        let deck = await deck_response.json();
        this.idInputer.value = id.toString();
        console.log(deck);
        this.setState({ currentDeck: deck });
    }

    download() {
        let element = document.createElement('a');
        let deck = this.state.currentDeck;
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(deck.deck.toString()));
        let name = `${deck.source}_${deck.id}_${deck.username}_${moment(deck.time)}.ydk`;
        element.setAttribute('download', name);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    recognize() {
        if (this.state.currentDeck == null) return;
        if (this.props.recognizeCallback != null)
            this.props.recognizeCallback(this.state.currentDeck.deck);
    }

    async next() {
        if (this.state.currentCount === this.state.sufficientDeckCount) {
            alert('已经到了队列底。');
            return;
        }
        let url = new URL('profile/record/id', config.serverHost);
        this.refs.time.setUrl(url);
        url.searchParams.append("user", this.userInputer.value);
        url.searchParams.append("source", this.sourceInputer.value);
        url.searchParams.append("id", this.idInputer.value);
        let id_response = await message_object.doFetch('identifier query id', url.toString(), {});
        let id = await id_response.json();
        this.setState({
            currentCount: this.state.currentCount + 1
        }, this.setDeckAccordingToId.bind(this, id.id));
    }

    async remove() {
        let id = this.idInputer.value;
        await this.next();
        let url = new URL('profile/record/clear', config.serverHost);
        url.searchParams.append('id', id);
        await message_object.doFetch('identifier query remove', url.toString(), { method: 'DELETE' });
    }

    async clear() {
        let url = new URL('profile/record/clear', config.serverHost);
        this.refs.time.setUrl(url);
        url.searchParams.append("user", this.userInputer.value);
        url.searchParams.append("source", this.sourceInputer.value);
        await message_object.doFetch('identifier query clear', url.toString(), { method: 'DELETE' });
        this.setState({
            currentCount: -1,
            sufficientDeckCount: -1
        });
    }

    render() {
        return <div>
            <InputGroup>
                <InputGroup.Addon>ID</InputGroup.Addon>
                <FormControl type="text" placeholder="ID" inputRef={(ref) => this.idInputer = ref}/>
                <InputGroup.Addon>时间</InputGroup.Addon>
                <MCProConsoleTimeRangePicker ref="time"/>
                <InputGroup.Addon>用户名</InputGroup.Addon>
                <FormControl type="text" placeholder="用户名" inputRef={(ref) => this.userInputer = ref}/>
                <InputGroup.Addon>来源</InputGroup.Addon>
                <FormControl type="text" placeholder="来源" inputRef={(ref) => this.sourceInputer = ref}/>
                <InputGroup.Addon>{ this.state.sufficientDeckCount >= 0 ? `${this.state.currentCount} / ${this.state.sufficientDeckCount}` : "/"}</InputGroup.Addon>
                <InputGroup.Button>
                    <Button onClick={this.startQuery.bind(this)}>确定</Button>
                </InputGroup.Button>
            </InputGroup>
            {
                this.state.currentDeck != null ?
                <div style={{margin: "10px 0px 10px 0px"}}>
                    <div style={{"text-align": "center", margin: "10px 0px 10px 0px"}}>
                        <Panel style={{margin: "10px 0px 10px 0px"}}>
                            { this.state.currentDeck.username + " 在 " + this.state.currentDeck.source + " 提交于 " + moment(this.state.currentDeck.time).format('YYYY-MM-DD HH:mm:ss') }
                        </Panel>
                        <ButtonGroup>
                            <Button onClick={ this.download.bind(this) }>下载</Button>
                            <Button onClick={ this.recognize.bind(this) }>检定</Button>
                            <Button onClick={ this.next.bind(this) }>下一个</Button>
                            <Button onClick={ this.remove.bind(this) }>移除</Button>
                            <Button onClick={ this.clear.bind(this) }>清除</Button>
                        </ButtonGroup>
                    </div>
                    <MCProConsoleIdentifierDeck deck={this.state.currentDeck.deck}/>
                </div>
                    : null
            }
        </div>
    }
}

export default MCProConsoleProfileDeckIdentifierRecordPanel