import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'
import MCProConsoleNavigationBar from './NavigationBar'
import MCProConsoleWelcomePage from './pages/welcome'
import MCProConsoleDatabasePage from './pages/update-database'
import MCProConsoleUpdatePackagePage from './pages/update-package'
import MCProConsoleUserQueryPage from './pages/user-query'
import MCProConsoleUserMessagePage from './pages/user-messages'
import MCProConsoleUserVotePage from './pages/user-vote'
import MCProConsoleImageManagerStatePage from './pages/image-state'
import MCProConsoleImageManagerSinglePage from './pages/image-single'
import MCProConsoleImageManagerCommandPage from './pages/image-command'
import MCProConsoleImageManagerConfigPage from './pages/image-config'
import MCProConsoleAnalyticsGeneralPage from './pages/analytics-general'
import MCProConsoleAnalyticsHistoryPage from './pages/analytics-history'
import MCProConsoleAnalyticsCustomPage from './pages/analytics-custom'
import MCProConsoleAnalyticsCustomSetPage from './pages/analytics-custom-set'
import MCProConsoleAnalyticsDailyPage from './pages/analytics-daily'
import MCProConsoleAnalyticsDeckPage from './pages/analytics-deck'
import MCProConsoleAnalyticsSinglePage from './pages/analytics-single'
import MCProConsoleProfileDeckIdentifierPage from './pages/profile-deck-identifier'
import {messages} from './components/Message'
import './App.css';
import MCProConsoleUserBanPage from "./pages/user-ban";
import MCProConsoleAnalyticsMatchupPage from "./pages/analytics-matchup";

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
                  <Route path="/users/query" component={MCProConsoleUserQueryPage} />
                  <Route path="/users/messages" component={MCProConsoleUserMessagePage} />
                  <Route path="/users/vote" component={MCProConsoleUserVotePage} />
                  <Route path="/users/ban" component={MCProConsoleUserBanPage} />
                  <Route path="/update/database" component={MCProConsoleDatabasePage}/>
                  <Route path="/update/package" component={MCProConsoleUpdatePackagePage}/>
                  <Route path="/image/state" component={MCProConsoleImageManagerStatePage}/>
                  <Route path="/image/command" component={MCProConsoleImageManagerCommandPage}/>
                  <Route path="/image/single" component={MCProConsoleImageManagerSinglePage}/>
                  <Route path="/image/config" component={MCProConsoleImageManagerConfigPage}/>
                  <Route path="/analytics/general" component={MCProConsoleAnalyticsGeneralPage} />
                  <Route path="/analytics/history" component={MCProConsoleAnalyticsHistoryPage} />
                  <Route path="/analytics/custom" component={MCProConsoleAnalyticsCustomPage} />
                  <Route path="/analytics/custom-set" component={MCProConsoleAnalyticsCustomSetPage} />
                  <Route path="/analytics/daily" component={MCProConsoleAnalyticsDailyPage} />
                  <Route path="/analytics/deck" component={MCProConsoleAnalyticsDeckPage} />
                  <Route path="/analytics/single" component={MCProConsoleAnalyticsSinglePage} />
                  <Route path="/analytics/matchup" component={MCProConsoleAnalyticsMatchupPage} />
                  <Route path="/profiles/deck" component={MCProConsoleProfileDeckIdentifierPage} />
              </div>
          </Router>
          {messages}
      </div>
    );
  }
}

export default App;