// app.js
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadUser();
    if (currentUser) {
        initDashboard();
    } else {
        window.location.href = '/login.html';
    }
});

async function loadUser() {
    try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
            currentUser = await response.json();
            if (!currentUser) return;
            document.getElementById('user-name').innerText = currentUser.fullName;
            document.getElementById('user-role-badge').innerText = currentUser.role.toUpperCase().replace('_', ' ');
            
            // Sidebar logic
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
        console.error("Auth check failed", e);
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
    document.getElementById('section-' + sectionId).style.display = 'block';
    document.getElementById('section-title').innerText = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
    
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    if (sectionId === 'inventory') loadInventory();
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'all-requests') loadAllRequests();
    if (sectionId === 'notifications') loadNotifications();
    if (sectionId === 'overview') initDashboard();
}

async function initDashboard() {
    renderRoleWidgets();
    loadStats();
    loadRequests();
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
            </div>
        `;
    } else if (currentUser.role === 'dept_head') {
        const reqs = await (await fetch('/api/requests')).json();
        const pending = reqs.filter(r => r.status === 'PENDING_DH_APPROVAL').length;
        container.innerHTML = `
            <div class="widget-card">
                <h3>Pending Approvals <span class="badge-count">${pending}</span></h3>
                <p>Requests waiting for your review.</p>
            </div>
        `;
    } else if (currentUser.role === 'inventory_officer') {
        container.innerHTML = `
            <div class="widget-card">
                <h3>Stock Verification</h3>
                <p>Check and verify stock for approved requests.</p>
            </div>
        `;
    } else if (currentUser.role === 'storekeeper') {
        const inv = await (await fetch('/api/inventory')).json();
        const lowStock = inv.filter(i => i.quantity <= i.reorderLevel).length;
        container.innerHTML = `
            <div class="widget-card low-stock-alert">
                <h3>Low Stock Alerts <span class="badge-count">${lowStock}</span></h3>
                <div id="widget-low-stock-list"></div>
            </div>
        `;
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
            </div>
        `;
    }
}

async function loadStats() {
    const invRes = await fetch('/api/inventory');
    const items = await invRes.json();
    document.getElementById('stat-total-items').innerText = items.length;
    
    const lowStockCount = items.filter(i => i.quantity <= i.reorderLevel).length;
    document.getElementById('stat-low-stock').innerText = lowStockCount;
    if (lowStockCount > 0 && ['storekeeper', 'admin', 'inventory_officer'].includes(currentUser.role)) {
        document.getElementById('card-low-stock').style.display = 'flex';
    }

    const reqRes = await fetch('/api/requests');
    const requests = await reqRes.json();
    
    let activeCount = 0;
    if (currentUser.role === 'instructor') {
        activeCount = requests.filter(r => r.user.email === currentUser.email && r.status !== 'ISSUED' && r.status !== 'RETURNED').length;
    } else {
        activeCount = requests.filter(r => r.status.includes('PENDING') || r.status.includes('APPROVED')).length;
    }
    document.getElementById('stat-pending-requests').innerText = activeCount;
}

