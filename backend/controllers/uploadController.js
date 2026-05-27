const Upload = require("../models/Upload");
const calculateCredits = require("../services/creditCalculator");
const path = require("path");

exports.createUpload = async (req, res) => {
try {
  console.log("REQ BODY:", req.body);
  if (!["FACULTY","HOD","ADMIN"].includes(req.user.role)) {
 return res.status(403).json({ message: "Not allowed to upload" });
}
const body = { ...req.body };
Object.keys(body).forEach(key => {
  if (Array.isArray(body[key])) { body[key] = body[key][0]; }
});
console.log("Year from frontend:", body.year);
const category = req.params.category?.trim();
let title = body.title || "";
if (category === "mou" && !title) { title = body.organization || ""; }
const metadata = { ...body };
delete metadata.title;
delete metadata.category;
delete metadata.faculty;
delete metadata.credits;
let relativePath="";
if(req.files && req.files.length>0){
const mainFile = req.files.find(f=>f.fieldname==="file");
if(mainFile){
relativePath = path.relative(path.join(__dirname,".."),mainFile.path).replace(/\\/g,"/");
}
}

const credits = await calculateCredits({ category, metadata });

const yearValue = String(body.year || "").trim();
let year = parseInt(yearValue, 10);
if (isNaN(year)) {
  const meta = { ...body };
  if (meta.monthYear)        year = parseInt(meta.monthYear.split("-")[0], 10);
  else if (meta.fromDate)    year = new Date(meta.fromDate).getFullYear();
  else if (meta.date)        year = new Date(meta.date).getFullYear();
  else if (meta.toDate)      year = new Date(meta.toDate).getFullYear();
  else if (meta.startDate)   year = new Date(meta.startDate).getFullYear();
  else if (meta.publishedDate)  year = new Date(meta.publishedDate).getFullYear();
  else if (meta.completionDate) year = new Date(meta.completionDate).getFullYear();
  else {
    return res.status(400).json({ message: "Year is required" });
  }
}
let status;
if(req.user.role === "FACULTY"){ status = "FACULTY_SUBMITTED"; }
if(req.user.role === "HOD"){ status = "HOD_SUBMITTED"; }
if(req.user.role === "ADMIN"){ status = "ADMIN_APPROVED"; }
const upload = await Upload.create({
faculty: req.user.id,
createdByRole: req.user.role,
department: req.user.department || "",
category, title, metadata, credits, year:year,
filePath: relativePath, status
});
res.status(201).json({ message:"Upload submitted successfully", upload });
}catch(err){
console.error(err);
res.status(500).json({ message:"Upload failed" });
}
};

exports.getMyUploads = async(req,res)=>{
try{
const userId = req.user.id;
const uploads = await Upload.find({ faculty:userId }).sort({createdAt:-1});
res.json(uploads);
}catch(err){
console.error(err);
res.status(500).json({ message:"Fetch failed" });
}
};

