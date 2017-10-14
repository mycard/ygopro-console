import React, { Component } from 'react'
import { Col, Row, Panel, PanelGroup, ProgressBar, Well  } from 'react-bootstrap'
import { Modal, Button, FormControl, ControlLabel, FormGroup, Checkbox } from 'react-bootstrap'
import { message_object } from "../components/Message";
import MCProConsoleTimeRangePicker from "../components/Timerange"
import config from "../Config.json"
import moment from "moment"

class MCProConsoleUserVotePage extends Component
{
    constructor()
    {
        super();
        this.state = {
            data: [],
            editingVote: null
        };
        this.tickets = new Map();
        this.voteTitleBox = null;
        this.voteContentBox = null;
        this.voteStatus = null;
        this.voteMultiple = null;
        this.voteMaxCountBox = null;
    }

    componentDidMount()
    {
        this.loadData();
    }

    arrangeTickets(tickets)
    {
        let ticket_summary = new Map();
        for (let ticket of tickets)
            if (ticket_summary.has(ticket.option_id))
                ticket_summary.get(ticket.option_id).push(ticket);
            else
                ticket_summary.set(ticket.option_id, [ ticket ]);
        return ticket_summary;
    }

    loadData()
    {
        message_object.doFetch("votes", config.serverHost + "user/vote", {}, function (result) {
            result.json().then(function (result) {
                result.sort((a, b) => b.id - a.id);
                this.setState({ data: result });
            }.bind(this))
        }.bind(this));
    }

    onEnter()
    {
        let self = this[0];
        let vote = this[1];

        message_object.doFetch("tickets", config.serverHost + "user/vote/" + vote.id, {}, function (result) {
            result.json().then(function (result) {
                self.tickets.set(vote, result);
                self.forceUpdate();
            })
        })
    }

    onEdit(proxy, event)
    {
        let self = this[0];
        let vote = this[1];
        self.setState({ editingVote: vote });
        event.preventDefault();
    }

    renderModal(vote)
    {
        let startDay = {hour: 0, minute: 0, second: 0, millisecond: 0};
        let endDay = {hour: 23, minute: 59, second: 59, millisecond: 0};
        return <Modal show={this.state.editingVote} onHide={this.onCloseModal.bind(this)}>
            <Modal.Header>
                <Modal.Title>编辑投票</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <form>
                    <FormGroup>
                        <ControlLabel>投票标题</ControlLabel>
                        <FormControl type="text" defaultValue={vote.title} inputRef = {(ref) => { this.voteTitleBox = ref }} />
                        <Checkbox defaultChecked={vote.status} inputRef = {(ref) => { this.voteStatus = ref }}>可用</Checkbox>
                        <Checkbox defaultChecked={vote.multiple} inputRef = {(ref) => {this.voteMultiple = ref}}>多选投票</Checkbox>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>投票时间</ControlLabel>
                        <MCProConsoleTimeRangePicker ref="time" ranges={{
                            '今天': [moment().set(startDay), moment().set(endDay)],
                            '明天': [moment().add(1, 'days').set(startDay), moment().add(1, 'days').set(endDay)],
                            '未来 7 天': [moment().add(1, 'days').set(startDay), moment().add(7, 'days').set(endDay)],
                            '未来 15 天': [moment().add(1, 'days').set(startDay), moment().add(15, 'days').set(endDay)],
                            '未来 30 天': [moment().add(1, 'days').set(startDay), moment().add(30, 'days').set(endDay)],
                            '本月': [moment().startOf('month').set(startDay), moment().endOf('month').set(endDay)],
                            '下月': [moment().subtract(1, 'month').startOf('month').set(startDay), moment().add(1, 'month').endOf('month').set(endDay)]}}
                            startDate={moment(vote.start_time)}
                            endDate={moment(vote.end_time)}
                        />
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>投票选项</ControlLabel>
                        <FormControl componentClass="textarea" inputRef={(ref) => this.voteContentBox = ref} style={{height: '300px'}} defaultValue={vote.options.map((option) => option.name).join("\n")}/>
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel>投票数量</ControlLabel>
                        <FormControl type="text" defaultValue={vote.max} inputRef = {(ref) => { this.voteMaxCountBox = ref }} />
                    </FormGroup>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <Button bsStyle="primary" onClick={this.onCommitModal.bind(this)}>确定</Button>
                <Button onClick={this.onCloseModal.bind(this)}>取消</Button>
            </Modal.Footer>
        </Modal>
    }

