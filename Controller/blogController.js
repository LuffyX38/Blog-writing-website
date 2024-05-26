const mysql = require("mysql");

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const noContent = (res, result) => {
  if (!result.length) {
    return res.status(204).json({
      status: "Success",
      message: `there's no content`,
    });
  }
};

//to create blog
exports.createBlog = (req, res) => {
  console.log(req.body);
  const { blog_by, blog, available_to, bloogger_id } = req.body;
  const q = `INSERT INTO blogs
               (blog_by,blog,available_to,created_at,bloogger_id)
               VALUES (?,?,?,FROM_UNIXTIME(?/1000),?)`;

  db.query(
    q,
    [blog_by, blog, available_to, Date.now(), bloogger_id],
    (err, result) => {
      if (err) {
        return res.status(400).json({
          status: "Failed",
          message: "Failed to create a blog",
          err,
        });
      }
      console.log(result);
      return res.status(200).json({
        status: "Success",
        message: "Successfully created an blog",
      });
    }
  );
};

exports.getBlogs = (req, res) => {
  const q = `SELECT * FROM blogs WHERE delete_blog = false`;
  db.query(q, (err, result) => {
    if (err) {
      return res.status(400).json({
        status: "Failed",
        message: "Failed to load blogs",
        err,
      });
    }

    noContent(res, result);

    return res.status(200).json({
      status: "Success",
      message: "Successfull loaded all blogs",
      results: result.length,
      result,
    });
  });
};

exports.deleteBlog = (req, res) => {
  const { blog_id } = req.body;

  const q = `UPDATE blogs
             SET delete_blog = true
             WHERE blog_id = ? AND delete_blog = false`;

  db.query(q, [blog_id], (err) => {
    if (err) {
      return res.status(400).json({
        status: "Failed",
        message: "Failed to delete blog",
        err,
      });
    }
    return res
      .status(203)
      .json({ status: "success", message: "successfully deleted the blog" });
  });
};
