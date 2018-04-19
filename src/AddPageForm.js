import React, { Component } from "react";
import marked from "marked";
import { mkdirp } from "./utils";
import { Redirect } from "react-router";
import basename from "basename";

class AddPageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      path: null
    };
  }

  handleSubmit = async event => {
    event.preventDefault();

    const archive = this.props.selfArchive;

    if (archive == null) {
      console.warn("selfArchive isn't defined?");
      return;
    }

    const filename = document.getElementById("AddPage-filename").value;

    const title = document.getElementById("AddPage-title").value;

    const content = document.getElementById("AddPage-content").value;

    await mkdirp(`/pages/${filename.substr(0, 1)}`, archive);

    archive.writeFile(
      `/pages/${filename.substr(0, 1)}/${filename}.md`,
      content,
      "utf8"
    );

    const articleHtml = marked(content);

    const template = await archive.readFile("/template.html", "utf8");

    const output = template
      .replace("${pageTitle}", title)
      .replace("${content}", articleHtml);

    await archive.writeFile(
      `/build/${basename(filename)}.html`,
      output,
      "utf8"
    );

    this.setState({ path: filename });
  };

  render() {
    if (typeof this.state.path === "string") {
      return <Redirect to={`/admin/pages`} />;
    }

    return (
      <form onSubmit={this.handleSubmit} className="AddPageForm">
        <h1>Add New Page</h1>

        <div className="pt-control-group pt-fill">
          <div className="pt-input-group .modifier">
            <input
              id="AddPage-filename"
              type="text"
              className="pt-input pt-large"
              placeholder="Filename"
            />
          </div>
        </div>

        <div className="pt-control-group pt-fill">
          <div className="pt-input-group .modifier">
            <input
              id="AddPage-title"
              type="text"
              className="pt-input pt-large"
              placeholder="Title"
            />
          </div>
        </div>

        <div className="pt-control-group pt-fill">
          <textarea
            id="AddPage-content"
            style={{ height: "350px" }}
            className="pt-input pt-fill"
            dir="auto"
            placeholder="Content"
          />
        </div>

        <button type="submit" className="pt-button pt-large pt-intent-primary">
          Publish
        </button>
      </form>
    );
  }
}

export default AddPageForm;
