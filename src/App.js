import React, { Component } from "react";
import AddPageForm from "./AddPageForm";
import EditPageForm from "./EditPageForm";
import PagesList from "./PagesList";
import { Link, Route, Switch } from "react-router-dom";
import { Menu, MenuItem, MenuDivider } from "@blueprintjs/core";
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
          </div>
          <div class="pt-navbar-group pt-align-right">
            <a className="pt-button pt-minimal" href="/">
              Back to site
            </a>
          </div>
        </nav>

        <div className="renameme1">
          <div className="grid-container">
            <div className="grid-item">
              <ul className="pt-menu .modifier pt-elevation-1">
                <li class="pt-menu-header">
                  <h6>Pages</h6>
                </li>

                <li>
                  <Link className="pt-menu-item" to="/admin/pages">
                    All pages
                  </Link>
                </li>
                <li>
                  <Link className="pt-menu-item" to="/admin/add-page">
                    Add page
                  </Link>
                </li>

                <li class="pt-menu-header">
                  <h6>Settings</h6>
                </li>

                <li>
                  <Link className="pt-menu-item" to="/admin/settings/general">
                    General
                  </Link>
                </li>
              </ul>
            </div>
            <div className="grid-item">
              <div>
                <Switch>
                  <Route
                    path="/admin/add-page"
                    component={({ match }) => (
                      <AddPageForm selfArchive={selfArchive} />
                    )}
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
                    component={({ match }) => (
                      <PagesList selfArchive={selfArchive} />
                    )}
                  />

                  <Route component={NoMatch} />
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
