const tempIdService = require('@/services/tempid.service');

async function createTempId(req, res) {
  try { 
    const tempId = await tempIdService.createTempId(req.body);
    return res.status(201).json(tempId);
  } catch (error) {
    return res.status(500).json({ error: "Error creating tempId: " + error.message });
  }
}

module.exports = {
  createTempId,
};