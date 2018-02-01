import React, { Component } from 'react'
import { Tab, Row, Col, DropdownButton, MenuItem, InputGroup, Button, FormControl, Nav, NavItem, Modal, Panel, ListGroup, ListGroupItem } from 'react-bootstrap'
import MCProConsoleIdentifierSet from './identifier/set'
import MCProConsoleIdentifierDeck from './identifier/deck'
import MCProConsoleIdentifierClassification from './identifier/classification'
import config from '../Config.json'
import { message_object } from "../components/Message";
import "./profile-deck-identifier.css"

class MCProConsoleProfileDeckIdentifierPage extends Component {
    constructor() {
        super();
        this.state = {
            tab: "runtime",
            target: "test",
            fileList: [],
            runtimeType: "deck",
            runtimeClassification: null,
            runtimeSet: null,
            runtimeDeck: null,
            runtimeList: null,
            runtimeResult: null,
            reportTitle: "",
            reportContent: null
        }
    }

    componentDidMount() {
        this.loadFileList();
        this.loadRuntimeList();
    }

    loadFileList() {
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/file/list";
        message_object.doFetch("identifier file list", url, {}, function (back) {
            back.json().then(function (json) {
                this.setState({fileList: json})
            }.bind(this))
        }.bind(this));
    }

    loadRuntimeList() {
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/runtime/list";
        message_object.doFetch("identifier runtime list", url, {}, function (back) {
            back.json().then(function (json) {
                this.setState({runtimeList: json})
            }.bind(this))
        }.bind(this));
    }

    reload() {
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/reload";
        message_object.doFetch("identifier reload", url, { method: 'POST' }, function (back) {
            back.text().then(function (text) {
                this.setState({reportTitle: "编译完成", reportContent: text})
            }.bind(this))
        }.bind(this));
    }

    closeReport() {
        this.setState({reportContent: null})
    }

    loadTargetFile(eventKey) {
        this.fileName.value = eventKey;
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/file/single/" + eventKey;
        message_object.doFetch("identifier load file", url, {}, function (back) {
            back.text().then(function (text) {
                this.fileContent.value = text
            }.bind(this))
        }.bind(this));
    }

    uploadTargetFile() {
        let fileName = this.fileName.value;
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/file/" + fileName;
        message_object.doFetch("identifier upload file", url, { method: 'PUT', body: this.fileContent.value }, function (back) {

        });
    }

    compileFile() {
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/preview";
        message_object.doFetch("identifier compile", url, { method: 'POST', body: this.fileContent.value }, function (back) {
            back.text().then(function (text) {
                this.setState({reportTitle: "编译完成", reportContent: text, tab: "runtime"}, function () {
                    this.onEnvironmentChanged("compile");
                    this.clearRuntime();
                }.bind(this))
            }.bind(this))
        }.bind(this));
    }

    pullFile() {
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/file/pull";
        message_object.doFetch("identifier pull", url, {method: 'POST'}, function (back) {
            back.text().then(function (text) {
                this.setState({reportTitle: "操作完成", reportContent: text})
            }.bind(this))
        }.bind(this));
    }

    pushFile() {
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/file/push";
        message_object.doFetch("identifier post", url, { method: 'POST' }, function (back) {
            back.text().then(function (text) {
                this.setState({reportTitle: "操作完成", reportContent: text})
            }.bind(this))
        }.bind(this));
    }

    loadRuntimeStructure(e) {
        if (this.queryName.value === "") {
            this.setState({runtimeSet: null, runtimeClassification: null, runtimeDeck: null});
            return
        }
        let url = config.serverHost + "profile/identifier/" + this.state.target + "/runtime/" + this.state.runtimeType + "/" + this.queryName.value;
        message_object.doFetch("identifier runtime", url, {}, function (back) {
            back.json().then(function (json) {
                if (this.state.runtimeType === "set")
                    this.setState({ runtimeSet: json });
                else
                    this.setState({ runtimeClassification: json });
            }.bind(this))
        }.bind(this));
        e.preventDefault()
    }

