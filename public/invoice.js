let params = (new URL(document.location)).searchParams;

window.onload = function() {
    // If the form submission is not valid, display an error message
    if (!params.has('valid')) {
        document.write(`
            <head>
                <link rel="stylesheet" href="syle.css">
            </head>
            <body style="text-align: center; margin-top: 10%;">
                <h2>ERROR: No form submission detected.</h2>
                <h4>Return to <a href="index.html">Home</a></h4> 
            </body>
        `);
    } else {
        // Display a personalized thank you message
        document.getElementById('helloMsg').innerHTML = `Thank you ${params.get('name')}! May your victories be as epic as your choice in weaponry!`;
    }
}

// Calculate subtotal and create invoice table rows
let subtotal = 0;
let qty = [];

for (let i in products) {
    qty.push(params.get(`qty${i}`));
}

for (let i in qty) {
    // Skip products with zero or empty quantity
    if (qty[i] == 0 || qty[i] == '') continue;

    // Calculate extended price and update subtotal
    extended_price = (params.get(`qty${i}`) * products[i].price).toFixed(2);
    subtotal += Number(extended_price);

    // Append table row for each product
    document.querySelector('#invoice_table').innerHTML += `
        <tr style="border: none;">
            <td width="10%"><img src="${products[i].image}" alt="${products[i].alt}" style="border-radius: 5px;"></td>
            <td>${products[i].name}</td>
            <td>${qty[i]}</td>
            <td>${products[i].qty_available}</td>
            <td>$${products[i].price.toFixed(2)}</td>
            <td>$${extended_price}</td>
        </tr>
    `;
}

// Calculate tax rate and amount
let tax_rate = (4.7/100);
let tax_amt = subtotal * tax_rate;

// Calculate shipping and total based on subtotal
let shipping, shipping_display, total;

if (subtotal < 300) {
    shipping = 5;
    shipping_display = `$${shipping.toFixed(2)}`;
    total = Number(tax_amt + subtotal + shipping);
}
else if (subtotal >= 300 && subtotal < 500) {
    shipping = 10;
    shipping_display = `$${shipping.toFixed(2)}`;
    total = Number(tax_amt + subtotal + shipping);
}
else {
    shipping = 0;
    shipping_display = 'FREE';
    total = Number(tax_amt + subtotal + shipping);
}

// Display subtotal, tax, shipping, and total in the invoice table
document.querySelector('#total_display').innerHTML += `
    <tr style="border-top: 2px solid black;">
        <td colspan="5" style="text-align:center;">Sub-total</td>
        <td>$${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="5" style="text-align:center;">Tax @ ${Number(tax_rate) * 100}%</td>
        <td>$${tax_amt.toFixed(2)}</td>
    </tr>
    <tr>
        <td colspan="5" style="text-align:center;">Shipping</td>
        <td>${shipping_display}</td>
    </tr>
    <tr>
        <td colspan="5" style="text-align:center;"><b>Total</td>
        <td><b>$${total.toFixed(2)}</td>
    </tr>
`;
