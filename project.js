const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'xyz',
    database: 'VendorManagement'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database.');
});

app.use(express.static(path.join(__dirname)));

// route for main.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html')); 
});

// route for vendor-register
app.get('/vendor-register', (req, res) => {
    res.sendFile(path.join(__dirname, 'vendor-register.html'));
});

// route for organisation login
app.get('/organization-login', (req, res) => {
    res.sendFile(path.join(__dirname, 'org-login.html'));
});

// view all contracts
app.get('/contracts', (req, res) => {
    const query = `
        SELECT Contract.ContractID, Contract.ContractName, Contract.C_Status, 
               Contract.EndDate, Contract.Terms, Vendor.VendorName 
        FROM Contract 
        JOIN Vendor ON Vendor.VendorID = Contract.VendorID
        ORDER BY Contract.EndDate DESC;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('error getting the contracts');
        res.json(results);
    });
});

// check contracts near expiration
app.get('/check-renewals', (req, res) => {
    const query = `
        SELECT Contract.ContractID, Contract.ContractName, Vendor.VendorName, DATEDIFF(Contract.EndDate, CURDATE()) AS DaysLeft FROM Contract 
        JOIN Vendor ON Vendor.VendorID = Contract.VendorID
        WHERE Contract.C_Status = 'Active' AND DATEDIFF(Contract.EndDate, CURDATE()) <= 30;
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error checking renewals.');
        res.json(results);
    });
});

// route to display all vendors
app.get('/vendors', (req, res) => {
    const query = 'SELECT VendorID, VendorName FROM Vendor';
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error fetching vendors.');
        res.json(results);
    });
});

// route to get budgets for all departments
app.get('/budgets', (req, res) => {
    const query = `
        SELECT Department.DeptID, Department.DeptName, Budget.Budget FROM Department 
        INNER JOIN Budget ON Department.DeptID = Budget.DeptID
    `;
    db.query(query, (err, results) => {
            if (err) return res.status(500).send('Error getting budget'); 
        res.json(results);  
    });
});

// route to view all purchase orders
app.get('/purchase-orders2', (req, res) => {
    const query = `
        SELECT * FROM PurchaseOrder
        ORDER BY OrderDate DESC
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send('Error getting purchase orders');
        res.json(results);
    });
});

// route to edit da budget
app.post('/budget/update', (req, res) => {
    const { deptID, newBudget } = req.body;
    const query = `
        UPDATE Budget 
        SET Budget = ? 
        WHERE DeptID = ?
    `;
    db.query(query, [newBudget, deptID], (err) => {
        if (err) return res.status(500).send('Error editing da budget.');
        res.send('SUCCESS: Budget updated');
    });
});

// route for vendor feedback
app.post('/vendor/feedback', (req, res) => {
    const { vendorID, serviceQuality, deliveryTime, pricing } = req.body;

    const query = `
        INSERT INTO PerformanceMetrics (VendorID, ServiceQuality, DeliveryTime, PerformanceRating) 
        VALUES (?, ?, ?, ?);
    `;
    
    db.query(query, [vendorID, serviceQuality, deliveryTime, performanceRating], (err) => {
        if (err) {
            return res.status(500).send('Error adding feedback.');
        }
        res.send({message: 'Feedback submitted successfully.'});
    });
});

// route for rating vendors (1 to 10)
app.post('/vendor/rating', (req, res) => {
    const { vendorID, performanceRating } = req.body;
    const query = `
        UPDATE PerformanceMetrics 
        SET PerformanceRating = ? 
        WHERE VendorID = ?;
    `;
    db.query(query, [performanceRating, vendorID], (err) => {
        if (err) {
            console.error('Error assigning rating:', err);
            return res.status(500).send({message: 'Error giving rating.'});
        }
        res.send({message: 'Rating assigned successfully.'});
    });
});

// route for adding vendors
app.post('/vendor/add', (req, res) => {
    const { vendorName, serviceCategory, email } = req.body;
    const query = 'INSERT INTO Vendor (VendorName, ServiceCategory, Email, isCompliant) VALUES (?, ?, ?, ?)';
    db.query(query, [vendorName, serviceCategory, email, false], (err, result) => {
        if (err) {
            return res.status(500).send('Error adding vendor.');
        }
        res.json({message: 'vendor added successfully :)' });
    });
});

// route for updating vendor details
app.post('/vendor/update', (req, res) => {
    const { vendorID, vendorName, serviceCategory, email } = req.body;
    const query = 'UPDATE Vendor SET VendorName = ?, ServiceCategory = ?, Email = ? WHERE VendorID = ?';
    db.query(query, [vendorName, serviceCategory, email, vendorID], (err) => {
        if (err) {
            return res.status(500).send('error updating vendor');
        }
        res.json({ message: 'Vendor updated successfully' });
    });
});

// route for removing vendors
app.delete('/vendor/remove/:vendorID', (req, res) => {
    const { vendorID } = req.params;
    const query = 'DELETE FROM Vendor WHERE VendorID = ?';
    db.query(query, [vendorID], (err) => {
        if (err) {
            return res.status(500).send('Error removing vendor');
        }
        res.json({message: 'Vendor removed successfully'});
    });
});

// route for checking compliance of vendors
app.get('/vendors/compliance', (req, res) => {
    const query = 'SELECT VendorID, VendorName, isCompliant FROM Vendor';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching compliance status');
    }
        res.json(results);
    });
});

// change vendor compliance status
app.post('/vendor/compliance', (req, res) => {
    const { vendorID, isCompliant } = req.body;
    const query = `
            UPDATE Vendor 
            SET isCompliant = ? 
            WHERE VendorID = ?
        `;
    db.query(query, [isCompliant, vendorID], (err) => {
        if (err) return res.status(500).send('Error updating compliance status');
        res.json({message: 'compliance status updated' });
    });
});

// route to generate performance reports
app.get('/performance-reports', (req, res) => {
    const query = `
        SELECT Vendor.VendorName, PerformanceMetrics.PerformanceRating, PerformanceMetrics.ServiceQuality, PerformanceMetrics.DeliveryTime FROM Vendor
        JOIN PerformanceMetrics ON Vendor.VendorID = PerformanceMetrics.VendorID
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send({message: 'Error generating reports.'});
        }
        res.json(results);
    });
});

