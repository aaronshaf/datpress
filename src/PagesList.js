import React, { Component } from "react";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import basename from "basename";

class PagesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pages: []
    };
  }

  async componentDidMount() {
    const archive = this.props.selfArchive;

    const allFiles = await archive.readdir("/pages", {
      stat: true,
      recursive: true
    });

    this.setState({
      pages: allFiles
        .filter(file => file.stat.isFile())
        .sort((a, b) => (a.stat.ctime < b.stat.ctime ? 1 : -1))
        .map(file => {
          return {
            basename: basename(file.name),
            path: file.name,
            creationTime: file.stat.ctime
          };
        })
    });
  }

  render() {
    const pages = this.state.pages.map(page => {
      const date = new DateTime(page.creationTime).toISODate();

      return (
        <tr>
          <td>
            <Link to={`/admin/edit-page/${page.basename}`}>
              {page.basename}
            </Link>
          </td>
          <td />
          <td>{date}</td>
        </tr>
      );
    });

    return (
      <table className="pt-html-table">
        <thead>
          <tr>
            <th>Title</th>
            <th />
            <th>Creation</th>
          </tr>
        </thead>
        <tbody>{pages}</tbody>
      </table>
    );
  }
}

export default PagesList;
