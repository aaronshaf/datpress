import React, { Component } from "react";
// import marked from "marked";
import { mkdirp } from "./utils";
import { Redirect } from "react-router";
import remark from "remark";
import recommended from "remark-preset-lint-recommended";
import remarkHtml from "remark-html";
import tocFromParsedMarkdown from "mdast-util-toc";

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

    const filename =
      this.props.basename !== "index"
        ? document.getElementById("EditPage-filename").value
        : "index";

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

    const content = document.getElementById("EditPage-content").value;

    await archive.writeFile(
      `/pages/${newFirstChar}/${filename}.md`,
      content,
      "utf8"
    );

    const parsedMarkdownNode = remark().parse(content);
    const toc = tocFromParsedMarkdown(parsedMarkdownNode, {
      maxDepth: 2
    });

    let title;
    try {
      title = toc.children[0].children[0].value;
    } catch (error) {
      title = "Untitled";
    }

    const articleHtml = await new Promise((resolve, reject) => {
      remark()
        .use(recommended)
        .use(remarkHtml)
        .process(content, (err, result) => {
          if (err != null) {
            console.error(report(err));
            reject(err);
          } else {
            resolve(result);
          }
        });
    });

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
      return <Redirect to={`/admin`} />;
    }

    return (
      <div>
        <h1>Edit Page</h1>

        {this.state.isFileLoaded && (
          <form className="grid-container2" onSubmit={this.handleSubmit}>
            <div className="grid-item">
              <div>
                <div style={{ marginBottom: "4px" }}>
                  Permalink:{" "}
                  <a
                    href={`/${
                      this.props.basename === "index" ? "" : this.props.basename
                    }`}
                  >
                    /{this.props.basename === "index"
                      ? ""
                      : this.props.basename}
                  </a>
                </div>
                {this.props.basename !== "index" && (
                  <div className="pt-control-group pt-fill">
                    <div className="pt-input-group">
                      <input
                        id="EditPage-filename"
                        type="text"
                        className="pt-input pt-large"
                        placeholder="Path"
                        defaultValue={this.props.basename}
                      />
                    </div>
                  </div>
                )}

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
              </div>
            </div>
            <div className="grid-item">
              <div class="pt-card" style={{ position: "sticky" }}>
                <button type="submit" class="pt-button pt-intent-primary">
                  Publish
                </button>
                {this.props.basename !== "index" && (
                  <button
                    className="pt-button pt-minimal pt-intent-danger"
                    onClick={this.handleDelete}
                    style={{ marginLeft: "8px" }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }
}

export default EditPageForm;
