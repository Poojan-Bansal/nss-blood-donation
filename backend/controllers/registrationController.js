// backend/controllers/registrationController.js
const Registration = require('../models/Registration');


exports.createRegistration = async (req, res) => {
  try {
    const userId = req.user.id;


    const existing = await Registration.findOne({ userId });
    if (existing) {
      return res.status(400).json({ error: "Registration already exists. Use update instead." });
    }

    const registration = new Registration({
      userId,
      fullName: req.body.fullName,
      phone: req.body.phone,
      college: req.body.college,
      course: req.body.course
    });

    await registration.save();
    res.status(201).json(registration);

  } catch (error) {
    console.error("Create Registration Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getMyRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const registration = await Registration.findOne({ userId });
    if (!registration) {
      return res.status(404).json({ error: "No registration found" });
    }
    res.json(registration);
  } catch (error) {
    console.error("Get Registration Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};



exports.updateMyRegistration = async (req, res) => {
  try {
    const userId = req.user.id;

 
    const updateBody = { ...req.body, updatedAt: Date.now() };

    const updated = await Registration.findOneAndUpdate(
      { userId },               
      { $set: updateBody },     
      { new: true }             
    );

    if (!updated) {
      return res.status(404).json({ error: "Registration not found" });
    }

    res.json(updated);

  } catch (error) {
    console.error("Update Registration Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().populate('userId', 'name email');
    res.json(registrations);
  } catch (error) {
    console.error("Get All Registrations Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
