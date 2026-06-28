const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const hodController = require("../controllers/hodController");
const uploadController = require("../controllers/uploadController");
const { updateProfile } = require("../controllers/authController");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

router.use(authMiddleware, roleMiddleware(ROLES.HOD));

router.get("/profile", asyncHandler(hodController.getHodProfile));

router.get("/pending-faculty", asyncHandler(hodController.getPendingFaculty));
router.get("/faculty-list", asyncHandler(hodController.getApprovedFaculty));
router.post("/create-faculty", asyncHandler(hodController.createFaculty));
router.put("/approve-faculty/:id", asyncHandler(hodController.approveFaculty));
router.put("/discussion-faculty/:id", asyncHandler(hodController.discussionFaculty));

router.get("/pending-uploads", asyncHandler(uploadController.getPendingUploadsForHOD));
router.put("/approve-upload/:id", asyncHandler(uploadController.approveUploadByHOD));
router.post("/bulk-approve", asyncHandler(uploadController.bulkApprove));
router.put("/discussion/:id", asyncHandler(uploadController.callForDiscussion));
router.put("/return-revision/:id", asyncHandler(uploadController.returnForRevision));

router.get("/faculty-uploads/:facultyId", asyncHandler(hodController.getFacultyUploads));
router.get("/department-uploads", asyncHandler(uploadController.getDepartmentUploads));
router.put("/update-profile", asyncHandler(updateProfile));

module.exports = router;
