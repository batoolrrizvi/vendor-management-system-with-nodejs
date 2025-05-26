CREATE SCHEMA VendorManagement;
#drop schema VendorManagement;
use VendorManagement;
CREATE TABLE Vendor(
VendorID INT PRIMARY KEY AUTO_INCREMENT,
VendorName VARCHAR(255) NOT NULL,
ServiceCategory VARCHAR(255) NOT NULL,
Email VARCHAR(255),
v_password VARCHAR(100) NOT NULL,
isCompliant BOOL
);

CREATE TABLE Department(
DeptID INT PRIMARY KEY auto_increment,
DeptName VARCHAR(100) NOT NULL,
DeptHeadID INT NOT NULL
);

# every department has a team
CREATE TABLE Team(
TeamID INT PRIMARY KEY AUTO_INCREMENT,
DeptID INT NOT NULL,
FOREIGN KEY (DeptID) REFERENCES Department(DeptID)
);

# every team has members
CREATE TABLE Members(
MemberID INT Primary KEY AUTO_INCREMENT,
TeamID INT NOT NULL,
firstName VARCHAR(255) NOT NULL,
lastName VARCHAR(255) NOT NULL,
username VARCHAR(100) NOT NULL,
pass VARCHAR(50) NOT NULL,
email VARCHAR(100),
member_role varchar(50) NOT NULL,
FOREIGN KEY (TeamID) REFERENCES Team(TeamID)
);

# only isCompliant vendors have a comp cert
CREATE TABLE CompCert(
CertID INT PRIMARY KEY UNIQUE,
CertName VARCHAR(100) NOT NULL,
VendorID INT NOT NULL UNIQUE,
IssueDate DATE NOT NULL,
ExpDate DATE NOT NULL,
FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID)
);

# every vendor has a contract w a department. the contract management team manages it
CREATE TABLE Contract(
ContractID INT PRIMARY KEY,
ContractName VARCHAR(100) NOT NULL,
StartDate DATE NOT NULL,
EndDate DATE NOT NULL,
C_Status ENUM('Active', 'Expired'), #active or expired
Terms TEXT NOT NULL,
VendorID INT NOT NULL,
DeptID INT NOT NULL,
FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID),
FOREIGN KEY (DeptID) REFERENCES Department(DeptID)
);

# only for vendor
CREATE TABLE PerformanceMetrics(
PerformanceRating INT,
ServiceQuality INT,
DeliveryTime INT,
VendorID INT NOT NULL,
FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID),
CHECK (PerformanceRating BETWEEN 0 AND 10), 
CHECK (ServiceQuality BETWEEN 0 AND 10),
CHECK (DeliveryTime BETWEEN 0 AND 10)
);

# a member makes a purchase order and vendor takes it
# hence vendorID + memberID
CREATE TABLE PurchaseOrder(
VendorID INT NOT NULL,
MemberID INT NOT NULL,
OrderID INT PRIMARY KEY AUTO_INCREMENT,
OrderDate DATE NOT NULL,
ShipAddress VARCHAR(255) NOT NULL,
ShipCity VARCHAR(100) NOT NULL,
ShipDate DATE,
OrderStatus ENUM('Ordered', 'Shipping', 'Delivered'), #ordered, shipping, delivered
TotalCost DECIMAL NOT NULL, #quantity * unitprice
FOREIGN KEY (VendorID) REFERENCES Vendor(VendorID),
FOREIGN KEY (MemberID) REFERENCES Members(MemberID)
);

CREATE TABLE OrderDetails(
OrderID INT NOT NULL,
Item VARCHAR(100) NOT NULL,
UnitPrice DECIMAL NOT NULL,
Quantity INT NOT NULL,
CONSTRAINT CHK_Det CHECK (OrderDetails.UnitPrice>=0 AND OrderDetails.Quantity>=0),
FOREIGN KEY (OrderID) REFERENCES PurchaseOrder(OrderID)
);
show warnings;

# every department has a budget
CREATE TABLE Budget(
DeptID INT NOT NULL,
Budget DECIMAL NOT NULL,
FOREIGN KEY (DeptID) REFERENCES Department(DeptID),
CHECK (Budget>=0)
);

