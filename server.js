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

function promptUser() {
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
            promptUser();
          });
          break;
        case "View all roles":
          db.query(
            `SELECT role.id, role.title, role.salary, department.name AS department 
            FROM role 
            JOIN department ON role.department_id = department.id`,
            (err, results) => {
              if (err) {
                console.log(err);
              } else {
                console.table(results);
                promptUser();
              }
            }
          );
          break;
        case "View all employees":
          db.query("SELECT * FROM employee", (err, results) => {
            if (err) {
              console.log(err);
            }
            console.table(results);
            promptUser();
          });
          break;
        case "Add a department":
          inquirer
            .prompt([
              {
                type: "input",
                name: "newDepartment",
                message: "Enter the name of the new Department: ",
              },
            ])
            .then((departmentResults) => {
              db.query(
                "INSERT INTO department(name)VALUES(?);",
                departmentResults.newDepartment,
                (err, results) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(
                    `Sucess in adding the ${departmentResults.newDepartment} department to the department table`
                  );
                  promptUser();
                }
              );
            });
          break;
        case "Add a role":
          inquirer
            .prompt([
              {
                type: "input",
                name: "roleTitle",
                message: "Enter the role title: ",
              },
              {
                type: "number",
                name: "roleSalary",
                message: "Enter the salary of the role: ",
              },
              {
                type: "number",
                name: "roleDepartmentId",
                message: "Department ID: ",
              },
            ])
            .then((roleResults) => {
              db.query(
                "INSERT INTO role(title, salary, department_id)VALUES(?, ?, ?);",
                [
                  roleResults.roleTitle,
                  roleResults.roleSalary,
                  roleResults.roleDepartmentId,
                ],
                (err, results) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(
                    `Sucess in adding the ${roleResults.roleTitle} role to the role table`
                  );
                  promptUser();
                }
              );
            });
          break;
        case "Add an employee":
          inquirer
            .prompt([
              {
                type: "input",
                name: "employeeFirstName",
                message: "Employee first name: ",
              },
              {
                type: "input",
                name: "employeeLastName",
                message: "Employee last name: ",
              },
              {
                type: "number",
                name: "employeeRoleId",
                message: "Role ID: ",
              },
              {
                type: "number",
                name: "employeeManagerId",
                message: "Manager ID: ",
              },
            ])
            .then((employeeResults) => {
              employeeResults.employeeManagerId =
                employeeResults.employeeManagerId
                  ? employeeResults.employeeManagerId
                  : null;
              db.query(
                "INSERT INTO employee(first_name, last_name, role_id, manager_id)VALUES(?, ?, ?, ?);",
                [
                  employeeResults.employeeFirstName,
                  employeeResults.employeeLastName,
                  employeeResults.employeeRoleId,
                  employeeResults.employeeManagerId,
                ],
                (err, results) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(
                    `Sucess in adding ${employeeResults.employeeFirstName} ${employeeResults.employeeLastName} to the employee table`
                  );
                  promptUser();
                }
              );
            });
          break;
      }
    });
}
promptUser();
