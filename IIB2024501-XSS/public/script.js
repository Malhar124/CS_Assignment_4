// Function to visually strike out a task and delete it from the server
function completeTask(element, id) {
    // If already completed, do nothing
    if (element.classList.contains('completed')) return;
    
    // Add the 'completed' class to trigger CSS strikethrough and opacity changes
    element.classList.add('completed');
    
    // Send request to server to remove it from the database
    fetch('/delete-todo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'id=' + encodeURIComponent(id)
    }).catch(err => console.error('Error deleting task:', err));
}