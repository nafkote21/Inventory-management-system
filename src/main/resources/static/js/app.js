// app.js
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadUser();
    if (currentUser) {
        setupFormListeners();
        initDashboard();
    } else {
        window.location.href = '/login.html';
    }
});

function setupFormListeners() {

    // ── Request form ──────────────────────────────────────────────────────────
    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
        requestForm.onsubmit = async (e) => {
            e.preventDefault();
            const submitBtn = e.target.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            const payload = {
                itemId:   parseInt(document.getElementById('request-item-id').value),
                quantity: parseInt(document.getElementById('request-quantity').value),
                reason:   document.getElementById('request-reason').value
            };
            try {
                const res = await fetch('/api/requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert('Request Submitted!');
                    closeModal('modal-request');
                    initDashboard();
                    requestForm.reset();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to submit request'));
                }
            } catch (err) {
                console.error('Submission error', err);
                alert('Failed to connect to server.');
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        };
    }

    // ── User form ─────────────────────────────────────────────────────────────
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.onsubmit = async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('user-save-btn');
            if (saveBtn) saveBtn.disabled = true;

            const editId   = document.getElementById('user-edit-id').value;
            const isEdit   = editId !== '';
            const deptId   = document.getElementById('user-department-input').value;
            const password = document.getElementById('user-password-input').value;

            const payload = {
                name:       document.getElementById('user-name-input').value.trim(),
                email:      document.getElementById('user-email-input').value.trim(),
                role:       document.getElementById('user-role-input').value,
                department: deptId ? { id: parseInt(deptId) } : null
            };
            if (password) payload.password = password;

            try {
                const url    = isEdit ? `/api/users/${editId}` : '/api/users';
                const method = isEdit ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert(isEdit ? 'User updated successfully!' : 'User created successfully!');
                    closeModal('modal-user');
                    userForm.reset();
                    loadUsers();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to save user'));
                }
            } catch (err) {
                console.error('User save error', err);
                alert('Failed to connect to server.');
            } finally {
                if (saveBtn) saveBtn.disabled = false;
            }
        };
    }

    // ── Item form ─────────────────────────────────────────────────────────────
    const itemForm = document.getElementById('itemForm');
    if (itemForm) {
        itemForm.onsubmit = async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('item-save-btn');
            if (saveBtn) saveBtn.disabled = true;

            const editId = document.getElementById('item-edit-id').value;
            const isEdit = editId !== '';

            const payload = {
                name:         document.getElementById('item-name-input').value.trim(),
                category:     document.getElementById('item-category-input').value.trim(),
                quantity:     parseInt(document.getElementById('item-quantity-input').value),
                reorderLevel: parseInt(document.getElementById('item-reorder-input').value),
                description:  document.getElementById('item-description-input').value.trim()
            };

            try {
                const url    = isEdit ? `/api/inventory/${editId}` : '/api/inventory';
                const method = isEdit ? 'PUT' : 'POST';
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert(isEdit ? 'Item updated successfully!' : 'Item added successfully!');
                    closeModal('modal-item');
                    itemForm.reset();
                    loadInventory();
                } else {
                    const err = await res.json().catch(() => ({}));
                    alert('Error: ' + (err.message || 'Failed to save item'));
                }
            } catch (err) {
                console.error('Item save error', err);
                alert('Failed to connect to server.');
            } finally {
                if (saveBtn) saveBtn.disabled = false;
            }
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth & Layout
// ─────────────────────────────────────────────────────────────────────────────

