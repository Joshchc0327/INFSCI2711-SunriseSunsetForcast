const tableBody = document.getElementById('data-table').getElementsByTagName('tbody')[0];
fetch('/data')
    .then(response => response.json())
    .then(dataArray => {
        //console.log(dataArray); // This will show you what's actually being returned from the server.
        // Now you can check if dataArray is indeed an array and has items in it.
        if (Array.isArray(dataArray)) {
            dataArray.forEach(item => {
                let row = tableBody.insertRow();
                let cellId = row.insertCell();
                cellId.textContent = item._id;
                let cellName = row.insertCell();
                cellName.textContent = item.name;
                let cellEmail = row.insertCell();
                cellEmail.textContent = item.email;
            });
        } else {
            // Handle the case where dataArray is not an array
            console.error('Data received is not an array:', dataArray);
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        let row = tableBody.insertRow();
        let cellError = row.insertCell();
        cellError.colSpan = 3;
        cellError.textContent = 'Error loading data.';
    });

document.getElementById('dataForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value
    };

    fetch('/insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
        .then(response => {
            if (response.status === 409) {
                throw new Error('Email already exists');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
            // Refresh the page to reflect the changes
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert(error.message); // Alert the user if the email already exists
        });
});

document.addEventListener('DOMContentLoaded', function() {
    const table = document.getElementById('data-table');
    table.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('delete-btn')) {
            const row = e.target.closest('tr');
            table.deleteRow(row.rowIndex);
        }
    });
});
