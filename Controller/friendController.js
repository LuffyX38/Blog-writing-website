const mysql = require("mysql2/promise");
const sendMsg = require("../Utils/sendMessages");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//get all users
exports.users = async (req, res) => {
  try {
    const { loadCount } = req.body;
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
    const q = `SELECT id,username,email,profilePicture,backgroundPicture FROM user WHERE id != ? LIMIT 3 offset ?`;
    const [user] = await pool.query(q, [req.user.id, loadCount]);
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

//send friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    if (!req.user) {
      return sendMsg.throwsError(`Your'e not logged in!!!`, 403);
    }
    const my_id = req.user.id;
    const { user_id } = req.body;
    console.log(user_id);
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
    const [user1] = await pool.query(q1, [req.user.id, user_id]);
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

//check all pending request
exports.checkPendingRequest = async (req, res) => {
  try {
    if (!req.user)
      return sendMsg.successMessage(`Your'e not logged in!!!!!`, [], res, 203);

    const q = `SELECT  f.status,f.req_id,f.req_by,f.req_to,u.username,
      u.profilePicture,u.backgroundPicture,u.id
      FROM friend_request as f
      inner join user as u on f.req_by = u.id
      where f.req_to = ? and f.status = "pending"`;

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

//change request status
exports.changeRequestStatus = async (req, res) => {
  if (!req.user)
    return sendMsg.successMessage(`Your'e not logged in!!!!!`, [], res, 203);
  try {
    const { status, req_id } = req.body;

    if (status === "rejected") {
      const result = await pool.query(`DELETE FROM friend_request WHERE req_id = ? and status="pending"`, [req_id]);
      console.log(result[0].affectedRows);
      return sendMsg.successMessage("Request rejected", [], res, 203);
    }

    const q = `UPDATE friend_request SET status = ?
      WHERE req_id = ? AND status = "pending";`;

    const [insert_id] = await pool.query(q, [status, req_id]);

    // console.log(insert_id);
    return sendMsg.successMessage("Request accepted", insert_id, res, 200);
  } catch (err) {
    console.log(err, " from crs");
    return sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};

//see all friends
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

exports.userProfile = async (req, res) => {
  // console.log(req.params.user_id,"***************************************************");
  // return res.status(200).json({ result: req.params.user_id });
  try {
    
    if (req.user) 
      {
    } else {
            sendMsg.throwsError(`Your'e not logged in`, 400);
      }
    // console.log(req.user);
    const user_id = req.params.user_id;

    

    const [userInfo] = await pool.query(
      `SELECT id,backgroundPicture,bio,birthDate,createdAt,email,profilePicture,username FROM user WHERE id = ?`,
      [user_id]
    );

        const q = `select * from friend_request where (req_by = ? and req_to = ?) or (req_by = ? and req_to = ?)`;

        const [userStatus] = await pool.query(q, [
          req.user.id,
          user_id,
          user_id,
          req.user.id,
        ]);
        
    
    
    if (userStatus.length) {
      userInfo[0].reqid = userStatus[0].req_id;
      userInfo[0].status = userStatus[0].status;
    } 
    sendMsg.successMessage("Success", userInfo, res, 200);
  } catch (err) {
    sendMsg.errMessage(err.message, err, res, err.statusCode);
  }
};


exports.getAllFriends = async (req, res) => {
  
  try {
    console.log(req);
    if (req.user) {
    } else {
      sendMsg.throwsError(`Your'e not logged in`, 400);
    }

    const q = `select f.row_id, u1.username, u1.id as friend_id, u1.profilePicture from friends as f
              left join user as u1 on f.user_id1 = u1.id
              left join user as u2 on f.user_id1 = u2.id
              where(f.user_id1 = ? or f.user_id2 = ?) and(u1.id != ? or u2.id != ?)`;
    
    const [result] = await pool.query(q, [
      req.user.id,
      req.user.id,
      req.user.id,
      req.user.id,
    ]);

    sendMsg.successMessage("Success", result, res, 200);

    
  } catch (err) {
    sendMsg.errMessage(err.message, err, res, err.statusCode);
  }

}