async function loadUser() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            currentUser = await response.json();
            if (!currentUser) return;
            document.getElementById('user-name').innerText = currentUser.fullName;
            document.getElementById('user-role-badge').innerText = currentUser.role.toUpperCase().replace('_', ' ');

            if (currentUser.role === 'admin') {
                document.getElementById('nav-users').style.display = 'block';
                document.getElementById('nav-all-requests').style.display = 'block';
                document.getElementById('nav-reports').style.display = 'block';
                document.getElementById('btn-add-item').style.display = 'block';
            }
            if (['storekeeper', 'inventory_officer'].includes(currentUser.role)) {
                document.getElementById('nav-reports').style.display = 'block';
            }
        }
    } catch (e) {
        console.error('Auth check failed', e);
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById('section-' + sectionId).style.display = 'block';
    document.getElementById('section-title').innerText = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (typeof event !== 'undefined' && event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    if (sectionId === 'inventory')     loadInventory();
    if (sectionId === 'users')         loadUsers();
    if (sectionId === 'all-requests')  loadAllRequests();
    if (sectionId === 'notifications') loadNotifications();
    if (sectionId === 'reports')       loadReports();
    if (sectionId === 'overview')      initDashboard();
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard / Stats
// ─────────────────────────────────────────────────────────────────────────────

async function initDashboard() {
    try {
        await renderRoleWidgets();
        await loadStats();
        await loadRequests();
    } catch (err) {
        console.error('Dashboard init failed', err);
    }
}

async function renderRoleWidgets() {
    const container = document.getElementById('role-widgets');
    container.innerHTML = '';

    if (currentUser.role === 'instructor') {
        container.innerHTML = `
            <div class="widget-card">
                <h3>Quick Actions</h3>
                <button class="quick-action-btn" onclick="openRequestModal()">
                    <i class="fas fa-plus"></i> Request New Item
                </button>
            </div>`;
    } else if (currentUser.role === 'dept_head') {
        const reqs = await (await fetch('/api/requests')).json();
        const pending = reqs.filter(r => r.status === 'PENDING_DH_APPROVAL').length;
        container.innerHTML = `
            <div class="widget-card">
                <h3>Pending Approvals <span class="badge-count">${pending}</span></h3>
                <p>Requests waiting for your review.</p>
            </div>`;
    } else if (currentUser.role === 'inventory_officer') {
        container.innerHTML = `
            <div class="widget-card">
                <h3>Stock Verification</h3>
                <p>Check and verify stock for approved requests.</p>
            </div>`;
    } else if (currentUser.role === 'storekeeper') {
        const inv = await (await fetch('/api/inventory')).json();
        const lowStock = inv.filter(i => i.quantity <= i.reorderLevel).length;
        container.innerHTML = `
            <div class="widget-card low-stock-alert">
                <h3>Low Stock Alerts <span class="badge-count">${lowStock}</span></h3>
                <div id="widget-low-stock-list"></div>
            </div>`;
        const list = document.getElementById('widget-low-stock-list');
        inv.filter(i => i.quantity <= i.reorderLevel).slice(0, 3).forEach(i => {
            list.innerHTML += `<div class="low-stock-item"><span>${i.name}</span> <b>${i.quantity} left</b></div>`;
        });
    } else if (currentUser.role === 'admin') {
        container.innerHTML = `
            <div class="widget-card">
                <h3>System Overview</h3>
                <button class="quick-action-btn" onclick="showSection('users')">Manage Users</button>
                <button class="quick-action-btn" onclick="showSection('inventory')">Manage Inventory</button>
            </div>`;
    }
}

async function loadStats() {
    const items = await (await fetch('/api/inventory')).json();
    document.getElementById('stat-total-items').innerText = items.length;

    const lowStockCount = items.filter(i => i.quantity <= i.reorderLevel).length;
    document.getElementById('stat-low-stock').innerText = lowStockCount;
    if (lowStockCount > 0 && ['storekeeper', 'admin', 'inventory_officer'].includes(currentUser.role)) {
        document.getElementById('card-low-stock').style.display = 'flex';
    }

    const requests = await (await fetch('/api/requests')).json();
    let activeCount = 0;
    if (currentUser.role === 'instructor') {
        activeCount = requests.filter(r => r.user.email === currentUser.email && r.status !== 'ISSUED' && r.status !== 'RETURNED').length;
    } else {
        activeCount = requests.filter(r => r.status.includes('PENDING') || r.status.includes('APPROVED')).length;
    }
    document.getElementById('stat-pending-requests').innerText = activeCount;
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventory
// ─────────────────────────────────────────────────────────────────────────────

async function loadInventory() {
    const items = await (await fetch('/api/inventory')).json();
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#999; padding:1.5rem;">No items in inventory.</td></tr>';
        return;
    }
    items.forEach(item => {
        const isLow = item.quantity <= item.reorderLevel;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td style="color:${isLow ? '#e74c3c' : 'inherit'}; font-weight:${isLow ? 'bold' : 'normal'}">
                ${item.quantity}
            </td>
            <td>${item.reorderLevel}</td>
            <td>
                ${['admin', 'inventory_officer'].includes(currentUser.role)
                    ? `<button class="btn-primary" style="padding:0.3rem 0.7rem; font-size:0.8rem;" onclick="editItem(${item.id})">Edit</button>`
                    : '-'}
            </td>`;
        tbody.appendChild(tr);
    });
}

function openItemModal() {
    document.getElementById('item-modal-title').innerText = 'Add New Item';
    document.getElementById('item-edit-id').value = '';
    document.getElementById('item-name-input').value = '';
    document.getElementById('item-category-input').value = '';
    document.getElementById('item-quantity-input').value = '';
    document.getElementById('item-reorder-input').value = '';
    document.getElementById('item-description-input').value = '';
    document.getElementById('modal-item').style.display = 'flex';
}

async function editItem(id) {
    try {
        const items = await (await fetch('/api/inventory')).json();
        const item  = items.find(i => i.id === id);
        if (!item) return;

        document.getElementById('item-modal-title').innerText = 'Edit Item';
        document.getElementById('item-edit-id').value = item.id;
        document.getElementById('item-name-input').value = item.name || '';
        document.getElementById('item-category-input').value = item.category || '';
        document.getElementById('item-quantity-input').value = item.quantity;
        document.getElementById('item-reorder-input').value = item.reorderLevel;
        document.getElementById('item-description-input').value = item.description || '';
        document.getElementById('modal-item').style.display = 'flex';
    } catch (err) {
        console.error('editItem error', err);
        alert('Failed to load item data.');
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Requests
// ─────────────────────────────────────────────────────────────────────────────

async function loadRequests() {
    const response = await fetch('/api/requests');
    let requests = await response.json();
    if (currentUser.role === 'instructor') {
        requests = requests.filter(r => r.user.email === currentUser.email);
    }
    const tbody = document.querySelector('#requests-table tbody');
    tbody.innerHTML = '';
    requests.forEach(req => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.item.name}</td>
            <td>${req.quantity}</td>
            <td><span class="status-badge status-${req.status.toLowerCase()}">${req.status.replace(/_/g, ' ')}</span></td>
            <td>${new Date(req.createdAt).toLocaleDateString()}</td>
            <td>${getActionButtons(req)}</td>`;
        tbody.appendChild(tr);
    });
}

async function loadAllRequests() {
    const requests = await (await fetch('/api/requests')).json();
    const tbody = document.querySelector('#admin-requests-table tbody');
    tbody.innerHTML = '';
    requests.forEach(req => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${req.id}</td>
            <td>${req.item.name}</td>
            <td>${req.quantity}</td>
            <td>${req.user.name}</td>
            <td><span class="status-badge status-${req.status.toLowerCase()}">${req.status.replace(/_/g, ' ')}</span></td>
            <td>${new Date(req.createdAt).toLocaleDateString()}</td>`;
        tbody.appendChild(tr);
    });
}

function getActionButtons(req) {
    const role   = currentUser.role;
    const status = req.status;
    if (role === 'dept_head' && status === 'PENDING_DH_APPROVAL') return `
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem;" onclick="handleAction(${req.id},'APPROVED_BY_DH')">Approve</button>
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:red;" onclick="handleAction(${req.id},'REJECTED')">Reject</button>`;
    if (role === 'inventory_officer' && status === 'APPROVED_BY_DH') return `
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem;" onclick="handleAction(${req.id},'APPROVED_FOR_ISSUANCE')">Verify</button>
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:red;" onclick="handleAction(${req.id},'REJECTED_STOCK')">Unavailable</button>`;
    if (role === 'storekeeper' && status === 'APPROVED_FOR_ISSUANCE') return `
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:green;" onclick="issueItem(${req.id})">Issue</button>
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:var(--secondary-color);" onclick="notifyPickup(${req.id})">Notify</button>`;
    if (role === 'instructor' && status === 'ISSUED') return `
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:orange;" onclick="initiateReturn(${req.id})">Return</button>`;
    if (role === 'storekeeper' && status === 'RETURN_PENDING') return `
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem;" onclick="processReturn(${req.id},'RETURNED')">Good</button>
        <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:orange;" onclick="processReturn(${req.id},'DAMAGED')">Damaged</button>`;
    return '-';
}

async function handleAction(requestId, status) {
    const comment = prompt('Enter optional comment:');
    const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment })
    });
    if (res.ok) { alert('Action completed: ' + status); initDashboard(); }
}