# notification table
CREATE TABLE Notification (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    NotificationText TEXT NOT NULL
);

ALTER TABLE Members
ADD UNIQUE(username);

# INSERTION STARTS HERE

#inserting into department
INSERT INTO Department(DeptName, DeptHeadID)
VALUES
('Contract Management', 8),
('Procurement', 3),
('Finance', 10),
('Vendor Management', 20);
show errors;
        
# inserting into vendors
INSERT INTO Vendor (VendorName, ServiceCategory, Email, v_password, isCompliant)
VALUES
('Alpha Supplies', 'Office Supplies', 'alpha@supplies.com', 'alpha@123', TRUE),
('Beta Logistics', 'Logistics', 'beta@logistics.com', 'beta@123', FALSE),
('Gamma Tech', 'IT Services', 'gamma@tech.com', 'gamma@321', TRUE);

#inserting into team
INSERT INTO Team (DeptID)
VALUES
(1), (2), (3), (4), (1), (3);

#inserting into members
INSERT INTO Members (TeamID, firstName, lastName, username, pass, email, member_role)
VALUES
(1, 'Anaya', 'Hassan', 'anaya.h', 'password123', 'anaya@example.com', 'Contract Negotiator'),
(1, 'Malik', 'Ali', 'malikali', 'pass123', 'malik.ali@example.com', 'Risk Analyst'),
(1, 'Zara', 'Doe', 'zaradoe', 'password123', 'zdoe@example.com', 'Contract Administrator'),
(1, 'Noor', 'Hussain', 'noor.h', 'noori', 'noor.h@example.com', 'Contract Engineer'),
(2, 'Jane', 'Smith', 'jsmith', 'p@ss987', 'jsmith@example.com', 'Member'),
(2, 'Maria', 'Khan', 'mariakhan123', 'kh@nm_ria', 'mariakkhan@example.com', 'Member'),
(3, 'Alice', 'Johnson', 'ajohnson', 'pass456', 'ajohnson@example.com', 'Accountant'),
(3, 'Saad', 'Shahzad', 'shahzad_saad', '123pass', 'saadsh@example.com', 'Accountant'),
(3, 'Laine', 'Morrison', 'lmorrison', 'morr123', 'lainemorrison@example.com', 'Accountant'),
(4, 'Bob', 'Brown', 'bbrown', 'mypassword', 'bbrown@example.com', 'Vendor Manager'),
(4, 'Janine', 'Walton', 'jwalton', 'hahano', 'jwalton@example.com', 'Data Analyst'),
(4, 'Karina', 'Ahmad', 'kahmad', 'wowpass', 'k.ahmad@example.com', 'Data Analyst'),
(4, 'Pareesay', 'Warraich', 'pwarraich', 'newpass', 'pareesay@example.com', 'Vendor Manager'),
(4, 'Shahzeb', 'Ahmad', 'shahzeb.ahmad', 'mypass', 'shahzeb.ahmad@example.com', 'Vendor Manager'),
(5, 'Ammara', 'Peer', 'ammara781', 'passwordnew', 'ammara@example.com', 'Contract Negotiator'),
(5, 'Suleman', 'Nasir', 'sulemaan1', 'sulemanpass', 'suleman@example.com', 'Contract Negotiator'),
(5, 'Yusra', 'Hammad', 'yusrahammad', 'passyusra', 'yusra@example.com', 'Contract Negotiator'),
(5, 'Mahnoor', 'Hassan', 'mahnoor_hassan', 'hasspass', 'mahnoor@example.com', 'Contract Negotiator'),
(6, 'Muhammad', 'Vasim', 'm.vasim', 'v@sib123', 'mvasim@example.com', 'Financial Analyst'),
(6, 'Khuzaima', 'Khan', 'khuzaima.h', 'kh98n', 'khuzaimak@example.com', 'Financial Analyst'),
(6, 'Mujtaba', 'Ahsan', 'mujtabaahsan', 'ahsan123', 'mujtabaahsan@example.com', 'Financial Analyst');

