import remark from "remark";
import recommended from "remark-preset-lint-recommended";
import remarkHtml from "remark-html";

export const mkdirp = async (path, archive) => {
  const parts = path.split("/");

  for (const index in parts) {
    const partialPath = parts.slice(0, index + 1).join("/");

    if (partialPath == null) {
      continue;
    }

    try {
      const stat = await archive.stat(partialPath);

      if (stat.isDirectory() === false) {
        throw new Error();
      }
    } catch (err) {
      await archive.mkdir(partialPath);
    }
  }
};

export const renderMarkdownToHtml = content => {
  return new Promise((resolve, reject) => {
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
};