async function issueItem(requestId) {
    const res = await fetch(`/api/issuances/${requestId}`, { method: 'POST' });
    if (res.ok) { alert('Items Issued Successfully!'); initDashboard(); }
    else { const err = await res.json(); alert('Error: ' + (err.message || 'Failed to issue items')); }
}

async function notifyPickup(requestId) {
    const res = await fetch(`/api/issuances/${requestId}/notify-pickup`, { method: 'POST' });
    if (res.ok) alert('Pickup notification sent!');
}

async function initiateReturn(requestId) {
    const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RETURN_PENDING', comment: 'User initiated return' })
    });
    if (res.ok) { alert('Return request submitted.'); initDashboard(); }
}

async function processReturn(requestId, outcome) {
    const res = await fetch(`/api/issuances/${requestId}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome, notes: 'Storekeeper verification' })
    });
    if (res.ok) { alert('Return processed: ' + outcome); initDashboard(); }
}

function openRequestModal() {
    fetch('/api/inventory')
        .then(res => res.json())
        .then(items => {
            const select = document.getElementById('request-item-id');
            select.innerHTML = items.map(i => `<option value="${i.id}">${i.name} (${i.quantity} available)</option>`).join('');
            document.getElementById('modal-request').style.display = 'flex';
        });
}

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

async function loadUsers() {
    try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error('Failed to load users');
        const users = await res.json();
        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = '';
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999; padding:1.5rem;">No users found.</td></tr>';
            return;
        }
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="status-badge status-issued" style="text-transform:capitalize; font-size:0.75rem;">${u.role.replace(/_/g, ' ')}</span></td>
                <td>${u.department ? u.department.name : '-'}</td>
                <td style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                    <button class="btn-primary" style="padding:0.3rem 0.8rem; font-size:0.8rem;" onclick="editUser(${u.id})">Edit</button>
                    <button class="btn-primary" style="padding:0.3rem 0.8rem; font-size:0.8rem; background:#e74c3c;" onclick="deleteUser(${u.id}, '${u.name.replace(/'/g, "\\'")}')">Delete</button>
                </td>`;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('loadUsers error', err);
        alert('Failed to load users.');
    }
}

