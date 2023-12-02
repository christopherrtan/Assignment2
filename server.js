const express = require('express');
const app = express();
const qs = require('querystring');
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});
app.use(express.static(__dirname + '/public'));
app.listen(8080, () => console.log(`listening on port 8080`));
const products = require(__dirname + "/products.json");
app.get('/products.js', function(request, response, next) {
    response.type('.js');
    let products_str = `let products = ${JSON.stringify(products)};`;
    response.send(products_str);
});
app.use(express.urlencoded({extended: true}));

// Function to validate the quantity input for ordering products
function validateQuantity(quantity, availableQuantity) {
    let errors = [];

    quantity = Number(quantity);

    switch (true) {
        case isNaN(quantity) || quantity === '':
            errors.push("Not a number. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0 && !Number.isInteger(quantity):
            errors.push("Negative inventory and not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0:
            errors.push("Negative inventory. Please enter a non-negative quantity to order.");
            break;
        case quantity != 0 && !Number.isInteger(quantity):
            errors.push("Not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity > availableQuantity:
            errors.push(`We do not have ${quantity} available.`);
            break;
    }
    return errors;
}

const fs = require('fs');
const filename = 'user_data.json';

let user_data;

// Check if the user_data file exists, and read its contents if it does
if (fs.existsSync(filename)) {
    let data = fs.readFileSync(filename, 'utf-8');
    user_data = JSON.parse(data);
    console.log(user_data);
} else {
    console.log(`${filename} does not exist`);
    user_data = {};
}

let temp_user = {};

// Handle the purchase process when the form is submitted
app.post("/process_purchase", function(request, response) {
    let POST = request.body;
    let has_qty = false;
    let errorObject = {};

    // Iterate through the products to validate and process the quantities
    for (let i in products) {
        let qty = POST[`qty${[i]}`];
        has_qty = has_qty || (qty > 0);

        let errorMessages = validateQuantity(qty, products[i].qty_available);

        if (errorMessages.length > 0) {
            errorObject[`qty${[i]}_error`] = errorMessages.join(', ');
        }
    }

    // Redirect based on the validation results and quantities
    if (has_qty == false && Object.keys(errorObject).length == 0) {
        response.redirect("./products.html?error");
    }

    else if (has_qty == true && Object.keys(errorObject).length == 0) {
        for (let i in products) {
            temp_user[`qty${i}`] = POST[`qty${[i]}`];
        }
        let params = new URLSearchParams(temp_user);
        response.redirect(`./login.html?${params.toString()}`);
    }

    else if (Object.keys(errorObject).length > 0) {
        response.redirect("./products.html?" + qs.stringify(POST) + `&inputErr`);
    }
});

// Handle the login process when the form is submitted
app.post('/process_login', function(request, response){
    let POST = request.body;
    let entered_email = POST['email'].toLowerCase();
    let entered_password = POST['password'];

    // Validate login credentials and redirect accordingly
    if(entered_email.length == 0 && entered_password.length == 0) {
        request.query.loginErr = 'Email address and password are required.';
    }

    else if (user_data[entered_email]) {
        if (user_data[entered_email].password == entered_password) {
            temp_user['email'] = entered_email;
            temp_user['name'] = user_data[entered_email].name;

            let params = new URLSearchParams(temp_user);
            response.redirect(`/invoice.html?valid&${params.toString()}`);
            return;
        }

        else if (entered_password.length == 0) {
            request.query.loginErr = 'Password field cannot be empty.';
        }

        else {
            request.query.loginErr = 'Invalid password.';
        }
    }

    else {
        request.query.loginErr = 'Invalid email.';
    }

    // Return email input to make input box sticky
    request.query.email = entered_email;
    let params = new URLSearchParams(request.query);
    response.redirect(`./login.html?${params.toString()}`);
});

// Handle the purchase logout process
app.post('/purchase_logout', function(request, response) {
    // Calculate inventory. Used to be in /process_purchase
    for (let i in products) {
        products[i].qty_sold += Number(temp_user[`qty${i}`]) || 0; 
        products[i].qty_available = Number(products[i].qty_available) - Number(temp_user[`qty${i}`]) || 0;
    }

    // Update the products.json file with the new inventory data
    fs.writeFile(__dirname + '/products.json', JSON.stringify(products), 'utf-8', (err) => {
        if (err) {
            console.error('Error updating products data:', err);
        } else {
            console.log('Products data has been updated!');
        }
    });

    // Remove user information in temp_user
    delete temp_user['email'];
    delete temp_user['name'];

    response.redirect('/products.html?');
})

// Redirect user back to products.html
app.post('/continue_shopping', function(request, response) {
    let params = new URLSearchParams(temp_user);
    response.redirect(`/products.html?${params.toString()}`);
})

let registration_errors = {};

// Handle the registration process when the form is submitted
app.post('/process_register', function(request, response) {
    let reg_name = request.body.name;
    let reg_email = request.body.email.toLowerCase();
    let reg_password = request.body.password;
    let reg_confirm_passwaord = request.body.confirm_password;

    validateConfirmPassword(reg_confirm_passwaord, reg_password);

    // Server response based on registration validation
    if (Object.keys(registration_errors).length == 0) {
        user_data[reg_email] = {};
        user_data[reg_email].name = reg_name;
        user_data[reg_email].password = reg_password;

        // Asynchronously write the updated user_data and products to their respective files
        fs.writeFile(__dirname + '/user_data.json', JSON.stringify(user_data), 'utf-8', (err) => {
            if (err) {
                console.error('Error updating user data:', err);
            } else {
                console.log('User data has been updated!');
                temp_user['name'] = reg_name;
                temp_user['email'] = reg_email;

                let params = new URLSearchParams(temp_user);
                response.redirect(`/invoice.html?regSuccess&valid&${params.toString()}`);
            }
        });
    }

    else {
        delete request.body.password;
        delete request.body.confirm_password;

        let params = new URLSearchParams(request.body);
        response.redirect(`/register.html?${params.toString()}&${qs.stringify(registration_errors)}`);
    }
})

// Function to validate the confirmation password during registration
function validateConfirmPassword(confirm_password, password) {
    delete registration_errors['confirm_password_type'];

    if (confirm_password !== password) {
        registration_errors['confirm_password_type'] = 'Passwords do not match.';
    }
}
