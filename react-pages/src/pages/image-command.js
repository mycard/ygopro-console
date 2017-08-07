import React, { Component } from 'react'
import { Row, Col, Button, ButtonGroup } from 'react-bootstrap'
import MCProConsoleGitStatus from '../components/GitStatus'
import MCProConsoleLocaleList from '../components/LocaleList'
import Config from '../Config.json'
import MCProConsoleArchive from "../components/Archive";
import {message_object} from '../components/Message'

class MCProConsoleImageManagerCommandPage extends Component
{
    handleRunDiff()
    {
        this.handleRun('diff')
    }

    handleRunAll()
    {
        this.handleRun('all')
    }

    handleRun(key)
    {
        let locale = this.refs.localeList.state.currentLocale;
        message_object.doFetch('image_command_' + locale + '_' + key, Config.imageServerHost + "run/" + locale + '/' + key,
            { method:'POST', body: 'page update request'}, function (result) {
                return result.text();
        });
    }

    onLocaleChanged(locale)
    {
        this.refs.archive.setState({'locale': locale});
    }

    render()
    {
        return (
            <Row>
                <Col md={12}>
                    <h2 className="page-header">
                        执行&nbsp;&nbsp;&nbsp;
                        <MCProConsoleLocaleList ref="localeList" showAll={true} localeChanged={this.onLocaleChanged.bind(this)} />
                    </h2>
                    <ButtonGroup>
                        <Button bsSize="large" onClick={this.handleRunDiff.bind(this)} bsStyle="warning">差量更新</Button>
                        <Button bsSize="large" onClick={this.handleRunAll.bind(this)} bsStyle="danger">全部重制</Button>
                    </ButtonGroup>
                </Col>
                <Col md={12}>
                    <h2 className="page-header">Git</h2>
                    <MCProConsoleArchive ref="archive" name="存档" uri={Config.imageServerHost + "archive"} />
                    <MCProConsoleGitStatus name="MSE" uri={Config.imageServerHost + "mse"} />
                    <MCProConsoleGitStatus name="数据库" uri={Config.imageServerHost + "database"} />
                    <MCProConsoleGitStatus name="中间图" uri={Config.imageServerHost + "raw"} />
                </Col>
            </Row>
        )
    }
}

export default MCProConsoleImageManagerCommandPage
