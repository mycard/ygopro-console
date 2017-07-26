import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import MCProConsoleNavigationBar from './NavigationBar'
import MCProConsoleWelcomePage from './pages/welcome'
import MCProConsoleDatabasePage from './pages/database'
import MCProConsoleImageManagerStatePage from './pages/image-state'
import MCProConsoleImageManagerSinglePage from './pages/image-single'
import MCProConsoleImageManagerCommandPage from './pages/image-command'
import MCProConsoleImageManagerConfigPage from './pages/image-config'
import MCProConsoleAnalyticsGeneralPage from './pages/analytics-general'
import MCUserManagePage from './pages/user'
import {messages} from './Message'
import './App.css';
import config from './Config.json'


class App extends Component {

    componentDidMount()
    {
    }

  render() {
    return (
      <div className="App">
          <Router basename="/ygopro/console">
              <div className="container">
                <MCProConsoleNavigationBar />
                  <Route exact path="/" component={MCProConsoleWelcomePage} />
                  <Route path="/user" component={MCUserManagePage} />
                  <Route path="/database" component={MCProConsoleDatabasePage}/>
                  <Route path="/image/state" component={MCProConsoleImageManagerStatePage}/>
                  <Route path="/image/command" component={MCProConsoleImageManagerCommandPage}/>
                  <Route path="/image/single" component={MCProConsoleImageManagerSinglePage}/>
                  <Route path="/image/config" component={MCProConsoleImageManagerConfigPage}/>
                  <Route path="/analytics/general" component={MCProConsoleAnalyticsGeneralPage} />
              </div>
          </Router>
          {messages}
      </div>
    );
  }
}

export default App;