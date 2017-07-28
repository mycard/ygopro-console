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
import MCProConsoleAnalyticsHistoryPage from './pages/analytics-history'
import MCProConsoleAnalyticsCustomPage from './pages/analytics-custom'
import MCProConsoleAnalyticsCustomSetPage from './pages/analytics-custom-set'
import MCProConsoleAnalyticsDeckPage from './pages/analytics-deck'
import MCUserManagePage from './pages/user'
import {messages} from './Message'
import './App.css';

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
                  <Route path="/analytics/history" component={MCProConsoleAnalyticsHistoryPage} />
                  <Route path="/analytics/custom" component={MCProConsoleAnalyticsCustomPage} />
                  <Route path="/analytics/custom-set" component={MCProConsoleAnalyticsCustomSetPage} />
                  <Route path="/analytics/deck" component={MCProConsoleAnalyticsDeckPage} />
              </div>
          </Router>
          {messages}
      </div>
    );
  }
}

export default App;