    onCloseModal()
    {
        this.setState({editingVote: null});
    }

    onCommitModal()
    {
        let vote = this.state.editingVote;
        vote.title = this.voteTitleBox.value;
        let options_map = new Map();
        vote.options.forEach(option => options_map.set(option.name, option));
        vote.options = this.voteContentBox.value.split("\n");
        vote.options = vote.options.map((option) => { return options_map.has(option) ? options_map.get(option) : {name: option} });
        if (!vote.create_time) vote.create_time = moment();
        vote.status = this.voteStatus.checked;
        vote.multiple = this.voteMultiple.checked;
        vote.start_time = this.refs.time.state.startDate.format("YYYY-MM-DD HH:mm:ss");
        vote.end_time = this.refs.time.state.endDate.format("YYYY-MM-DD HH:mm:ss");
        vote.max = parseInt(this.voteMaxCountBox.value);
        console.log(vote);
        message_object.doFetch("commit modal", config.serverHost + "user/vote", { method: 'POST', body: JSON.stringify(vote) }, function (result) {
            return 'ok';
        });
        this.onCloseModal();
    }

    render()
    {
        return (
            <Row>
                <Col md={12}>
                    <PanelGroup accordion>
                        { this.state.data.map(function(vote) {
                            let tickets = this.tickets.has(vote) ? this.tickets.get(vote) : null;
                            let ticket_summary = tickets ? this.arrangeTickets(tickets) : null;
                            let header = <div>
                                {vote.title}
                                <span style={{float: 'right'}}><a onClick={this.onEdit.bind([this, vote])}>编辑</a></span>
                            </div>;
                            let state = "available";
                            if (moment().valueOf() > moment(vote.end_time).valueOf())
                                state = "ended";
                            if (moment().valueOf() < moment(vote.start_time).valueOf())
                                state = "future";
                            if (!vote.status)
                                state = "disable";
                            let state_names = {available: "可用", ended: "已结束", future: "未开始", disable: "已禁用"};
                            let state_style = {available: "info", ended: "success", future: "", disable: ""};
                            return <Panel header={header} eventKey={vote.id} onEnter={this.onEnter.bind([this, vote])} bsStyle={state_style[state]}>
                                <Well bsSize="small">
                                        {moment(vote.start_time).format("YYYY-MM-DD HH:mm:ss")} - {moment(vote.end_time).format("YYYY-MM-DD HH:mm:ss")}
                                        <span style={{float: "right"}}>{state_names[state]}</span>
                                </Well>
                            {
                                tickets
                                ? vote.options.map (function (option) {
                                    let option_tickets = option.key ? ticket_summary.get(option.key.toString()) : {};
                                    if (!option_tickets) option_tickets = [];
                                    return <div>
                                        <Col md={4} xs={12}>
                                            {option.name}
                                        </Col>
                                        <Col md={6} xs={6}>
                                            <ProgressBar striped now={option_tickets.length / tickets.length * 100}/>
                                        </Col>
                                        <Col md={2} xs={6}>
                                            {`${option_tickets.length}/${tickets.length}（${(option_tickets.length / tickets.length * 100).toFixed(3)}%）`}
                                        </Col>
                                    </div> })
                                : <div><ProgressBar striped active label="Loading..." now={100}/></div>
                            }
                        </Panel> }.bind(this))}
                    </PanelGroup>
                </Col>
                {
                    this.state.editingVote ? this.renderModal(this.state.editingVote) : ""
                }
            </Row>
        );
    }
}

export default MCProConsoleUserVotePage;