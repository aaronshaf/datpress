import React, { Component } from "react";
import { mkdirp } from "./utils";
import { Redirect } from "react-router";
import basename from "basename";
import remark from "remark";
import recommended from "remark-preset-lint-recommended";
import remarkHtml from "remark-html";
import tocFromParsedMarkdown from "mdast-util-toc";

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

    const content = document.getElementById("AddPage-content").value;

    await mkdirp(`/pages/${filename.substr(0, 1)}`, archive);

    await archive.writeFile(
      `/pages/${filename.substr(0, 1)}/${filename}.md`,
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

    await archive.writeFile(
      `/build/${basename(filename)}.html`,
      output,
      "utf8"
    );

    this.setState({ path: filename });
  };

  render() {
    if (typeof this.state.path === "string") {
      return <Redirect to={`/admin`} />;
    }

    return (
      <React.Fragment>
        <div className="grid-item">
          <form onSubmit={this.handleSubmit} className="AddPageForm">
            <h1>Add New Page</h1>

            <div className="pt-control-group pt-fill">
              <div className="pt-input-group">
                <input
                  id="AddPage-filename"
                  type="text"
                  className="pt-input pt-large"
                  placeholder="Path"
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

            <button
              type="submit"
              className="pt-button pt-large pt-intent-primary"
            >
              Publish
            </button>
          </form>
        </div>
        <div className="grid-item" />
      </React.Fragment>
    );
  }
}

export default AddPageForm;
