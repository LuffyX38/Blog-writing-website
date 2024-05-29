const mysql = require("mysql2/promise");
const sendMsg = require("../Utils/sendMessages");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

exports.users = async (req, res) => {
  try {
    if (!req.user) {
      //id,username,email,profilePicture,backgroundPicture
      const [user] = await pool.query(
        `SELECT id,username,email,profilePicture,backgroundPicture FROM user`
      );
      return sendMsg.successMessage(
        "Success",
        { results: user.length, users: user },
        res,
        200
      );
    }
    const q = `SELECT id,username,email,profilePicture,backgroundPicture FROM user WHERE id != ?`;
    const [user] = await pool.query(q, [req.user.id]);
    sendMsg.successMessage(
      "Success",
      { results: user.length, users: user },
      res,
      200
    );
  } catch (err) {
    sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    if (!req.user) {
      return sendMsg.throwsError(`Your'e not logged in!!!`, 403);
    }
    const my_id = req.user.id;
    const { user_id } = req.body;

    if (!user_id || my_id === user_id) {
      return sendMsg.throwsError("Invalid id, or no id posted", 400);
    }

    //checks if req in req box
    const q = `SELECT * FROM friend_request WHERE req_by = ? AND req_to = ? AND status = "pending"`;
    const [user] = await pool.query(q, [user_id, req.user.id]);
    if (user.length) {
      return sendMsg.successMessage(
        "You have a pending request in req box!!!!",
        [],
        res,
        200
      );
    }

    //checks if req is pending
    const q1 = `SELECT * FROM friend_request WHERE req_by = ? AND req_to = ? AND status = "pending"`;
    const [user1] = await pool.query(q, [req.user.id, user_id]);
    if (user1.length) {
      return sendMsg.successMessage("Request already sent", [], res, 200);
    }

    //checks if req is accepted or not
    const q2 = `SELECT * FROM friend_request
       WHERE (req_by = ? AND req_to = ?) OR (req_by = ? AND req_to = ?)
       AND status = "accepted"`;
    const [user2] = await pool.query(q2, [user_id, my_id, my_id, user_id]);
    if (user2.length) {
      return sendMsg.successMessage(`Already friend's`, [], res, 200);
    }

    //finally send the request from this id
    const q3 = `INSERT INTO friend_request (req_by, req_to, status) VALUES (?,?,"pending")`;
    await pool.query(q3, [req.user.id, user_id]);
    return sendMsg.successMessage(`Request sent`, [], res, 200);
  } catch (err) {
    console.log(err, " from SFR");
    return sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};

exports.checkPendingRequest = async (req, res) => {
  try {
    if (!req.user)
      return sendMsg.successMessage(`Your'e not logged in!!!!!`, [], res, 203);

    const q = `SELECT  f.status,f.req_id,f.req_by,f.req_to,u.username,
      u.profilePicture,u.backgroundPicture,u.id
      FROM friend_request as f
      inner join user as u on f.req_by = u.id
      where f.req_to = ?`;

    const [result] = await pool.query(q, [req.user.id]);
    sendMsg.successMessage(
      "Success",
      { results: result.length, result },
      res,
      200
    );
  } catch (err) {
    console.log(err, " from cpr");
    return sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};

exports.changeRequestStatus = async (req, res) => {
  if (!req.user)
    return sendMsg.successMessage(`Your'e not logged in!!!!!`, [], res, 203);
  try {
    const { status, req_id } = req.body;

    if (status === "rejected") {
      await pool.query(`DELETE FROM friend_request WHERE req_id = ?`, [req_id]);
      return sendMsg.successMessage("Request rejected", [], res, 203);
    }

    const q = `UPDATE friend_request SET status = ?
      WHERE req_id = ? AND status = "pending";`;

    const [insert_id] = await pool.query(q, [status, req_id]);

    console.log(insert_id);
    return sendMsg.successMessage("Success", insert_id, res, 200);
  } catch (err) {
    console.log(err, " from crs");
    return sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};

exports.seeFriends = async (req, res) => {
  if (!req.user) {
    return sendMsg.successMessage(`Your'e not logged in!!!!!`, [], res, 203);
  }

  try {
    const q = `SELECT f.status,u.username,u.profilePicture,u.backgroundPicture,u.email,u.id,f.req_id,
       f.req_to,f.req_by FROM friend_request as f INNER JOIN user AS u
        ON (f.req_by = u.id OR f.req_to = u.id) AND u.id = ?
        WHERE  (f.req_by = ? OR f.req_to = ?) AND status = "accepted"`;
    const [result] = await pool.query(q, [
      req.user.id,
      req.user.id,
      req.user.id,
    ]);
    if (!result.length) {
      sendMsg.successMessage("No friends 🥹😢😭", [], res, 200);
    }
    return sendMsg.successMessage(
      "Success",
      { results: result.length, result },
      res,
      200
    );
  } catch (err) {
    console.log(err, " from sf");
    return sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};