exports.updateUpload = async (req, res) => {
try {
const uploadDoc = await Upload.findById(req.params.id);
if(!uploadDoc){ return res.status(404).json({message:"Upload not found"}); }
const userId = req.user.id;
if(uploadDoc.faculty.toString() !== userId){
return res.status(403).json({message:"Not allowed"});
}
const body = { ...req.body };
Object.keys(body).forEach(key => {
if (Array.isArray(body[key])) { body[key] = body[key][0]; }
});
const category = req.params.category;
let title = body.title || "";
if (category === "mou" && !title) { title = body.organization || ""; }
const metadata = { ...(uploadDoc.metadata || {}) };
Object.keys(body).forEach(key => {
  if(key === "title") return;
  const value = body[key];
  if(value !== "" && value !== null && value !== undefined){ metadata[key] = value; }
});
const changedFields = [];
const oldMetadata = uploadDoc.metadata || {};
const allKeys = new Set([...Object.keys(oldMetadata), ...Object.keys(metadata)]);
allKeys.forEach(key => {
const oldValue = (oldMetadata[key] ?? "").toString().trim();
const newValue = (metadata[key] ?? "").toString().trim();
if(oldValue !== newValue){ changedFields.push(key); }
});
if((uploadDoc.title || "").toString().trim() !== title.toString().trim()){
changedFields.push("title");
}
uploadDoc.previousMetadata = { ...oldMetadata };
uploadDoc.metadata = metadata;
uploadDoc.changedFields = changedFields;
uploadDoc.credits = await calculateCredits({ category, metadata });
uploadDoc.category = category;
uploadDoc.title = title;

if (body.year !== undefined && body.year !== null && body.year !== "") {
  const yearValue = String(body.year).trim();
  const parsedYear = parseInt(yearValue, 10);
  if (!isNaN(parsedYear)) {
    uploadDoc.year = parsedYear;
  }
}
if(req.user.role === "FACULTY"){ uploadDoc.status = "FACULTY_SUBMITTED"; }
if(req.user.role === "HOD"){ uploadDoc.status = "HOD_SUBMITTED"; }
if(req.files && req.files.length>0){
let mainFile = req.files.find(f=>f.fieldname==="file");
if(!mainFile){ mainFile = req.files[0]; }
if(mainFile){
const relativePath = path.relative(path.join(__dirname,".."),mainFile.path).replace(/\\/g,"/");
uploadDoc.filePath = relativePath;
}
}
await uploadDoc.save();
res.json({ message:"Upload updated successfully" });
}catch(err){
console.error(err);
res.status(500).json({ message:"Update failed" });
}
};

exports.getPendingUploadsForHOD = async(req,res)=>{
try{
if(req.user.role!=="HOD"){
return res.status(403).json({message:"Access denied"});
}
const uploads = await Upload.find({
department:req.user.department,
status:"FACULTY_SUBMITTED"
})
.populate("faculty","name employeeId department role")
.sort({createdAt:-1});
res.json(uploads);
}catch(err){
console.error(err);
res.status(500).json({ message:"Error fetching uploads" });
}
};

exports.approveUploadByHOD = async(req,res)=>{
try{
if(req.user.role!=="HOD"){
return res.status(403).json({message:"Access denied"});
}
const uploadDoc = await Upload.findById(req.params.id);
if(!uploadDoc){ return res.status(404).json({message:"Upload not found"}); }
if(uploadDoc.department !== req.user.department){
return res.status(403).json({message:"Access denied (Different department)"});
}
uploadDoc.status="HOD_APPROVED";
await uploadDoc.save();
res.json({ message:"Approved by HOD" });
}catch(err){
console.error(err);
res.status(500).json({ message:"Approval failed" });
}
};

exports.getPendingUploadsForAdmin = async(req,res)=>{
try{
if(req.user.role!=="ADMIN"){
return res.status(403).json({message:"Access denied"});
}
const uploads = await Upload.find({
status:{$in:["HOD_SUBMITTED","ADMIN_COMMENT"]}
})
.populate("faculty","name employeeId department role")
.sort({createdAt:-1});
res.json(uploads);
}catch(err){
console.error(err);
res.status(500).json({ message:"Error fetching uploads" });
}
};

exports.approveUploadByAdmin = async(req,res)=>{
try{
if(req.user.role!=="ADMIN"){
return res.status(403).json({message:"Access denied"});
}
const uploadDoc = await Upload.findById(req.params.id);
if(!uploadDoc){ return res.status(404).json({message:"Upload not found"}); }
uploadDoc.status="ADMIN_APPROVED";
await uploadDoc.save();
res.json({ message:"Upload approved by admin" });
}catch(err){
console.error(err);
res.status(500).json({ message:"Admin approval failed" });
}
};