    onFileChanged(event) {
        let file = event.target.files[0];
        if (!file) return;
        let reader = new FileReader();
        reader.onload = function (e) {
            this.setState({runtimeDeck: e.target.result});
            this.sendDeckCheck();
        }.bind(this);
        reader.readAsText(file);
    }

    sendDeckCheck() {
        let url = config.serverHost + "profile/identifier/" + this.state.target;
        let form = new FormData();
        form.append("deck", this.state.runtimeDeck);
        message_object.doFetch("identifier check", url, { method: 'POST', body: form }, function (back) {
            back.json().then(function (json) {
                console.log(json);
                this.setState({runtimeResult: json})
            }.bind(this))
        }.bind(this))
    }

    onEnvironmentChanged(eventKey) {
        this.setState({target: eventKey}, function () {
            this.loadFileList();
            this.loadRuntimeList();
        }.bind(this))
    }

    onKbdClicked(event) {
        let name = event.currentTarget.textContent;
        this.queryName.value = name;
        this.loadRuntimeStructure.call(this, event)
    }

    onClassificationKbdClicked(event) {
        let name = event.currentTarget.textContent;
        this.queryName.value = name;
        this.setState({ runtimeType: "tag", runtimeSet: null }, function () {
            this.loadRuntimeStructure.call(this, event);
        }.bind(this));
    }

    onClassificationSetClicked(event) {
        let name = event.currentTarget.textContent;
        this.queryName.value = name;
        this.setState({ runtimeType: "set" }, function () {
            this.loadRuntimeStructure.call(this, event);
        }.bind(this));
    }

    switchRuntimeStructure(eventKey) {
        this.setState({runtimeType: eventKey})
    }

    switchTab(eventKey) {
        this.setState({tab: eventKey})
    }

    clearRuntime() {
        this.setState({runtimeDeck: null, runtimeSet: null, runtimeClassification: null, runtimeResult: null})
    }