// route to fetch all purchase orders 
app.get('/purchase-orders', (req, res) => {
    const query = `
        SELECT PurchaseOrder.OrderID, PurchaseOrder.OrderDate, PurchaseOrder.TotalCost, PurchaseOrder.OrderStatus, Vendor.VendorName, Members.username FROM PurchaseOrder 
        INNER JOIN Vendor ON Vendor.VendorID = PurchaseOrder.VendorID
        INNER JOIN Members ON Members.MemberID = PurchaseOrder.MemberID
        ORDER BY PurchaseOrder.OrderDate DESC;
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error getting purchase orders:', err);
            return res.status(500).send('Error getting purchase orders.');
        }
        res.json(results);
    });
});

// route to create purchase order
app.post('/purchase-order/create', (req, res) => {
    const { vendorID, memberID, itemName, price, quantity, shipAddress, shipCity } = req.body;
    const totalCost = price * quantity;

    // make sure MemberID belongs to Procurement
    const memberValidationQuery = `
        SELECT Members.MemberID FROM Members 
        INNER JOIN Team ON Members.TeamID = Team.TeamID 
        INNER JOIN Department ON Team.DeptID = Department.DeptID 
        WHERE Members.MemberID = ? AND Department.DeptName = 'Procurement';
    `;
    db.query(memberValidationQuery, [memberID], (err, memberResults) => {
        if (err) {
            console.error('Error validating id of memberr', err);
            return res.status(500).send({message: 'Error validating member'});
        }
        if (memberResults.length === 0) {
            return res.status(400).send({ message: 'Invalid memberID' });
        }

        // validate against budget
        const budgetQuery = `
            SELECT Budget FROM Budget 
            WHERE DeptID = (SELECT DeptID FROM Department WHERE DeptName = 'Procurement');
        `;
        db.query(budgetQuery, (err, budgetResults) => {
            if (err) {
                console.error('Error checking budget:', err);
                return res.status(500).send({ message: 'Error checking budget.' });
            }
            
            var budget = 0;
            if (budgetResults[0] && budgetResults[0].Budget) {
                budget = budgetResults[0].Budget;
            } 
            else {
                budget = 0;
            }
            if (totalCost > budget) {
                return res.status(400).send({message: 'Order exceeds the department budget'});
            }

            // insert into PurchaseOrder table
            const orderQuery = `
                INSERT INTO PurchaseOrder (VendorID, MemberID, OrderDate, ShipAddress, ShipCity, ShipDate, OrderStatus, TotalCost) 
                VALUES (?, ?, CURDATE(), ?, ?, DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'Ordered', ?);
            `;

            db.query(orderQuery, [vendorID, memberID, shipAddress, shipCity, totalCost], (err, result) => {
                if (err) {
                    console.error('Error creating purchase order:', err);
                    return res.status(500).send({ message: 'Error creating purchase order.' });
                }

                // auto generated order ID
                const orderID = result.insertId; 

                // validate orderID before inserting into OrderDetails
                const validateOrderQuery = `
                    SELECT OrderID FROM PurchaseOrder 
                    WHERE VendorID = ? AND MemberID = ? AND TotalCost = ? AND OrderDate = CURDATE();
                `;

                db.query(validateOrderQuery, [vendorID, memberID, totalCost], (err, validateResults) => {
                    if (err) {
                        return res.status(500).send({message: 'Error validating orderID.'});
                    }

                    if (validateResults.length === 0) {
                        return res.status(400).send({message: 'FAIL. Duplicate orderID detected'});
                    }

                    const validOrderID = validateResults[0].OrderID;

                    // insert into OrderDetails table
                    const detailsQuery = `
                        INSERT INTO OrderDetails (OrderID, Item, UnitPrice, Quantity) 
                        VALUES (?, ?, ?, ?);
                    `;

                    db.query(detailsQuery, [validOrderID, itemName, price, quantity], (err) => {
                        if (err) {
                            console.error('Error adding order details:', err);
                            return res.status(500).send({message:'error adding order details'});
                        }
                        // update budget after purchase
                        const updateBudgetQuery = `
                            UPDATE Budget 
                            SET Budget = Budget - ? 
                            WHERE DeptID = (SELECT DeptID FROM Department WHERE DeptName = 'Procurement');
                        `;
                        db.query(updateBudgetQuery, [totalCost], (err) => {
                            if (err) {
                                console.error('Error updating budget:', err);
                                return res.status(500).send({ message:'error updating budget'});
                            }
                            res.send({message: 'Purchase order created'});
                        });
                    });
                });
            });
        });
    });
});

// route to generate expiration notification
app.post('/generate-notification', (req, res) => {
    const { contractName, daysLeft } = req.body;

    const notificationText = `${daysLeft} days left until expiration for the contract "${contractName}".`;
    const query = `
        INSERT INTO Notification (NotificationText) 
        VALUES (?)
    `;
    db.query(query, [notificationText], (err) => {
        if (err) return res.status(500).send('Error generating notification.');
        res.send('Notification inserted successfully.');
    });
});

// route to fetch notifications
app.get('/notifications', (req, res) => {
    const query = `
        SELECT NotificationText FROM Notification 
        ORDER BY NotificationID DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching notifications.');
        }
        res.json(results);
    });
});

