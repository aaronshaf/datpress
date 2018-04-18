import React, { Component } from "react";
import marked from "marked";
import { mkdirp } from "./utils";
import { Redirect } from "react-router";

class EditPageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFileLoaded: false,
      content: null
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

    const title = document.getElementById("EditPage-title").value;

    const content = document.getElementById("EditPage-content").value;

    archive.writeFile(
      `/pages/${filename.substr(0, 1)}/${filename}.md`,
      content,
      "utf8"
    );

    const articleHtml = marked(content);

    const template = await archive.readFile("/template.html", "utf8");

    const output = template
      .replace("${pageTitle}", title)
      .replace("${article}", articleHtml);

    await archive.writeFile(`/public/${filename}.html`, output, "utf8");

    this.setState({ path: filename });
  };

  render() {
    if (typeof this.state.path === "string") {
      return <Redirect to={`/${this.state.path}`} />;
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
                id="EditPage-content"
                style={{ height: "350px" }}
                className="pt-input pt-fill"
                dir="auto"
                placeholder="Content"
                defaultValue={this.state.content}
              />
            </div>

            <button
              type="submit"
              className="pt-button pt-large pt-intent-primary"
            >
              Publish
            </button>
          </div>
        )}
      </form>
    );
  }
}

export default EditPageForm;