    render() {
        return <Col md={12} xs={12}>
            <Tab.Container id="tab" activeKey={this.state.tab} onSelect={this.switchTab.bind(this)}>
                <Row>
                    <Col md={2}>
                        <Nav bsStyle="pills" stacked style={{padding: "10px 0px 0px 0px"}}>
                            <InputGroup style={{margin: "0px 0px 10px 3px"}}>
                                <InputGroup.Addon>对象</InputGroup.Addon>
                                <DropdownButton id="query_type" title={{test: "测试", production: "生产", compile: "编译"}[this.state.target]} componentClass={InputGroup.Button} onSelect={this.onEnvironmentChanged.bind(this)}>
                                    <MenuItem eventKey="test">测试</MenuItem>
                                    <MenuItem eventKey="production">生产</MenuItem>
                                    <MenuItem eventKey="compile">编译结果</MenuItem>
                                </DropdownButton>
                            </InputGroup>
                            <NavItem eventKey="files">文件操作</NavItem>
                            <NavItem eventKey="runtime">运行时</NavItem>
                            <NavItem eventKey="record">记录</NavItem>
                            <Button bsStyle="danger" block onClick={this.reload.bind(this)}>重置当前对象</Button>
                        </Nav>
                    </Col>
                    <Col md={10}>
                        {
                            this.state.reportContent ?
                                <div className="static-modal">
                                        <Modal show={this.state.reportContent} onHide={this.closeReport.bind(this)}>
                                            <Modal.Header>
                                                <Modal.Title>{this.state.reportTitle}</Modal.Title>
                                            </Modal.Header>
                                            <Modal.Body>
                                                { this.state.reportContent.split("\n").map((line) => <p>{line}</p>) }
                                            </Modal.Body>
                                            <Modal.Footer>
                                                <Button onClick={this.closeReport.bind(this)}>确定</Button>
                                            </Modal.Footer>

                                        </Modal>
                                </div>
                                : null
                        }
                        <Tab.Content animation style={{margin: "10px 0px 0px 0px"}}>
                            <Tab.Pane eventKey="files">
                                <InputGroup>
                                    <InputGroup.Addon>文件名</InputGroup.Addon>
                                    <FormControl type="text" placeholder="文件名" inputRef={ ref => this.fileName = ref }/>
                                    <InputGroup.Button>
                                        <DropdownButton id="file_name" title="文件" onSelect={this.loadTargetFile.bind(this)}>
                                            { this.state.fileList.map((file) => <MenuItem eventKey={file}>{file}</MenuItem>) }
                                        </DropdownButton>
                                        <Button type="submit" onClick={this.compileFile.bind(this)}>编译</Button>
                                        <Button type="" bsStyle="primary" onClick={this.uploadTargetFile.bind(this)}>上传</Button>
                                        <Button onClick={this.pullFile.bind(this)}>PULL</Button>
                                        <Button onClick={this.pushFile.bind(this)} bsStyle="danger">PUSH</Button>
                                    </InputGroup.Button>
                                </InputGroup>
                                <FormControl componentClass="textarea" placeholder="" inputRef={ ref => this.fileContent = ref } style={{margin: "10px 0 0 0", height: "800px"}} />
                            </Tab.Pane>
                            <Tab.Pane eventKey="runtime">
                                <InputGroup style={{margin: "0px 0px 10px 0px"}}>
                                    <InputGroup.Addon>查询</InputGroup.Addon>
                                    <FormControl type="text" placeholder="查询名" inputRef={ ref => this.queryName = ref }/>
                                    <InputGroup.Button>
                                        <DropdownButton id="runtime_type" title={{deck: "卡组", tag: "标签", set: "集合"}[this.state.runtimeType]} onSelect={this.switchRuntimeStructure.bind(this)}>
                                            <MenuItem eventKey="deck">卡组</MenuItem>
                                            <MenuItem eventKey="tag">标签</MenuItem>
                                            <MenuItem eventKey="set">集合</MenuItem>
                                        </DropdownButton>
                                        <Button type="submit" bsStyle="primary" onClick={this.loadRuntimeStructure.bind(this)}>查询</Button>
                                        <Button onClick={ () => this.refs.input_file.click() }>检查卡组</Button>
                                        <input type="file" ref="input_file" name="input_file" accept=".ydk" style={{display: "none"}} onChange={this.onFileChanged.bind(this)} />
                                    </InputGroup.Button>
                                </InputGroup>
                                { this.state.runtimeDeck ? <Col md={8} xs={12}><MCProConsoleIdentifierDeck deck={this.state.runtimeDeck}/></Col> : null }
                                { this.state.runtimeResult ?
                                    <Col md={4} xs={12}>
                                        <Panel header="检验结果">
                                            { this.state.runtimeResult.deck }
                                            <ListGroup fill>
                                                { this.state.runtimeResult.tag.map((tag) => <ListGroupItem>{tag}</ListGroupItem>) }
                                            </ListGroup>
                                        </Panel>
                                    </Col>
                                    : null
                                }
                                { this.state.runtimeClassification ? <MCProConsoleIdentifierClassification classification={this.state.runtimeClassification}
                                                                                                           onTagClick={this.onClassificationKbdClicked.bind(this)}
                                                                                                           onSetClick={this.onClassificationSetClicked.bind(this)}/> : null }
                                { this.state.runtimeSet ? <MCProConsoleIdentifierSet set={this.state.runtimeSet}/> : null }
                                <div style={{overflowWrap: "break-word"}}>
                                {
                                    !this.state.runtimeClassification && !this.state.runtimeSet && !this.state.runtimeDeck && this.state.runtimeList ?
                                        this.state.runtimeList[this.state.runtimeType + "s"].map((name) => <a onClick={this.onKbdClicked.bind(this)} ><kbd style={{margin: "2px"}} >{name}</kbd></a>)
                                        : null
                                }
                                </div>
                            </Tab.Pane>
                            <Tab.Pane eventKey="record">
                                没做
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>
        </Col>
    }
}

export default MCProConsoleProfileDeckIdentifierPage
//if (this.state.temp == null)
//    return null
/*
return <Col md={6}>
    <div>
        Hey
        <input ref="file" type="file" className="file" onChange={this.onFileChanged.bind(this)} />
        <MCProConsoleIdentifierDeck name="temp" deck={this.state.temp} />
    </div>
</Col>
*/