# inserting into contract
INSERT INTO Contract (ContractID, ContractName, StartDate, EndDate, C_Status, Terms, VendorID, DeptID)
VALUES
(201, 'Supply Contract Alpha', '2023-01-01', '2024-12-31', 'Active', 'Supply of office goods.', 1, 1),
(202, 'Logistics Support Beta', '2022-06-01', '2023-05-31', 'Expired', 'Logistics for office relocation.', 2, 2),
(203, 'IT Support Gamma', '2023-03-01', '2025-02-28', 'Active', 'IT infrastructure maintenance.', 3, 3);

# inserting into compcert
INSERT INTO CompCert (CertID, CertName, VendorID, IssueDate, ExpDate)
VALUES
(101, 'ISO 9001', 1, '2022-01-01', '2024-01-01'),
(102, 'Logistics Excellence', 2, '2021-06-15', '2023-06-15'),
(103, 'Cyber Security', 3, '2023-03-20', '2025-03-20');

# inserting into budget
INSERT INTO Budget (DeptID, Budget)
VALUES
(1, 500000),
(2, 1000000),
(3, 1000000),
(4, 1000000);

# inserting into performance metrics
INSERT INTO PerformanceMetrics (PerformanceRating, ServiceQuality, DeliveryTime, VendorID)
VALUES
(9, 8, 7, 1),
(6, 7, 5, 2),
(8, 9, 9, 3);

# inserting some more values
INSERT INTO Members (TeamID, firstName, lastName, username, pass, email, member_role)
VALUES
(2, 'Zayaan', 'Ali', 'zayaan.ali', 'barish', 'zayaan.ali@example.com', 'Strategic Sourcing Manager'),
(2, 'Lyra', 'Yousaf', 'lyraayousaf', '1876yousaf', 'lyrayousaf@example.com', 'Procurement Analyst'),
(2, 'Myra', 'Ahsan', 'myraah', 'myraisme', 'myra@example.com', 'Procurement Analyst');

UPDATE Department
SET DeptHeadID = '1'
WHERE DeptID = '1';

UPDATE Department
SET DeptHeadID = '13'
WHERE DeptID = '4'; 

UPDATE Department
SET DeptHeadID = '22'
WHERE DeptID = '2'; 

UPDATE Department
SET DeptHeadID = '19'
WHERE DeptID = '3';  

# trigger for order status
DELIMITER $$
CREATE TRIGGER update_order_status
BEFORE UPDATE ON PurchaseOrder
FOR EACH ROW
BEGIN
    IF NEW.ShipDate < CURDATE() THEN
        SET NEW.OrderStatus = 'Delivered';
    ELSE
        SET NEW.OrderStatus = 'Shipping';
    END IF;
END$$
DELIMITER ;
show warnings;

# updating contract status
DELIMITER $$
CREATE TRIGGER update_contract_status
BEFORE UPDATE ON Contract
FOR EACH ROW
BEGIN
    IF NEW.EndDate < CURDATE() THEN
        SET NEW.C_Status = 'Expired';
    ELSE
        SET NEW.C_Status = 'Active';
    END IF;
END$$
DELIMITER ;

# trigger for expiration of contract
DELIMITER $$
CREATE TRIGGER check_contract_renewals
AFTER UPDATE ON Contract
FOR EACH ROW
BEGIN
    IF DATEDIFF(NEW.EndDate, CURDATE()) <= 30 AND NEW.C_Status = 'Active' THEN
        INSERT INTO Notification (NotificationText)
        VALUES (CONCAT('Contract "', NEW.ContractName, '" is about to expire on ', NEW.EndDate, '. Please review.'));
    END IF;
END$$
DELIMITER ;

# trigger for updating the vendor compliant certifications
DELIMITER $$
CREATE TRIGGER update_vendor_compliance
AFTER UPDATE ON CompCert
FOR EACH ROW
BEGIN
    IF NEW.ExpDate < CURDATE() THEN
        UPDATE Vendor
        SET isCompliant = FALSE
        WHERE VendorID = NEW.VendorID;
    ELSE
        UPDATE Vendor
        SET isCompliant = TRUE
        WHERE VendorID = NEW.VendorID;
    END IF;
END$$
DELIMITER ;
show warnings;
#drop schema VendorManagement;
