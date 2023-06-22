INSERT INTO department(name)
VALUES
("Software");

INSERT INTO role(title, salary, department_id)
VALUES
("Manager", 80000, 1),
("Jr Developer", 70000, 1)
;

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES
("Squash", "S", 1, null),
("Derek", "S", 2, 1)
;