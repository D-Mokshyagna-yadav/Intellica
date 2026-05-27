const mongoose = require("mongoose");
const Faculty = require("../models/Faculty");
const HOD = require("../models/HOD");
const Notification = require("../models/Notification");
const createUserFolder = require("../utils/createUserFolder");
const Upload = require("../models/Upload");
const { sendApprovalEmailToFaculty, sendApprovalEmailToHod } = require("../utils/emailService");


/* =========================
   GET PENDING FACULTY
========================= */
exports.getPendingFaculty = async (req, res) => {
  try {

    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Only HOD can view pending faculty" });
    }

    const faculty = await Faculty.find({ isApproved: false });

    res.status(200).json(faculty);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/* =========================
   APPROVE FACULTY
========================= */
exports.approveFaculty = async (req, res) => {
  try {

    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Only HOD can approve faculty" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Faculty ID" });
    }

    const faculty = await Faculty.findByIdAndUpdate(
      id,
      {
        isApproved: true,
        status: "APPROVED"
      },
      { new: true }
    );

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    if (faculty.employeeId) {
      createUserFolder("faculty", faculty.employeeId);
    }

    await Notification.create({
      message: `HOD approved Faculty ${faculty.name}`,
      role: "HOD",
    });

    // email to faculty about approval
    try {
      await sendApprovalEmailToFaculty(faculty);
    } catch (err) {
      console.error('Failed to send faculty approval email:', err);
    }

    res.status(200).json({
      message: "Faculty approved successfully",
      faculty,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET ALL HODS
========================= */
exports.getAllHods = async (req, res) => {
  try {

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only Admin can view HODs" });
    }

    const hods = await HOD.find();

    res.status(200).json(hods);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch HODs" });
  }
};


/* =========================
   GET PENDING HODS
========================= */
exports.getPendingHods = async (req, res) => {
  try {

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only Admin can view pending HODs" });
    }

    const hods = await HOD.find({
      isApproved: false
    });

    res.status(200).json(hods);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pending HODs" });
  }
};


/* =========================
   APPROVE HOD
========================= */
exports.approveHod = async (req, res) => {
  try {

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only Admin can approve HOD" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid HOD ID" });
    }

    const hod = await HOD.findByIdAndUpdate(
  id,
  {
    isApproved: true,
    status: "APPROVED",   // ⭐ THIS LINE IS MISSING
    discussionComment: ""
  },
  { new: true }
);

    if (!hod) {
      return res.status(404).json({ message: "HOD not found" });
    }

    if (hod.employeeId) {
      createUserFolder("hod", hod.employeeId);
    }

    await Notification.create({
      message: `Admin approved HOD ${hod.name}`,
      role: "ADMIN"
    });

    // email to HOD about approval
    try {
      await sendApprovalEmailToHod(hod);
    } catch (err) {
      console.error('Failed to send HOD approval email:', err);
    }

    res.status(200).json({
      message: "HOD approved successfully",
      hod,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
};


/* =========================
   CALL DISCUSSION FOR HOD
========================= */
/* =========================
   CALL DISCUSSION FOR HOD
========================= */
exports.hodDiscussion = async (req,res)=>{

try{

if(req.user.role !== "ADMIN"){
return res.status(403).json({message:"Only Admin can request discussion"});
}

const { id } = req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid HOD ID"});
}

const hod = await HOD.findById(id);

if(!hod){
return res.status(404).json({message:"HOD not found"});
}

/* DEFAULT DISCUSSION MESSAGE */

hod.discussionComment = "Admin requested discussion";
hod.status = "DISCUSSION";     // ⭐ IMPORTANT FIX
hod.isApproved = false;

await hod.save();

res.json({
message:"Discussion requested successfully"
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Discussion failed"
});

}

};

/* =========================
   REMOVE APPROVED HOD
========================= */
exports.removeApprovedHod = async (req,res)=>{

try{

if(req.user.role !== "ADMIN"){
return res.status(403).json({message:"Only Admin can remove HOD"});
}

const { id } = req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid HOD ID"});
}

const hod = await HOD.findByIdAndDelete(id);

if(!hod){
return res.status(404).json({message:"HOD not found"});
}

res.json({
message:"HOD removed successfully"
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to remove HOD"
});

}

};


/* =========================
   GET PENDING HOD UPLOADS
========================= */
exports.getPendingUploadsForAdmin = async (req, res) => {

try {

if (req.user.role !== "ADMIN") {
return res.status(403).json({ message: "Only Admin can view uploads" });
}

const uploads = await Upload.find({
status: "HOD_SUBMITTED"
}).sort({ createdAt: -1 });

const formatted = await Promise.all(

uploads.map(async (u) => {

let faculty = null;

if (u.createdByRole === "HOD") {
faculty = await HOD.findById(u.faculty).select("name employeeId department");
}

return {
...u._doc,
faculty
};

})

);

res.status(200).json(formatted);

} catch (error) {

console.error(error);

res.status(500).json({
message: "Failed to fetch uploads"
});

}

};


/* =========================
   ADMIN APPROVE HOD UPLOAD
========================= */
exports.approveUploadByAdmin = async (req, res) => {
  try {

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only Admin can approve uploads" });
    }

    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    upload.status = "ADMIN_APPROVED";

    await upload.save();

    res.status(200).json({
      message: "Upload approved by Admin"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Approval failed" });
  }
};


/* =========================
   ADMIN DISCUSSION
========================= */
exports.adminDiscussion = async (req, res) => {
  try {

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only Admin can call discussion" });
    }

    const upload = await Upload.findById(req.params.id);

    if (!upload) {
      return res.status(404).json({ message: "Upload not found" });
    }

    upload.status = "ADMIN_COMMENT";
    upload.adminComment = req.body.comment || "";

    await upload.save();

    res.status(200).json({
      message: "Discussion requested",
      upload
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Discussion failed"
    });

  }
};


