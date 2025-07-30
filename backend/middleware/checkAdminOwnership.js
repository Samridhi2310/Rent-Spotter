const pgSchema = require('../model/pgDetails');

// Middleware to check if the logged-in admin is the owner of the PG details
exports.checkAdminOwnership = async (req, res, next) => {
  try {
    const pgDetailId = req.params.pgDetailId;
    console.log(pgDetailId,"ghj")
    const pgDetail = await pgSchema.findById(pgDetailId);
    console.log(pgDetail)

    if (!pgDetail) {
      return res.status(404).json({ message: 'PG detail not found' });
    }

    // If the admin is authorized, proceed to the next middleware/route handler
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};
