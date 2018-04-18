import React, { Component } from "react";
import AddPageForm from "./AddPageForm";
import EditPageForm from "./EditPageForm";
import PagesList from "./PagesList";
import { Link, Route, Switch } from "react-router-dom";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "./App.css";

const selfArchive =
  window.DatArchive && new window.DatArchive("" + window.location);

class NoMatch extends Component {
  render() {
    return <div>Article</div>;
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <nav className="pt-navbar pt-dark">
          <div className="pt-navbar-group pt-align-left">
            <div className="pt-navbar-heading">DatPress</div>
            {/* <input className="pt-input" placeholder="Search files..." type="text" /> */}
          </div>
          <div className="pt-navbar-group pt-align-right">
            <Link className="pt-button pt-minimal" to="/admin/pages">
              All pages
            </Link>

            <Link
              className="pt-button pt-minimal pt-icon-plus"
              to="/admin/add-page"
            >
              Add page
            </Link>
          </div>
        </nav>

        <Switch>
          <Route
            path="/admin/add-page"
            component={({ match }) => <AddPageForm selfArchive={selfArchive} />}
          />

          <Route
            path="/admin/edit-page/:basename"
            component={({ match }) => (
              <EditPageForm
                basename={match.params.basename}
                selfArchive={selfArchive}
              />
            )}
          />

          <Route
            path="/admin/pages"
            component={({ match }) => <PagesList selfArchive={selfArchive} />}
          />

          <Route component={NoMatch} />
        </Switch>
      </div>
    );
  }
}

export default App;
