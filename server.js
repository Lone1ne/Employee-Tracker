const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection(
  {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  console.log(`Connected to the employee_db database.`)
);

inquirer
  .prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do? : ",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
      ],
    },
  ])
  .then((answers) => {
    switch (answers.choice) {
      case "View all departments":
        db.query("SELECT * FROM department", (err, results) => {
          if (err) {
            console.log(err);
          }
          console.table(results);
        });
        break;
      case "View all roles":
        db.query("SELECT * FROM role", (err, results) => {
          if (err) {
            console.log(err);
          }
          console.table(results);
        });
        break;
      case "View all employees":
        db.query("SELECT * FROM employee", (err, results) => {
          if (err) {
            console.log(err);
          }
          console.table(results);
        });
        break;
    }
  });
