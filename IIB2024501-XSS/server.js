const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// In-memory "database" to store tasks as objects: { id, text }
let todos = [];

function escapeHtml(value) {
    const entities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };

    return String(value).replace(/[&<>"']/g, char => entities[char]);
}

// Middleware to parse URL-encoded bodies (from HTML forms and fetch requests)
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS) from the public directory
app.use(express.static('public'));

// Route to serve the background image
app.get('/bg.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, '4210690.jpg'));
});

// Route to serve the inner container background image
app.get('/inner-bg.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'pngtree-wooden-desk-with-todo-list-written-on-notepad-photo-image_37971672.jpg'));
});

// The root route renders the vulnerable HTML
app.get('/', (req, res) => {
    // VULNERABILITY: We are iterating through the stored tasks and directly interpolating 
    // the 'text' property into the HTML string without any sanitization or encoding.
    let todosHtml = todos.map(t => `
        <div class="todo-item" onclick="completeTask(this, '${t.id}')" style="cursor: pointer;">
            <div class="checkbox"></div>
            <div class="todo-content">
              ${t.text}
              
            </div>
        </div>
    `).join('');
    
    if (todosHtml === '') {
        todosHtml = '<p class="no-todos">All caught up! Add a task above.</p>';
    }

    // Read index.html and inject the vulnerable HTML
    const templatePath = path.join(__dirname, 'views', 'index.html');
    fs.readFile(templatePath, 'utf8', (err, htmlData) => {
        if (err) {
            return res.status(500).send("Error reading HTML template");
        }
        
        // Injecting the raw user input directly into the HTML without sanitization!
        const finalHtml = htmlData.replace('{{TODOS_HTML}}', todosHtml);
        res.send(finalHtml);
    });
});

// Route to clear all tasks
app.post('/clear-todos', (req, res) => {
    todos = [];
    res.redirect('/');
});

// Route to delete a single task by ID
app.post('/delete-todo', (req, res) => {
    const idToDelete = req.body.id;
    todos = todos.filter(t => t.id !== idToDelete);
    res.sendStatus(200);
});

// Route to handle adding new tasks
app.post('/add-todo', (req, res) => {
    const newTodo = req.body.todo;

    // In a secure application, input would be sanitized here before saving.
    // We are skipping sanitization to deliberately allow Stored XSS.
    if (newTodo && newTodo.trim() !== '') {
        todos.push({
            id: Date.now().toString() + Math.random().toString(),
            text: newTodo
        });
    }

    // Redirect back to the main page to display the updated list
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Vulnerable Todo app listening at http://localhost:${port}`);
});