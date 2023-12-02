// Get the URL parameters
let params = (new URL(document.location)).searchParams;

// Execute when the window loads
window.onload = function() {
    // Display an error message if 'error' parameter is present in the URL
    if (params.has('error')) {
        document.getElementById('errMsg').innerHTML = "No quantities selected.";
        setTimeout(() => {
            document.getElementById('errMsg').innerHTML = "";
        }, 2000);
    } 
    // Display an error message and validate quantities if 'inputErr' parameter is present in the URL
    else if (params.has('inputErr')) {
        document.getElementById('errMsg').innerHTML = "Please fix errors before proceeding.";
        setTimeout(() => {
            document.getElementById('errMsg').innerHTML = "";
        }, 2000);

        // Loop through the products and validate quantities
        for (let i in products) {
            let qtyInput = qty_form[`qty${[i]}_entered`];
            let qtyError = document.getElementById(`qty${[i]}_error`);

            // Set the value from URL parameters
            if (params.get(`qty${i}`) !== null) {
                qtyInput.value = params.get(`qty${i}`);
            }

            // Validate the quantity and display errors
            let errorMessages = validateQuantity(qtyInput.value, products[i].qty_available);
            if (errorMessages.length > 0) {
                qtyError.innerHTML = errorMessages.join('<br>');
                qtyInput.parentElement.style.borderColor = "red";
            } else {
                qtyError.innerHTML = "";
                qtyInput.parentElement.style.borderColor = "black";
            }
        }
    }

    // Set quantities if 'name' parameter is present in the URL
    if (params.has('name')) {
        for (let i in products) {
            qty_form[`qty${[i]}`].value = params.get(`qty${[i]}`);
        }
    }
}

// Dynamically populate the product cards in the DOM
for (let i = 0; i < products.length; i++) {
    document.querySelector('.row').innerHTML += `
        <div class="col-md-6 product_card" style="margin-bottom: 40px; padding: 15px;">
            <!-- Product details -->
            <div>
                <h5 style="float: center;" class="product_name">${products[i].name}</h5>
                <h5 style="float: center;">$${(products[i].price).toFixed(2)}</h5>
            </div>  
            <!-- Product image -->
            <img src="${products[i].image}" style="width: 60%" class="img-thumbnail" alt="${products[i].alt}">
            <div style="height: 90px;">
                <!-- Quantity table -->
                <table style="width: 100%; text-align: center; font-size: 18px;" id="product_table">
                    <tr>
                        <!-- Display available quantity for the product -->
                        <td style="text-align: center; width: 35%;">Available: ${products[i].qty_available}</td>

                        <!-- Input field for quantity and buttons to increase/decrease -->
                        <td style="text-align: center; width: 35%;" rowspan="2">
                            <div style="border-radius: 50px; border: 2px solid black; width: 70%; height: 40px; float: center;">
                                <!-- Decrease quantity button with an onclick event -->
                                <button type="button" class="qtyButton highlight" onclick="document.getElementById('qty${[i]}_entered').value--; checkInputTextbox(document.getElementById('qty${[i]}_entered'), ${products[i].qty_available});">--</button>

                                <!-- Input field for quantity with onkeyup event -->
                                <input type="text" autocomplete="off" placeholder="0" name="qty${[i]}" id="qty${[i]}_entered" class="inputBox" onkeyup="checkInputTextbox(this,${products[i].qty_available})">

                                <!-- Increase quantity button with an onclick event -->
                                <button type="button" class="qtyButton highlight" onclick="document.getElementById('qty${[i]}_entered').value++; checkInputTextbox(document.getElementById('qty${[i]}_entered'), ${products[i].qty_available});">+</button>
                            </div>

                            <!-- Label for quantity -->
                            <label id="qty${[i]}_label" style="margin: 6px 0; float: center; padding-right: 10px;">Qty:</label>
                        </td>
                    </tr>
                    <tr>
                        <!-- Display sold quantity for the product -->
                        <td style="text-align: center; width: 35%;" id="qty_sold${i}">Sold: ${products[i].qty_sold}</td>
                    </tr>
                    <tr>
                        <!-- Error message for quantity validation -->
                        <td colspan="3" style="padding-top: 5px;"><div id="qty${[i]}_error" style="color: red;"></div></td>
                    </tr>
                </table>
            </div>  
        </div>
    `;
}

// Validate quantity function
function validateQuantity(quantity, availableQuantity) {
    let errors = [];

    // Convert quantity to a number
    quantity = Number(quantity);

    switch (true) {
        case (isNaN(quantity)) && (quantity != ''):
            errors.push("Not a number. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0 && !Number.isInteger(quantity):
            errors.push("Negative inventory and not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity < 0:
            errors.push("Negative inventory. Please enter a non-negative quantity to order.");
            break;
        case quantity !=0 && !Number.isInteger(quantity):
            errors.push("Not an Integer. Please enter a non-negative quantity to order.");
            break;
        case quantity > availableQuantity:
            errors.push(`We do not have ${quantity} available.`);
            break;
    }

    return errors;
}

// Check input textbox against data validation function
function checkInputTextbox(textBox, availableQuantity) {
    let str = String(textBox.value);

    // Check if the first character is '0' and remove it if found
    if (str.charAt(0) == '0') {
        textBox.value = Number(str.slice(0, 0) + str.slice(1, str.length));
    }

    // Convert the input value to a number
    let inputValue = Number(textBox.value);

    // Validate the user input quantity using the updated validateQuantity function
    let errorMessages = validateQuantity(inputValue, availableQuantity);

    // Check if there are any error messages and update the display
    let errorDisplay = document.getElementById(textBox.name + '_error');
    if (errorMessages.length > 0) {
        errorDisplay.innerHTML = errorMessages.join('<br>');
        errorDisplay.style.color = "red";
        textBox.parentElement.style.borderColor = "red";
    } else {
        errorDisplay.innerHTML = "";
        textBox.parentElement.style.borderColor = "black";
    }
}

// Make the navbar sticky on scroll
window.onscroll = function() {stickyNav()};

let navbar = document.getElementById("sticky-navbar");
let sticky = navbar.offsetTop;

function stickyNav() {
    if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky")
    } else {
        navbar.classList.remove("sticky");
    }
}