/* =========================
   GET DEPARTMENT STATUS
========================= */
exports.getDepartmentStatus = async (req, res) => {

try {

if (req.user.role !== "ADMIN") {
return res.status(403).json({ message: "Only Admin can view departments" });
}

const departments = ["CSE","ECE","MECH","CIVIL","EEE","IT","AIML","AIDS","CHEM"];

const result = await Promise.all(

departments.map(async(dep)=>{

const hod = await HOD.findOne({
department:dep,
isApproved:true
}).select("name employeeId");

const facultyCount = await Faculty.countDocuments({
department:dep,
isApproved:true
});

return {
department:dep,
hodName: hod ? hod.name : null,
facultyCount
};

})

);

res.status(200).json(result);

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch departments"
});

}

};


/* =========================
   TOP DEPARTMENTS BY CREDITS
========================= */
exports.getTopDepartments = async (req,res)=>{

try{

if(req.user.role !== "ADMIN"){
return res.status(403).json({message:"Access denied"});
}

const result = await Upload.aggregate([

{
$match:{
status:{ $in:["HOD_APPROVED","ADMIN_APPROVED"] }
}
},

{
$group:{
_id:"$department",
totalCredits:{ $sum:"$credits" }
}
},

{
$sort:{ totalCredits:-1 }
},

{
$limit:4
}

]);

const formatted = result.map(r=>({
department:r._id,
credits:r.totalCredits
}));

res.json(formatted);

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch top departments"
});

}

};


/* =========================
   MOST POPULAR ACTIVITIES
========================= */
exports.getActivityStats = async (req,res)=>{

try{

if(req.user.role !== "ADMIN"){
return res.status(403).json({message:"Access denied"});
}

const result = await Upload.aggregate([

{
$match:{
status:{ $in:["HOD_APPROVED","ADMIN_APPROVED"] }
}
},

{
$group:{
_id:"$category",
count:{ $sum:1 }
}
},

{
$sort:{ count:-1 }
},

{
$limit:5
}

]);

const formatted = result.map(r=>({
category:r._id,
count:r.count
}));

res.json(formatted);

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch activity stats"
});

}

};

/* =========================
   GET ALL FACULTY + HODS
========================= */

exports.getAllUsers = async (req,res)=>{

try{

if(req.user.role !== "ADMIN"){
return res.status(403).json({message:"Access denied"});
}

/* APPROVED FACULTY */
const faculty = await Faculty.find({
  isApproved:true
}).select("_id employeeId name department role");

const hods = await HOD.find({
  isApproved:true
}).select("_id employeeId name department role");

/* MERGE BOTH */

const users = [...faculty,...hods];

res.json(users);

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch users"
});

}

};

/* =========================
   DELETE FACULTY OR HOD
========================= */

exports.deleteUser = async (req,res)=>{

try{

if(req.user.role !== "ADMIN"){
return res.status(403).json({message:"Only Admin can delete users"});
}

const { id } = req.params;

if(!mongoose.Types.ObjectId.isValid(id)){
return res.status(400).json({message:"Invalid User ID"});
}

/* DELETE FACULTY */

const faculty = await Faculty.findById(id);

if(faculty){

await Upload.deleteMany({ faculty:id });

await Faculty.findByIdAndDelete(id);

return res.json({
message:"Faculty removed successfully"
});

}

/* DELETE HOD */

const hod = await HOD.findById(id);

if(hod){

await Upload.deleteMany({ faculty:id });

await HOD.findByIdAndDelete(id);

return res.json({
message:"HOD removed successfully"
});

}

res.status(404).json({
message:"User not found"
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Delete failed"
});

}

};
exports.changeDepartment = async (req,res)=>{

try{

if(req.user.role !== "ADMIN"){
return res.status(403).json({message:"Only Admin can change department"});
}

const { id } = req.params;
const { department } = req.body;

/* UPDATE FACULTY */

let faculty = await Faculty.findById(id);

if(faculty){

await Faculty.findByIdAndUpdate(
id,
{ department },
{ new:true }
);

return res.json({
message:"Faculty department updated"
});

}

/* UPDATE HOD */

let hod = await HOD.findById(id);

if(hod){

await HOD.findByIdAndUpdate(
id,
{ department },
{ new:true }
);

return res.json({
message:"HOD department updated"
});

}

res.status(404).json({message:"User not found"});

}catch(err){

console.error(err);

res.status(500).json({message:"Update failed"});

}

};
/* =========================
   GET DEPARTMENT ANALYTICS
========================= */

exports.getDepartmentAnalytics = async (req,res)=>{

try{

if(req.user.role !== "ADMIN"){
return res.status(403).json({message:"Access denied"});
}

const { department } = req.params;

/* GET APPROVED ACTIVITIES */

const uploads = await Upload.find({
department,
status:{ $in:["HOD_APPROVED","ADMIN_APPROVED"] },
createdByRole:{ $in:["FACULTY","HOD"] }
});

/* TOTAL CREDITS */

const totalCredits = uploads.reduce(
(sum,u)=>sum + (u.credits || 0),
0
);

/* TOTAL ACTIVITIES */

const totalActivities = uploads.length;

/* TOTAL FACULTY */

const facultyCount = await Faculty.countDocuments({
department,
isApproved:true
});

res.json({
totalCredits,
totalActivities,
facultyCount
});

}catch(err){

console.error(err);

res.status(500).json({
message:"Failed to fetch department analytics"
});

}

};