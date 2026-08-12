require('dotenv').config({ override: true }); // Loads variables from .env, overriding any stale system env vars

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Employee = require('./models/Employee');

const dummyEmployees = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    position: 'Software Engineer',
    department: 'Engineering',
    salary: 85000,
    joinDate: new Date('2021-03-15'),
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    position: 'Product Manager',
    department: 'Product',
    salary: 95000,
    joinDate: new Date('2020-07-01'),
  },
  {
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    position: 'UI/UX Designer',
    department: 'Design',
    salary: 78000,
    joinDate: new Date('2022-01-10'),
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    position: 'DevOps Engineer',
    department: 'Engineering',
    salary: 92000,
    joinDate: new Date('2021-11-22'),
  },
  {
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    position: 'HR Manager',
    department: 'Human Resources',
    salary: 70000,
    joinDate: new Date('2019-05-05'),
  },
  {
    name: 'Sarah Brown',
    email: 'sarah.brown@example.com',
    position: 'Data Analyst',
    department: 'Data',
    salary: 81000,
    joinDate: new Date('2023-02-14'),
  },
];

const seed = async () => {
  try {
    await connectDB();

    const force = process.argv.includes('--force');
    const count = await Employee.countDocuments();
    if (count > 0 && !force) {
      console.log(`Employees collection already has ${count} record(s). Skipping seed.`);
      console.log('Run `npm run seed -- --force` to wipe and re-seed.');
    } else {
      if (force && count > 0) {
        await Employee.deleteMany({});
        console.log(`Removed existing ${count} record(s) (--force).`);
      }
      const inserted = await Employee.insertMany(dummyEmployees);
      console.log(`✅ Seeded ${inserted.length} dummy employees.`);
    }
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