// update contract details
app.post('/contract/update', (req, res) => {
    const { contractID, renewalDate, terms } = req.body;
    const query = `
        UPDATE Contract 
        SET EndDate = ?, Terms = ? 
        WHERE ContractID = ?
    `;
    db.query(query, [renewalDate, terms, contractID], (err) => {
        if (err) {
            return res.status(500).send('error updating contract details');
        }
        res.send('Contract details are updated successfully');
    });
});

// vendor registration route
app.post('/register-vendor', (req, res) => {
    const { vendorName, email, serviceCategory, password } = req.body;

    const query = 
    `INSERT INTO Vendor (VendorName, ServiceCategory, Email, v_password, isCompliant) 
    VALUES (?, ?, ?, ?, ?)';
    `;
    db.query(query, [vendorName, serviceCategory, email, password, false], (err, result) => {
        if (err) {
            return res.status(500).send('error registering vendor')
        };
        res.send('vendor registered successfuly');
    });
});

// route for employee login
app.post('/organization-login', (req, res) => {
    const {username,password } = req.body;

    // validate username and password
    const query = "SELECT Department.DeptID from Department INNER JOIN Team on Team.DeptID = Department.DeptID INNER JOIN Members on Team.TeamID = Members.TeamID WHERE Members.username = ? AND Members.pass = ?;";
    db.query(query, [username, password], (err, results) => {
        if (err) {
            return res.status(500).send('Error during login');
        }
        if (results.length > 0) {
            const deptID = results[0].DeptID;

            // retrieve the dept name using DeptID
            const deptQuery = 'SELECT DeptName FROM Department WHERE DeptID = ?';
            db.query(deptQuery, [deptID], (deptErr, deptResults) => {
                if (deptErr) {
                    return res.status(500).send('Error with deptQuery.');
            }
                if (deptResults.length > 0) {
                    const deptName = deptResults[0].DeptName;

                    // redirect to pages based on dept name
                    switch (deptName) {
                        case 'Contract Management':
                            res.sendFile(path.join(__dirname, 'contract.html'));
                            break;
                        case 'Procurement':
                            res.sendFile(path.join(__dirname, 'procurement.html'));
                            break;
                        case 'Finance':
                            res.sendFile(path.join(__dirname, 'finance.html'));
                            break;
                        case 'Vendor Management':
                            res.sendFile(path.join(__dirname, 'vendor-management.html'));
                            break;
                        default:
                            res.send('Department could not be found.');
                    }
                } 
                else {
                    res.status(404).send('Department not founddd');
                }
            });
        } 
        else {
            res.status(401).send('Invalid credentials');
        }
    });
});

// start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