exports.callForDiscussion = async(req,res)=>{
try{
if(!["HOD","ADMIN"].includes(req.user.role)){
return res.status(403).json({message:"Not allowed"});
}
const uploadDoc = await Upload.findById(req.params.id);
if(!uploadDoc){ return res.status(404).json({message:"Upload not found"}); }
if(req.user.role === "HOD" && uploadDoc.department !== req.user.department){
  return res.status(403).json({message:"Access denied (Different department)"});
}
if(req.user.role === "HOD"){
uploadDoc.hodComment = req.body.comment || "";
uploadDoc.status = "HOD_COMMENT";
}
if(req.user.role === "ADMIN"){
uploadDoc.adminComment = req.body.comment || "";
uploadDoc.status = "ADMIN_COMMENT";
}
await uploadDoc.save();
res.json({ message:"Comment added", upload:uploadDoc });
}catch(err){
console.error(err);
res.status(500).json({ message:"Discussion failed" });
}
};

exports.getUploadsByCategory = async (req, res) => {
try {
const { category, facultyId } = req.query;
let targetUser;
if (facultyId) { targetUser = facultyId; }
else { targetUser = req.user.id; }
const uploads = await Upload.find({
  category, faculty: targetUser
}).sort({ createdAt: -1 });
res.json(uploads);
} catch (err) {
console.error(err);
res.status(500).json({ message: "Fetch failed" });
}
};

exports.getFacultyUploads = async (req, res) => {
  try {
    const facultyId = req.params.facultyId;
    const upload = await Upload.findOne({ faculty: facultyId });
    if (!upload) {
      return res.status(404).json({ message: "No uploads found" });
    }
    if (req.user.role === "HOD" && upload.department !== req.user.department) {
      return res.status(403).json({ message: "Access denied" });
    }
    const uploads = await Upload.find({
      faculty: facultyId,
      createdByRole: { $in: ["FACULTY", "HOD"] }
    }).sort({ createdAt: -1 });
    res.json(uploads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDepartmentUploads = async (req, res) => {
  try {
    if (!["HOD", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    let query = {
      status: {
        $in: ["FACULTY_SUBMITTED","HOD_SUBMITTED","HOD_APPROVED","ADMIN_APPROVED"]
      }
    };
    if (req.user.role === "HOD") {
      query.department = req.user.department;
    } else if (req.user.role === "ADMIN" && req.query.department) {
      query.department = req.query.department;
    }
    console.log("Role:", req.user.role);
    console.log("Query:", JSON.stringify(query));
    const uploads = await Upload.find(query).sort({ createdAt: -1 });
    console.log("Found:", uploads.length);
    const Faculty = require("../models/Faculty");
    const HOD = require("../models/HOD");
    const formattedUploads = await Promise.all(
      uploads.map(async (upload) => {
        let user;
        if (upload.createdByRole === "FACULTY") {
          user = await Faculty.findById(upload.faculty).select("name employeeId");
        }
        if (upload.createdByRole === "HOD") {
          user = await HOD.findById(upload.faculty).select("name employeeId");
        }
        return { ...upload.toObject(), faculty: user };
      })
    );
    res.json(formattedUploads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET DEPARTMENT RANK
===================================================== */

exports.getDepartmentRank = async (req, res) => {
  try {
    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

     
    const allUploads = await Upload.find({
      status: { $in: ["HOD_APPROVED", "ADMIN_APPROVED"] }
    });

    // Department wise credits sum 
    const deptCredits = {};
    allUploads.forEach(u => {
      const dept = u.department || "Unknown";
      deptCredits[dept] = (deptCredits[dept] || 0) + (u.credits || 0);
    });

    
    const sorted = Object.entries(deptCredits).sort((a, b) => b[1] - a[1]);

    const myDept = req.user.department;
    const rank = sorted.findIndex(([dept]) => dept === myDept) + 1;
    const totalDepts = sorted.length;

    res.json({
      rank: rank > 0 ? rank : null,
      totalDepts,
      myDept
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};