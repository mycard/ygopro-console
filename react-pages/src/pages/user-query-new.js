import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {
    Row,
    Col,
    Table,
    Form,
    FormGroup,
    InputGroup,
    FormControl,
    Button,
    Modal
} from 'react-bootstrap';
import {message_object} from '../components/Message'
import MCProConsolePagedTable from '../components/PagedTable'
import MCProConsoleSelectableButton from '../components/SelectableButton'
import MCProConsoleMycardUser from '../components/MCUser'
import MCProConsoleAnalyticsHistoryPage from './analytics-history'
import { changeQuery, urlDecorator } from '../components/Utils'
import config from '../Config.json'
import moment from 'moment'
import './user-query-new.css'

class MCProConsoleUserManagePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showingDetail: false,
            username: null,
            user_data_mc: null,
            user_data_info: null,
            user_data_usedname: null,
            modal: null
        };
        this.onCommitModal = null;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.location.state === 'fromLink') {
            this.loadURLParameter();
            document.body.scrollTop = 0;
        }
    }

    componentDidMount() {
        this.loadURLParameter();
    }

    loadURLParameter() {
        let params = new URL(window.location).searchParams;
        let search = params.get("search");
        if (search != null) {
            ReactDOM.findDOMNode(this.refs.searching_username).value = search;
            this.setState({ showingDetail: false }, () => this.refs.searchingUserTable.handleQuery());
            return;
        }
        let user = params.get("user");
        if (user != null) {
            ReactDOM.findDOMNode(this.refs.searching_username).value = user;
            this.clickUser({ username: user }, false);
            return;
        }
        {
            ReactDOM.findDOMNode(this.refs.searching_username).value = "";
            this.setState({ showingDetail: false, username: null }, () => this.refs.searchingUserTable.removeData());
        }
    }


    render() {
        return <div>
            <Row>
                <Col md={12} xs={12}>
                    <Form>
                        <FormGroup>
                            <InputGroup>
                                <InputGroup.Button>
                                    <MCProConsoleSelectableButton id="searching by" ref="searchBy"
                                                                  choices={{name: "用户名", ip: "IP"}}/>
                                </InputGroup.Button>
                                <FormControl type="text" ref="searching_username" placeholder="输入要查询的用户"/>
                                <InputGroup.Button>
                                    <Button type="submit"
                                            onClick={this.searchUser.bind(this)}>确定</Button>
                                </InputGroup.Button>
                            </InputGroup>
                        </FormGroup>
                    </Form>
                </Col>
            </Row>
            {
                !this.state.showingDetail ? this.renderSearchPage() : this.renderDetailPage()
            }
        </div>
    }

    renderUserAvatar(data, size = 32) {
        return data.avatar == null ? null : <img alt={data.username} className="img-circle" width={size} height={size} src={"https://cdn01.moecube.com/" + data.avatar} />
    }

    renderSearchPage() {
        return <Row>
            <Col md={12} xs={12}>
                <MCProConsolePagedTable ref="searchingUserTable" key="user search"
                                        thead={["", "id", "用户名", "邮箱", "注册时间"]}
                                        urlGenerator={function () {
                                            let url = new URL(config.serverHost + "user2/search/" + this.refs.searchBy.state.choice);
                                            url.searchParams.append(this.refs.searchBy.state.choice == 'ip' ? 'ip' : "user",
                                                ReactDOM.findDOMNode(this.refs.searching_username).value);
                                            return url;
                                        }.bind(this)}
                                        tbodyGenerator={function (data) {
                                            return <tr onClick={this.clickUser.bind(this, data)}>
                                                <td width={36}>{this.renderUserAvatar(data)}</td>
                                                <td>{data.id}</td>
                                                <td>{data.username}</td>
                                                <td>{data.email}</td>
                                                <td>{moment(data.created_at).format('YYYY-MM-DD')}</td>
                                            </tr>
                                        }.bind(this)}
                />

            </Col>
        </Row>
    }

    searchUser(e) {
        e.preventDefault();
        //history.replace(this.props.location.pathname, { search: ReactDOM.findDOMNode(this.refs.searching_username).value, user: null });
        changeQuery({ search: ReactDOM.findDOMNode(this.refs.searching_username).value, user: null });
        this.setState({ username: null, showingDetail: false }, function () {
            this.refs.searchingUserTable.handleQuery();
        }.bind(this));
    }

    clickUser(data, addHistory = true) {
        if (addHistory) changeQuery({ search: null, user: data.username });
        this.setState({ username: data.username }, async function () {
            await this.collectUserData();
            this.setState({ showingDetail: true }, this.collectUserOther);
        }.bind(this))
    }

    async collectUserData() {
        let username = this.state.username;
        let uriHead = `${config.serverHost}user2/detail/${username}`;
        let result_mcuser = await message_object.doFetch("user mcuser", `${uriHead}/mc`, {});
        let result_userinfo = await message_object.doFetch("user userinfo", `${uriHead}/userinfo`, {});
        let mcuser = await result_mcuser.json();
        let userinfo = await result_userinfo.json();
        this.setState({ user_data_mc: mcuser[0], user_data_info: userinfo[0] });
    }

    async collectUserOther() {
        this.refs.userScoreTable.handleQuery();
        this.refs.userBanTable.handleQuery();
        this.refs.dpChangeHistoryTable.handleQuery();
    }

    renderDetailPage() {
        // 要展示的信息：
        // MC.user 表的信息（用户基本信息）
        // MC.username_change_history 表的信息（用户曾用名）
        // user_info表的信息（用户状态）
        // user_banned_history 的信息（封禁记录）
        // user_historical_record 的信息（历史战绩）
        // battle_history 的信息（用户的游戏履历）
        // 可更改：
        // PT、EXP、封禁
        return <Row>
            {this.renderDetailMCUser(this.state.user_data_mc)}
            <Row>
                {this.renderDetailUserInfo(this.state.user_data_info)}
                {this.renderDetailBannedHistory()}
            </Row>
            {this.renderDetailHistoricalRecord()}
            {this.renderDetailBattleHistory()}
            {this.renderModal()}
            {this.state.user_data_usedname == null ? null : this.renderUsednameModal()}
        </Row>
    }

    renderDetailMCUser(data) {
        if (!data) return null;
        return <Col xs={12} md={6}>
            <h2 className="page-header">{this.renderUserAvatar(data, 40)}  MC用户信息</h2>
            <Table striped bordered hover>
                <thead>
                <tr><th>名称</th><th>值</th></tr>
                </thead>
                <tbody>
                <tr><td>ID</td><td>{data.id}</td></tr>
                <tr><td>用户名</td><td>{data.username} <a style={{float: "right"}} onClick={this.viewUsedName.bind(this)}>点击查看曾用名</a></td></tr>
                <tr><td>昵称</td><td>{data.name}</td></tr>
                <tr><td>邮箱</td><td>{data.email}</td></tr>
                <tr><td>管理员</td><td>{data.admin ? '是' : '否'}</td></tr>
                <tr><td>语言</td><td>{data.locale}</td></tr>
                <tr><td>注册IP</td><td>{data.registration_ip_address} <a style={{float: "right"}} onClick={this.query_ip.bind(this, "registration_ip_address")}>查询此 IP</a></td></tr>
                <tr><td>最后登录IP</td><td>{data.ip_address} <a style={{float: "right"}} onClick={this.query_ip.bind(this, "ip_address")}>查询此 IP</a></td></tr>
                <tr><td>创建时间</td><td>{moment(data.created_at).format('YYYY-MM-DD HH:mm:ss')}</td></tr>
                <tr><td>最后变动时间</td><td>{moment(data.updated_at).format('YYYY-MM-DD HH:mm:ss')}</td></tr>
                </tbody>
            </Table>
        </Col>;
    }

    async viewUsedName() {
        let url = `${config.serverHost}user2/detail/${this.state.username}/usedname`;
        let result = await message_object.doFetch("user used name", url, {});
        let used = await result.json();
        if (used == null || used.length === 0)
            alert("该用户未曾更改名称！");
        else
            this.setState({user_data_usedname: used});
    }

    query_ip(ip_attribute) {
        let ip = this.state.user_data_mc[ip_attribute];
        ReactDOM.findDOMNode(this.refs.searching_username).value = ip;
        this.refs.searchBy.setState({choice: 'ip'}, function () {
            this.setState({ showingDetail: false }, function () {
                this.refs.searchingUserTable.handleQuery();
            }.bind(this));
        }.bind(this));
    }

    renderDetailUserInfo(data) {
        if (!data)
            return <Col xs={12} md={6}><h2 className="page-header">YGO用户信息</h2>该用户未曾参加任何匹配游戏。</Col>;
        else return <Col xs={12} md={6}>
            <h2 className="page-header">YGO用户信息</h2>
            <Table striped bordered hover>
                <thead>
                <tr><th>名称</th><th>值</th></tr>
                </thead>
                <tbody>
                <tr onClick={this.setExp.bind(this)}><td>EXP</td><td>{data.exp} <a style={{float: "right"}}>点击以修改</a></td></tr>
                <tr onClick={this.setPt.bind(this)}><td>PT</td><td>{data.pt.toFixed(3)} <a style={{float: "right"}}>点击以修改</a></td></tr>
                <tr><td>娱乐</td><td>{this.renderWinRate(data, "entertain")}</td></tr>
                <tr><td>竞技</td><td>{this.renderWinRate(data, "athletic")}</td></tr>
                </tbody>
            </Table>
        </Col>;
    }

    renderWinRate(data, prefix) {
        let win = data[prefix + "_win"];
        let draw = data[prefix + "_draw"];
        let lose = data[prefix + "_lose"];
        let sum = win + draw + lose;
        return <span>{win}/{draw}/{lose}（胜率 {(win * 100 / sum).toFixed(2)}%）</span>
    }

    setExp() {
        this.onCommitModal = this.commitSetExp.bind(this);
        this.setState({ modal: { title: "修改 EXP", prepend: "更改EXP为", placeholder: this.state.user_data_info.exp }});
    }

    setPt() {
        this.onCommitModal = this.commitSetPt.bind(this);
        this.setState({ modal: { title: "修改 PT", prepend: "更改PT为", placeholder: this.state.user_data_info.pt }});
    }

    commitSetExp() {
        let value = ReactDOM.findDOMNode(this.refs.modalInput).value;
        let url = new URL(`${config.serverHost}user2/${this.state.username}/exp`);
        url.searchParams.append("value", value);
        message_object.doFetch("user set exp", url.toString(), { method: 'POST' }, function () {
            this.setState({modal: null});
            this.collectUserData();
        }.bind(this));
    }

    commitSetPt() {
        let value = parseFloat(ReactDOM.findDOMNode(this.refs.modalInput).value);
        let url = new URL(`${config.serverHost}user2/${this.state.username}/pt`);
        url.searchParams.append("value", value);
        message_object.doFetch("user set pt", url.toString(), { method: 'POST' }, function () {
            this.setState({modal: null});
            this.collectUserData();
        }.bind(this));
    }

    renderDetailBannedHistory() {
        return <Col xs={12} md={6}>
            <h2 className="page-header">封禁记录</h2>
            <MCProConsolePagedTable ref="userBanTable" key="user ban" noDataDescription="该用户没有封禁记录"
                                        thead={["从", "至"]}
                                        urlGenerator={function () {
                                            let url = new URL(config.serverHost + `user2/detail/${this.state.username}/ban`);
                                            return url;
                                        }.bind(this)}
                                        tbodyGenerator={function (data) {
                                            return <tr>
                                                <td>{moment(data.from).format('YYYY-MM-DD HH:mm:ss')}</td>
                                                <td>{moment(data.at).format('YYYY-MM-DD HH:mm:ss')}</td>
                                            </tr>
                                        }}>
                <tr>
                    <td colSpan="2"><a style={{float: "center"}} onClick={this.setBan.bind(this)}>点此封禁该用户</a></td>
                </tr>
            </MCProConsolePagedTable>
            
        </Col>
    }

    setBan() {
        this.onCommitModal = this.commitSetBan.bind(this);
        this.setState({ modal: { title: "封禁用户", prepend: "封禁小时数", placeholder: "24" }});
    }

    commitSetBan() {
        let value = ReactDOM.findDOMNode(this.refs.modalInput).value;
        let url = new URL(`${config.serverHost}user2/${this.state.username}/ban`);
        url.searchParams.append("value", value);
        message_object.doFetch("user set ban", url.toString(), { method: 'POST' }, function () {
            this.setState({modal: null});
            this.collectUserOther();
        }.bind(this));
    }

    renderDetailHistoricalRecord() {
        return <Col xs={12} md={12}>
            <h2 className="page-header">历史成绩</h2>
            <MCProConsolePagedTable ref="userScoreTable" key="user history"
                                        thead={["月", "PT", "排名", "娱乐", "竞技", "备注"]}
                                        urlGenerator={function () {
                                            let url = new URL(config.serverHost + `user2/detail/${this.state.username}/score`);
                                            return url;
                                        }.bind(this)}
                                        tbodyGenerator={function (data) {
                                            return <tr>
                                                <td>{data.season}</td>
                                                <td>{data.pt.toFixed(3)}（{data.correction.toFixed(3)}）</td>
                                                <td>{data.rank === 0 ? "未统计" : data.rank}</td>
                                                <td>{this.renderWinRate(data, "entertainment")}</td>
                                                <td>{this.renderWinRate(data, "athletic")}</td>
                                                <td>{data.note}</td>
                                            </tr>
                                        }.bind(this)}/>
        </Col>
    }

    renderDetailBattleHistory() {
        return <Col md={12}
                    xs={12}>
            <h2 className="page-header">PT 变动履历</h2>
            <MCProConsolePagedTable ref="dpChangeHistoryTable"
                                    thead={['对手', '变动', '时间', '持有卡组']}
                                    key="user match"
                                    urlGenerator={function () {
                                        let url = new URL(config.serverHost + "analyze/history");
                                        let name = this.state.username;
                                        url.searchParams.set("name", name);
                                        url.searchParams.set("type", "athletic");
                                        return url;
                                    }.bind(this)}
                                    tbodyGenerator={function (data) {
                                        let name = this.state.username;

                                        let start_time = moment(data.start_time);
                                        let timespan = moment(data.end_time).diff(start_time, 'seconds');
                                        return <tr>
                                            <td><MCProConsoleMycardUser username={name === data.usernamea ? data.usernameb : data.usernamea} /></td>
                                            <td>{name === data.usernamea
                                                ? data.userscorea + ':' + data.userscoreb
                                                : data.userscoreb + ':' + data.userscorea}（{name === data.usernamea
                                                ? MCProConsoleAnalyticsHistoryPage.toSignedNumber(data.pta - data.pta_ex)
                                                : MCProConsoleAnalyticsHistoryPage.toSignedNumber(data.ptb - data.ptb_ex)}）</td>
                                            <td><kbd>{start_time.format('MM-DD')}</kbd>&nbsp;{start_time.format('HH:mm')}
                                                <span className={timespan < 180 ? "not-enough-time" : ""}>{' (' + Math.floor(timespan / 60) + 'min ' + timespan % 60 + 's)'}</span>
                                            </td>
                                            <td>{ name === data.usernamea ? data.decka : data.deckb }</td>
                                        </tr>
                                    }.bind(this)}
            />
        </Col>
    }

    renderModal() {
        return <Modal show={this.state.modal != null}
                      onHide={() => this.setState({modal: null})}>
            <Modal.Header>
                <Modal.Title>{this.state.modal == null ? "" : this.state.modal.title}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <InputGroup>
                    <InputGroup.Addon>{this.state.modal == null ? "" : this.state.modal.prepend}</InputGroup.Addon>
                    <FormControl type="text"
                                 ref="modalInput"
                                 placeholder={this.state.modal == null ? "" : this.state.modal.placeholder}/>
                </InputGroup>
            </Modal.Body>

            <Modal.Footer>
                <Button bsStyle="primary"
                        onClick={() => this.onCommitModal.call(this)}>确定</Button>
                <Button onClick={() => this.setState({modal: null})}>取消</Button>
            </Modal.Footer>
        </Modal>
    }

    renderUsednameModal() {
        return <Modal show={true} onHide={() => this.setState({ user_data_usedname: null })}>
            <Modal.Header>
                <Modal.Title> 用户名修改记录 </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row>
                    <Col md={6} xs={6}>用户名</Col>
                    <Col md={6} xs={6}>使用直到</Col>
                </Row>
                {
                    this.state.user_data_usedname.map((data) => <Row>
                        <Col md={6} xs={6}>{data.old_username}</Col>
                        <Col md={6} xs={6}>{moment(data.change_time).format("YYYY-MM-DD HH:mm:ss")}</Col>
                    </Row>)
                }
            </Modal.Body>

            <Modal.Footer>
                <Button bsStyle="primary" onClick={() => this.setState({ user_data_usedname: null })}>确定</Button>
            </Modal.Footer>
        </Modal>
    }
}

urlDecorator(MCProConsoleUserManagePage)(MCProConsoleUserManagePage.prototype.loadURLParameter)
export default MCProConsoleUserManagePage