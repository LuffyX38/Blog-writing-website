const mysql = require("mysql2/promise");

const errMessage = (msg, err, res, statusCode) => {
  this.statusCode = statusCode || 500;
  return res.status(this.statusCode).json({
    status: "failed",
    message: msg,
    err,
  });
};

const throwsError = (msg, statusCode) => {
  const error = new Error(msg);
  error.statusCode = statusCode || 500;
  error.st = error.stack;
  throw error;
};

const successMessage = (msg, result, res, statusCode) => {
  return res.status(statusCode).json({
    status: "success",
    message: msg,
    result,
  });
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const noContent = (res, result) => {
  if (!result.length) {
    throwsError(`There's no content`, 204);
  }
};

//to create blog
exports.createBlog = async (req, res) => {
  try {
    if (!req.user.id) {
      throwsError(`Your'e not logged in`, 400);
    }
    console.log(req.body);
    const { blog, available_to, blog_head } = req.body;
    const q = `INSERT INTO blogs (blog_by,blog,available_to,created_at,bloogger_id,blog_head) VALUES (?,?,?,FROM_UNIXTIME(?/1000),?,?)`;

    const [result] = await pool.query(q, [
      req.user.username,
      blog,
      available_to,
      Date.now(),
      req.user.id,
      blog_head,
    ]);
    console.log(result);
    successMessage("Successfully created an blog", result, res, 200);
  } catch (err) {
    console.log(err);
    errMessage(err.message, err, res, 400);
  }
};

exports.getBlogs = async (req, res) => {
  const q = `SELECT * FROM blogs WHERE delete_blog = FALSE ORDER BY created_at DESC`;
  try {
    const [result] = await pool.query(q);
    noContent(res, result);
    successMessage(
      "Successfully loaded all blogs",
      { result, results: result.length },
      res,
      200
    );
  } catch (err) {
    errMessage(err.message, err.stack, res, 400);
  }
};

exports.deleteBlog = async (req, res) => {
  const { blog_id } = req.body;
  const q = `UPDATE blogs
             SET delete_blog = true
             WHERE blog_id = ? AND delete_blog = false`;

  try {
    await pool.query(q, [blog_id]);
    successMessage("successfully deleted the blog", [], res, 203);
  } catch (err) {
    errMessage(err.message, err, res, 400);
  }
};

exports.getMyBlogs = async (req, res) => {
  try {
    if (req.user) {
      const q = `SELECT * FROM blogs WHERE bloogger_id = ? AND delete_blog = false`;
      const [result] = await pool.query(q, [req.user.id]);
      if (!result.length) {
        return successMessage("No posts", [], res, 200);
      }
      return successMessage("Success", result, res, 200);
    } else {
      return throwsError(`Your'e not logged in`, 203);
    }
  } catch (err) {
    console.log(err);
    errMessage(err.message, err, res, err.statusCode);
  }
}