async function openUserModal() {
    document.getElementById('user-modal-title').innerText = 'Add New User';
    document.getElementById('user-edit-id').value = '';
    document.getElementById('user-name-input').value = '';
    document.getElementById('user-email-input').value = '';
    document.getElementById('user-password-input').value = '';
    document.getElementById('user-role-input').value = '';
    document.getElementById('user-password-label').innerText = 'Password *';
    document.getElementById('user-password-input').required = true;
    await populateDepartmentDropdown(null);
    document.getElementById('modal-user').style.display = 'flex';
}

async function editUser(id) {
    try {
        const res = await fetch(`/api/users/${id}`);
        if (!res.ok) throw new Error('Could not fetch user');
        const u = await res.json();
        document.getElementById('user-modal-title').innerText = 'Edit User';
        document.getElementById('user-edit-id').value = u.id;
        document.getElementById('user-name-input').value = u.name || '';
        document.getElementById('user-email-input').value = u.email || '';
        document.getElementById('user-password-input').value = '';
        document.getElementById('user-role-input').value = u.role || '';
        document.getElementById('user-password-label').innerText = 'Password (leave blank to keep current)';
        document.getElementById('user-password-input').required = false;
        await populateDepartmentDropdown(u.department ? u.department.id : null);
        document.getElementById('modal-user').style.display = 'flex';
    } catch (err) {
        console.error('editUser error', err);
        alert('Failed to load user data. Please try again.');
    }
}

