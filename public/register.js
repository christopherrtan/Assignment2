let params = (new URL(document.location)).searchParams;

// When the window loads, perfom the following function:
window.onload = function() {
    let register_form = document.forms['register_form'];

    // Get the values previously inputted and place them back into the input boxes
    register_form.elements['name'].value = params.get('name');
    register_form.elements['email'].value = params.get('email');

    // Get the error messages and display them accordingly
    for (let i = 0; i <= document.getElementsByClassName('form-group').length; i++) {
        let inputName = register_form.elements[i].name;

        if (params.has(`${inputName}_length`)) {
            document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_length`);

            if (params.has(`${inputName}_type`)) {
                document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_length`) + `<br>` + params.get(`${inputName}_type`);
            }
        } 
        else if (params.has(`${inputName}_type`)) {
            document.getElementById(`${inputName}_error`).innerHTML = params.get(`${inputName}_type`);
        }
    }            
}