const mysql = require("mysql2/promise");
const sendMsg = require("../Utils/sendMessages");
const moment = require("moment");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.getComments = async (req, res) => {
  try {
    if (!req.user) {
      //  return sendMsg.throwsError(`Your'e not logged in`, 400);
    }
    // const { blog_id,loadCount } = req.body;
    const blog_id = req.params.blog_id;
    let loadCount = parseInt(req.query.loadCount);
   /* const q = `select c.*, u.username as message_by,u.profilePicture,u.id from comment_system as c 
                    left join user as u 
                    on c.user_id = u.id
                    where c.blog_id = ?
                    order by c.message_on desc limit 5 offset ? `;*/

     const q = `SELECT c.*, u.username as message_by,u.profilePicture, COUNT(sc.row_id) AS sub_comment_count,u.id
                FROM comment_system as c
                LEFT JOIN user as u ON u.id = c.user_id
                LEFT JOIN sub_comment_system as sc 
                ON sc.reply_id = c.reply_id AND sc.blog_id = c.blog_id
                WHERE c.blog_id = ? 
                GROUP BY c.reply_id, c.message, c.user_id, u.username
                order by c.message_on desc LIMIT 5 OFFSET ?`;

    const [result] = await pool.query(q, [blog_id, loadCount]);
    const results = result.map((item) => {
      return {
        ...item,
        message_time: moment(item.message_on).fromNow(),
      };
    });
    sendMsg.successMessage("Success", { result: results }, res, 200);
  } catch (err) {
    sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};

//reply_id, message, user_id, blog_id, row_id, message_on, to_whom
//'36', 'this is first sub comment', '1', '31', '1', '2024-07-08 20:47:19', '2'
exports.getSubComments = async (req, res) => {
  try {
    const { blog_id, reply_id } = req.params;
    const q = `
        select
        sc.reply_id,sc.message,
        sc.blog_id,sc.row_id as reply_row_id,sc.message_on,
        sc.user_id as from_id,
        u.username as from_username,u.profilePicture as from_pic,
        su.username as to_username,su.profilePicture as to_pic,
        su.id as to_id
        from sub_comment_system as sc
        left join user as u on sc.user_id = u.id
        left join user as su on sc.to_whom = su.id
        where sc.blog_id = ? and sc.reply_id = ?
        order by sc.message_on desc`;
    const [result] = await pool.query(q, [blog_id, reply_id]);
    const nResults = result.map((item) => {
      return {
        ...item,
        message_time: moment(item.message_on).fromNow(),
      };
    });
    sendMsg.successMessage("Success", { result: nResults }, res, 200);
  } catch (err) {
    sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};

exports.postComment = async (req, res) => {
  try {
    if (!req.user) {
      return sendMsg.throwsError(`Your'e not logged in`, 400);
    }
    const { blog_id, message } = req.body;
    const q = `insert into comment_system 
                   (blog_id, user_id,message, message_on)
                   value (?,?,?,now())`;

    const [result] = await pool.query(q, [blog_id, req.user.id, message]);
    return sendMsg.successMessage(`Your'e message is posted!!`, [], res, 200);
  } catch (err) {
    sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};

exports.postSubComment = async (req, res) => {
  try {
    if (!req.user) {
      return sendMsg.throwsError(`Your'e not logged in`, 400);
    }
      const { to_id, blog_id, reply_id, message } = req.body;
      console.log(message);
      const q =
          ` insert into sub_comment_system
           (reply_id,message,user_id,blog_id,message_on,to_whom)
           value(?,?,?,?,now(),?)`;

      const [result] = await pool.query(q, [reply_id, message, req.user.id, blog_id, to_id]);
      return sendMsg.successMessage(`Your'e message is posted!!`, [], res, 200);
  } catch (err) {
    sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};
