const mongoose = require('mongoose');
const Employee = require('../models/Employee');

// Only allow known fields through (prevents mass assignment of _id, __v, timestamps, etc.)
const pickEmployeeFields = (body) => ({
  name: body.name,
  email: body.email,
  position: body.position,
  department: body.department,
  salary: body.salary,
  joinDate: body.joinDate,
});

/**
 * GET /api/employees
 * Get all employees
 */
exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json({ count: employees.length, employees });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/employees/:id
 * Get a single employee by id
 */
exports.getEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/employees
 * Add a new employee
 * Body: { name, email, position?, department?, salary?, joinDate? }
 */
exports.createEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.create(pickEmployeeFields(req.body));
    res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/employees/:id
 * Update an existing employee (partial update of provided fields)
 */
exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await Employee.findByIdAndUpdate(id, pickEmployeeFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/employees/:id
 * Delete an employee by id
 */
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};