async function deleteUser(id, name) {
    if (!confirm(`Are you sure you want to delete user "${name}"?\nThis action cannot be undone.`)) return;
    try {
        const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (res.ok) { alert(`User "${name}" has been deleted.`); loadUsers(); }
        else alert('Failed to delete user.');
    } catch (err) {
        console.error('deleteUser error', err);
        alert('Failed to connect to server.');
    }
}

async function populateDepartmentDropdown(selectedDeptId) {
    const select = document.getElementById('user-department-input');
    select.innerHTML = '<option value="">-- No Department --</option>';
    try {
        const res = await fetch('/api/departments');
        if (!res.ok) return;
        const departments = await res.json();
        departments.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.name;
            if (selectedDeptId && d.id === selectedDeptId) opt.selected = true;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Could not load departments', err);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────────────────────

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

async function loadNotifications() {
    const res = await fetch('/api/notifications');
    const notifs = await res.json();
    const list = document.getElementById('notifications-list');
    list.innerHTML = notifs.map(n => `
        <div style="background:white; padding:1rem; border-radius:8px; margin-bottom:0.5rem; border-left:4px solid var(--primary-color); box-shadow:var(--shadow);">
            <p>${n.message}</p>
            <small style="color:#999;">${new Date(n.createdAt).toLocaleString()}</small>
        </div>`).join('') || '<p>No notifications yet.</p>';
}

async function loadReports() {
    try {
        const stockData = await (await fetch('/api/reports/stock')).json();
        const reqData   = await (await fetch('/api/reports/requests')).json();

        document.getElementById('report-total-items').innerText    = stockData.totalItems;
        document.getElementById('report-low-stock').innerText      = stockData.lowStockCount;
        document.getElementById('report-total-requests').innerText = reqData.totalRequests;

        const statusList = document.getElementById('report-status-list');
        statusList.innerHTML = '';
        for (const [status, count] of Object.entries(reqData.statusCounts)) {
            const pct = reqData.totalRequests > 0 ? (count / reqData.totalRequests * 100).toFixed(0) : 0;
            statusList.innerHTML += `
                <div style="margin-bottom:0.8rem;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>${status.replace(/_/g, ' ')}</span>
                        <span><b>${count}</b> (${pct}%)</span>
                    </div>
                    <div style="width:100%; background:#eee; height:8px; border-radius:4px; overflow:hidden;">
                        <div style="width:${pct}%; background:var(--primary-color); height:100%;"></div>
                    </div>
                </div>`;
        }

        const healthMsg = document.getElementById('stock-health-msg');
        healthMsg.innerHTML = stockData.lowStockCount === 0
            ? '<span style="color:green; font-weight:bold;">Excellent</span> - All items are healthy.'
            : `<span style="color:red; font-weight:bold;">Attention</span> - ${stockData.lowStockCount} items are low on stock.`;

        const tbody = document.querySelector('#report-inventory-table tbody');
        tbody.innerHTML = '';
        stockData.items.forEach(item => {
            const isLow = item.quantity <= item.reorderLevel;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity} / ${item.reorderLevel}</td>
                <td><span class="status-badge ${isLow ? 'status-rejected' : 'status-approved'}">${isLow ? 'LOW' : 'OK'}</span></td>`;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Failed to load reports', err);
    }
}