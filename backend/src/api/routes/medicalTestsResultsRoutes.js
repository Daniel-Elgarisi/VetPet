const express = require("express");
const router = express.Router();
const { getPetMedicalTestResults, getTestResultDetails, getBloodTestFindingsInfo } = require("../../controllers/medicalTestsResultsController");

router.get("/get-medical-tests-results/:pet_id", getPetMedicalTestResults);
router.get("/get-test-result-details/:test_id/:table_name", getTestResultDetails);
router.get("/get-blood-test-findings-info/:test_type/:pet_gender/:pet_type", getBloodTestFindingsInfo);

module.exports = router;