async function loadInventory() {
    const response = await fetch('/api/inventory');
    const items = await response.json();
    const tbody = document.querySelector('#inventory-table tbody');
    tbody.innerHTML = '';
    
    items.forEach(item => {
        const tr = document.createElement('tr');
        const isLow = item.quantity <= item.reorderLevel;
        tr.innerHTML = `
            <td>#${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td style="color: ${isLow ? 'red' : 'inherit'}; font-weight: ${isLow ? 'bold' : 'normal'}">
                ${item.quantity}
            </td>
            <td>${item.reorderLevel}</td>
            <td>
                ${['admin', 'inventory_officer'].includes(currentUser.role) ? `<button class="btn-primary" style="padding:0.3rem 0.6rem; font-size:0.8rem;" onclick="editItem(${item.id})">Edit</button>` : '-'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadRequests() {
    const response = await fetch('/api/requests');
    let requests = await response.json();
    
    // Filter based on role
    if (currentUser.role === 'instructor') {
        requests = requests.filter(r => r.user.email === currentUser.email);
    } else if (currentUser.role === 'dept_head') {
        // Only show requests for their department
        // Assuming we'll handle department filtering on backend or here
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
            <td>${getActionButtons(req)}</td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadAllRequests() {
    const response = await fetch('/api/requests');
    const requests = await response.json();
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
            <td>${new Date(req.createdAt).toLocaleDateString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

function getActionButtons(req) {
    const role = currentUser.role;
    const status = req.status;

    if (role === 'dept_head' && status === 'PENDING_DH_APPROVAL') {
        return `
            <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem;" onclick="handleAction(${req.id}, 'APPROVED_BY_DH')">Approve</button>
            <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:red;" onclick="handleAction(${req.id}, 'REJECTED')">Reject</button>
        `;
    }
    if (role === 'inventory_officer' && status === 'APPROVED_BY_DH') {
        return `
            <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem;" onclick="handleAction(${req.id}, 'APPROVED_FOR_ISSUANCE')">Verify</button>
            <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:red;" onclick="handleAction(${req.id}, 'REJECTED_STOCK')">Unavailable</button>
        `;
    }
    if (role === 'storekeeper' && status === 'APPROVED_FOR_ISSUANCE') {
        return `
            <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:green;" onclick="issueItem(${req.id})">Issue</button>
            <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:var(--secondary-color);" onclick="notifyPickup(${req.id})">Notify</button>
        `;
    }
    if (role === 'instructor' && status === 'ISSUED') {
        return `<button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:orange;" onclick="initiateReturn(${req.id})">Return</button>`;
    }
    if (role === 'storekeeper' && status === 'RETURN_PENDING') {
        return `
            <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem;" onclick="processReturn(${req.id}, 'RETURNED')">Good</button>
            <button class="btn-primary" style="padding:0.3rem; font-size:0.7rem; background:orange;" onclick="processReturn(${req.id}, 'DAMAGED')">Damaged</button>
        `;
    }
    return '-';
}

async function handleAction(requestId, status) {
    const comment = prompt("Enter optional comment:");
    const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comment })
    });
    if (res.ok) {
        alert("Action completed: " + status);
        initDashboard();
    }
}

async function issueItem(requestId) {
    const res = await fetch(`/api/issuances/${requestId}`, { method: 'POST' });
    if (res.ok) {
        alert("Items Issued Successfully!");
        initDashboard();
    } else {
        const err = await res.json();
        alert("Error: " + (err.message || "Failed to issue items"));
    }
}

async function notifyPickup(requestId) {
    const res = await fetch(`/api/issuances/${requestId}/notify-pickup`, { method: 'POST' });
    if (res.ok) {
        alert("Pickup notification sent!");
    }
}

async function initiateReturn(requestId) {
    const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RETURN_PENDING', comment: 'User initiated return' })
    });
    if (res.ok) {
        alert("Return request submitted.");
        initDashboard();
    }
}

async function processReturn(requestId, outcome) {
    // Need to find issuanceId from requestId
    // For simplicity, let's assume we can pass requestId or find it
    // Implementation of processReturn in IssuanceController needs issuanceId
    // Let's adjust IssuanceController or find the issuance here
    const res = await fetch(`/api/issuances/${requestId}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome, notes: 'Storekeeper verification' })
    });
    if (res.ok) {
        alert("Return processed: " + outcome);
        initDashboard();
    }
}

async function editItem(id) {
    const res = await fetch(`/api/inventory`);
    const items = await res.json();
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newName = prompt("Enter new name:", item.name);
    const newQty = prompt("Enter new quantity:", item.quantity);
    const newThreshold = prompt("Enter new reorder level:", item.reorderLevel);

    if (newName && newQty && newThreshold) {
        const res = await fetch(`/api/inventory/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...item,
                name: newName,
                quantity: parseInt(newQty),
                reorderLevel: parseInt(newThreshold)
            })
        });
        if (res.ok) {
            alert("Item updated!");
            loadInventory();
        }
    }
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

document.getElementById('requestForm').onsubmit = async (e) => {
    e.preventDefault();
    const payload = {
        itemId: document.getElementById('request-item-id').value,
        quantity: document.getElementById('request-quantity').value,
        reason: document.getElementById('request-reason').value
    };
    const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        alert("Request Submitted!");
        closeModal('modal-request');
        initDashboard();
    }
};

async function loadUsers() {
    const res = await fetch('/api/users');
    const users = await res.json();
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.department ? u.department.name : '-'}</td>
            <td>
                <button onclick="editUser(${u.id})">Edit</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

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
        </div>
    `).join('') || '<p>No notifications yet.</p>';
}