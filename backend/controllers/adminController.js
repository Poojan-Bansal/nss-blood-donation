const Registration = require('../models/Registration');
const Donation = require('../models/Donation');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


exports.summary = async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();

    const donationAgg = await Donation.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      totalRegistrations,
      totalDonationsAmount: donationAgg[0]?.total || 0,
      totalDonationsCount: donationAgg[0]?.count || 0
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



exports.listDonations = async (req, res) => {
  try {
    const { status, q, from, to } = req.query;
    const filter = {};

    if (status) filter.status = status;

    if (from || to) {
      filter['timestamps.initiatedAt'] = {};
      if (from) filter['timestamps.initiatedAt'].$gte = new Date(from + 'T00:00:00.000Z');
      if (to) filter['timestamps.initiatedAt'].$lte = new Date(to + 'T23:59:59.999Z');
    }


    if (q) {
      const re = new RegExp(q, 'i');
      const donations = await Donation.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        { $match: { 'user.email': { $regex: re } } },
        {
          $project: {
            amount: 1,
            status: 1,
            timestamps: 1,
            userId: '$user'
          }
        },
        { $sort: { 'timestamps.initiatedAt': -1 } }
      ]);
      return res.json(donations);
    }

    const donations = await Donation.find(filter)
      .populate('userId', 'email name')
      .sort({ 'timestamps.initiatedAt': -1 });

    res.json(donations);
  } catch (err) {
    console.error('List donations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.listRegistrations = async (req, res) => {
  try {
    const { college, q, from, to } = req.query;
    const filter = {};

    if (college) filter.college = college;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from + 'T00:00:00.000Z');
      if (to) filter.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

 
    if (q) {
      const re = new RegExp(q, 'i');
      const regs = await Registration.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $match: {
            $or: [
              { fullName: { $regex: re } },
              { 'user.email': { $regex: re } }
            ]
          }
        },
        {
          $project: {
            fullName: 1,
            phone: 1,
            college: 1,
            course: 1,
            createdAt: 1,
            updatedAt: 1,
            userId: '$user'
          }
        },
        { $sort: { createdAt: -1 } }
      ]);
      return res.json(regs);
    }

    const regs = await Registration.find(filter)
      .populate('userId', 'email name')
      .sort({ createdAt: -1 });

    res.json(regs);
  } catch (err) {
    console.error('List registrations error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



exports.exportRegistrationsCsv = async (req, res) => {
  try {
    const regs = await Registration.find()
      .populate('userId', 'email name')
      .lean();

    if (!regs.length) {
      return res.status(404).json({ error: 'No registrations' });
    }

    const csvWriter = createCsvWriter({
      path: 'registrations_export.csv',
      header: [
        { id: '_id', title: 'ID' },
        { id: 'userEmail', title: 'Email' },
        { id: 'userName', title: 'Name' },
        { id: 'fullName', title: 'Full Name' },
        { id: 'phone', title: 'Phone' },
        { id: 'college', title: 'College' },
        { id: 'course', title: 'Course' },
        { id: 'updatedAt', title: 'Last Updated' }
      ]
    });

    const records = regs.map(r => ({
      _id: r._id.toString(),
      userEmail: r.userId?.email || '',
      userName: r.userId?.name || '',
      fullName: r.fullName || '',
      phone: r.phone || '',
      college: r.college || '',
      course: r.course || '',
      updatedAt: r.updatedAt ? r.updatedAt.toISOString() : ''
    }));

    await csvWriter.writeRecords(records);

    res.download('registrations_export.csv');
  } catch (err) {
    console.error('Export CSV error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
