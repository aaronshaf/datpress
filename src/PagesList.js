import React, { Component } from "react";
import { DateTime } from "luxon";
import { Link } from "react-router-dom";
import basename from "basename";
import { mkdirp, renderMarkdownToHtml } from "./utils";

class PagesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pages: []
    };
  }

  async componentDidMount() {
    const archive = this.props.selfArchive;

    await mkdirp("/pages", archive);

    let allFiles = await archive.readdir("/pages", {
      stat: true,
      recursive: true
    });

    console.debug(allFiles);

    if (allFiles.length === 0) {
      await mkdirp("/pages/i", archive);

      const content = `# Your DatPress site

Replace me with content. Press the escape key.`;

      await archive.writeFile(`/pages/i/index.md`, content, "utf8");

      const articleHtml = await renderMarkdownToHtml(content);

      const template = await archive.readFile("/template.html", "utf8");

      const output = template
        .replace("${pageTitle}", "Your DatPress site")
        .replace("${content}", articleHtml);

      await archive.writeFile("/build/index.html", output, "utf8");

      allFiles = await archive.readdir("/pages", {
        stat: true,
        recursive: true
      });
    }

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
              {page.basename}.md
            </Link>
          </td>
          <td>{date}</td>
        </tr>
      );
    });

    return (
      <table className="pt-html-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>{pages}</tbody>
      </table>
    );
  }
}

export default PagesList;
