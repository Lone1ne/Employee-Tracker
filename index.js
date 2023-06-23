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
          db.query(
            `SELECT 
            e1.id, e1.first_name, e1.last_name, 
            r.title AS job_title, r.salary, 
            d.name AS department,
            CONCAT (e2.first_name,' ',e2.last_name) AS manager
            FROM employee e1 
            LEFT JOIN role r ON e1.role_id = r.id 
            LEFT JOIN department d ON r.department_id = d.id 
            LEFT JOIN employee e2 ON e1.manager_id = e2.id`,
            (err, results) => {
              if (err) {
                console.log(err);
              }
              console.table(results);
              promptUser();
            }
          );
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
                (err) => {
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
          db.query("SELECT * FROM department", (err, departments) => {
            const departmentChoices = departments.map((department) => ({
              name: department.name,
              value: department.id,
            }));
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
                  type: "list",
                  name: "roleDepartmentId",
                  message: "Department",
                  choices: departmentChoices,
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
                  (err) => {
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
          });
          break;
        case "Add an employee":
          db.query("SELECT * FROM role", (err, roles) => {
            const roleChoices = roles.map((role) => ({
              name: role.title,
              value: role.id,
            }));
            db.query("SELECT * FROM employee", (err, employees) => {
              const employeeChoices = employees.map((employee) => ({
                name: employee.first_name + " " + employee.last_name,
                value: employee.id,
              }));
              employeeChoices.push({ name: "No manager", value: null });
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
                    type: "list",
                    name: "employeeRoleId",
                    message: "Role: ",
                    choices: roleChoices,
                  },
                  {
                    type: "list",
                    name: "employeeManagerId",
                    message: "Manager: ",
                    choices: employeeChoices,
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
                    (err) => {
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
            });
          });
          break;
        case "Update an employee role":
          db.query("SELECT * FROM employee", (err, employees) => {
            const employeeChoices = employees.map((employee) => ({
              name: employee.first_name + " " + employee.last_name,
              value: employee.id,
            }));
            db.query("SELECT * FROM role", (err, roles) => {
              const roleChoices = roles.map((role) => ({
                name: role.title,
                value: role.id,
              }));
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "employee",
                    message: "Select an employee",
                    choices: employeeChoices,
                  },
                  {
                    type: "list",
                    name: "role",
                    message: "Select a role",
                    choices: roleChoices,
                  },
                ])
                .then((answers) => {
                  db.query(
                    "UPDATE employee SET role_id = ? WHERE id = ?",
                    [answers.role, answers.employee],
                    (err) => {
                      if (err) {
                        console.log(err);
                      }
                      console.log(`Sucess in updating the employee`);
                      promptUser();
                    }
                  );
                });
            });
          });
          break;
      }
    });
}
promptUser();
