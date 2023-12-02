// Read URL parameters for processing redirects
let params = (new URL(document.location)).searchParams;

// When the window loads, perform the following function
window.onload = function() {
    // Check if 'loginErr' is present in the URL parameters, indicating a login error
    if (params.has('loginErr')) {
        // Display the login error message in the 'errMsg' element
        document.getElementById('errMsg').innerHTML = params.get('loginErr');
    }

    // Set the value of the 'email' input field to the corresponding parameter value from the URL
    document.getElementById('email').value = params.get('email');
}
