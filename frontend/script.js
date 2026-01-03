const API_BASE = 'http://localhost:5000/api/books';

function showMessage(msg, type = 'error') {
  const el = document.getElementById('message');
  el.textContent = msg;
  el.className = type; // 'error' or 'success'
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (el.textContent === msg) el.textContent = '';
  }, 5000);
}

async function fetchData(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request failed');
    }
    return await res.json();
  } catch (err) {
    showMessage(err.message);
    throw err;
  }
}

function renderBooks(books) {
  const container = document.getElementById('books');
  if (!Array.isArray(books)) {
    container.innerHTML = '<p>No books to display.</p>';
    return;
  }
  container.innerHTML = books.map(b => `
    <div class="card">
      <strong>${b.title}</strong> by ${b.author}<br/>
      Category: ${b.category} | Year: ${b.publishedYear} | Copies: ${b.availableCopies}
      <small>ID: ${b._id}</small>
    </div>
  `).join('');
}

// 🌱 Seed 7 Books
async function seedBooks() {
  const books = [
    { title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", publishedYear: 1937, availableCopies: 5 },
    { title: "1984", author: "George Orwell", category: "Dystopian", publishedYear: 1949, availableCopies: 3 },
    { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", publishedYear: 1960, availableCopies: 4 },
    { title: "The Martian", author: "Andy Weir", category: "Sci-Fi", publishedYear: 2011, availableCopies: 6 },
    { title: "Becoming", author: "Michelle Obama", category: "Biography", publishedYear: 2018, availableCopies: 2 },
    { title: "Project Hail Mary", author: "Andy Weir", category: "Sci-Fi", publishedYear: 2021, availableCopies: 7 },
    { title: "Atomic Habits", author: "James Clear", category: "Self-Help", publishedYear: 2018, availableCopies: 0 }
  ];
  try {
    await fetchData(`${API_BASE}/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(books)
    });
    showMessage('✅ 7 books seeded!', 'success');
    fetchAll();
  } catch (e) {
    showMessage(e.message);
  }
}

// 📚 Fetch All
async function fetchAll() {
  try {
    const books = await fetchData(API_BASE);
    renderBooks(books);
  } catch (e) { /* handled in fetchData */ }
}

// 📅 After 2015
async function fetchAfter2015() {
  try {
    const books = await fetchData(`${API_BASE}/after-2015`);
    renderBooks(books);
  } catch (e) { /* handled */ }
}

// 🔍 By Category
async function fetchByCategory() {
  const cat = document.getElementById('categoryInput').value.trim();
  if (!cat) return showMessage('Enter a category');
  try {
    const books = await fetchData(`${API_BASE}/category/${cat}`);
    renderBooks(books);
  } catch (e) { /* handled */ }
}

// 🔄 Update Copies
async function updateCopies() {
  const id = document.getElementById('bookIdCopies').value;
  const change = parseInt(document.getElementById('copyChange').value);
  if (!id || isNaN(change)) return showMessage('Invalid ID or change value');
  try {
    const book = await fetchData(`${API_BASE}/${id}/copies`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ change })
    });
    showMessage('✅ Copies updated!', 'success');
    fetchAll();
  } catch (e) { /* handled */ }
}

// 🏷️ Update Category
async function updateCategory() {
  const id = document.getElementById('bookIdCat').value;
  const cat = document.getElementById('newCategory').value.trim();
  if (!id || !cat) return showMessage('Provide ID and new category');
  try {
    const book = await fetchData(`${API_BASE}/${id}/category`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: cat })
    });
    showMessage('✅ Category updated!', 'success');
    fetchAll();
  } catch (e) { /* handled */ }
}

// 🗑️ Delete Book
async function deleteBook() {
  const id = document.getElementById('bookIdDelete').value;
  if (!id) return showMessage('Enter Book ID');
  try {
    await fetchData(`${API_BASE}/${id}`, { method: 'DELETE' });
    showMessage('✅ Book deleted!', 'success');
    fetchAll();
  } catch (e) { /* handled */ }
}