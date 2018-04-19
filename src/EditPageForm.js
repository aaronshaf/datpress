import React, { Component } from "react";
import marked from "marked";
import { mkdirp } from "./utils";
import { Redirect } from "react-router";

class EditPageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFileLoaded: false,
      content: null,
      done: false
    };
  }

  async componentDidMount() {
    const archive = this.props.selfArchive;

    const firstChar = this.props.basename.substr(0, 1);

    const content = await archive.readFile(
      `/pages/${firstChar}/${this.props.basename}.md`
    );

    this.setState({
      isFileLoaded: true,
      content
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    const archive = this.props.selfArchive;

    if (archive == null) {
      console.warn("selfArchive isn't defined?");
      return;
    }

    const filename = document.getElementById("EditPage-filename").value;

    const wasFilenameChanged = filename !== this.props.basename;

    if (wasFilenameChanged) {
      const oldFirstChar = this.props.basename.substr(0, 1);
      await archive.unlink(
        `/pages/${this.props.basename.substr(0, 1)}/${this.props.basename}.md`
      );
      await archive.unlink(`/build/${this.props.basename}.html`);
    }

    const newFirstChar = filename.substr(0, 1);

    await mkdirp(`/pages/${newFirstChar}`, archive);

    const title = document.getElementById("EditPage-title").value;

    const content = document.getElementById("EditPage-content").value;

    await archive.writeFile(
      `/pages/${newFirstChar}/${filename}.md`,
      content,
      "utf8"
    );

    const articleHtml = marked(content);

    const template = await archive.readFile("/template.html", "utf8");

    const output = template
      .replace("${pageTitle}", title)
      .replace("${content}", articleHtml);

    await archive.writeFile(`/build/${filename}.html`, output, "utf8");

    this.setState({ done: true });
  };

  handleDelete = async event => {
    event.preventDefault();

    if (confirm("Are you sure you want to delete this?") === false) {
      return;
    }

    const archive = this.props.selfArchive;

    const oldFirstChar = this.props.basename.substr(0, 1);

    await archive.unlink(
      `/pages/${this.props.basename.substr(0, 1)}/${this.props.basename}.md`
    );

    await archive.unlink(`/build/${this.props.basename}.html`);

    this.setState({ done: true });
  };

  render() {
    if (this.state.done) {
      return <Redirect to={`/admin/pages`} />;
    }

    return (
      <form onSubmit={this.handleSubmit} className="EditPageForm">
        <h1>Edit New Page</h1>

        {this.state.isFileLoaded && (
          <div>
            <div className="pt-control-group pt-fill">
              <div className="pt-input-group .modifier">
                <input
                  id="EditPage-filename"
                  type="text"
                  className="pt-input pt-large"
                  placeholder="Filename"
                  defaultValue={this.props.basename}
                />
              </div>
            </div>

            <div className="pt-control-group pt-fill">
              <div className="pt-input-group .modifier">
                <input
                  id="EditPage-title"
                  type="text"
                  className="pt-input pt-large"
                  placeholder="Title"
                />
              </div>
            </div>

            <div className="pt-control-group pt-fill">
              <textarea
                className="pt-input pt-fill"
                defaultValue={this.state.content}
                dir="auto"
                id="EditPage-content"
                placeholder="Content"
                style={{ height: "350px" }}
              />
            </div>

            <button
              className="pt-button pt-large pt-intent-primary"
              type="submit"
            >
              Publish
            </button>
            <button
              className="pt-button pt-large pt-intent-danger"
              onClick={this.handleDelete}
              style={{ marginLeft: "8px" }}
            >
              Delete
            </button>
          </div>
        )}
      </form>
    );
  }
}

export default EditPageForm;
