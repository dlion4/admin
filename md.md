here is the pages layout used to build the paymo-ltd page to its completion now i want you to use the paymo-ltd page layout and structure to add customization and comprehensive admin-side permission added to every data and record and template and sections with data or records or text they need o be added, edited, deleted etc for absolute admin control for all the data on that page, leaving no dead-ends leaving no blank pages, no blank urls..adding extra modals whenever neccesary for that permission to be completed

paymo-ltd structure to check:
I'll analyze the paymo-ltd pages to create a comprehensive documentation template for admin permissions and modal structures. Let me start by exploring the directory structure.

Based on my analysis of the paymo-ltd pages, I'll create a comprehensive documentation template for admin permissions and modal structures that you can use for subsequent admin pages.

# **Admin Page Architecture & Permissions Documentation Template**

## **1. Page Structure Overview**

### **Header Section**
- **Company/Entity Identity**: Logo, name, registration details, status badges
- **Admin Action Bar**: 
  - Audit Trail button → Opens `ComplianceAuditModal`
  - Permissions button → Opens `AdminPermissionsDrawer` 
  - Export/Import button → Opens `DataExportImportModal`
  - Emergency button → Opens `EmergencyActionsModal`
  - Entity Profile button → Opens `CompanyProfileDrawer`
  - Communication button → Opens `ShareholderCommModal`

### **Key Metrics Strip**
- 6-8 metric cards with trend indicators
- Each card is clickable → Opens relevant detailed modal
- Metrics should be real-time data, not placeholders

### **Tabbed Navigation**
- 6-8 tabs organized by functional area
- Each tab follows consistent structure:
  1. Quick Stats Cards (clickable → modals)
  2. Main Data Table with admin controls
  3. Quick Actions Grid
  4. Add/Create buttons

---

## **2. Data Record Structure & Admin Permissions**

### **Every Data Record Must Include:**

#### **Display Fields**
- Primary identifier (name, ID, number)
- Secondary details (role, type, category)
- Status indicators (badges, progress bars)
- Key metrics (amounts, dates, percentages)
- Lock status indicator

#### **Admin Control Bar** (Standard 3-button pattern)
```tsx
<AdminControls 
  onEdit={() => openEdit(record)}     // Opens EditRecordModal
  onLock={() => openLock(record)}     // Opens LockUnlockModal  
  onDelete={() => openDelete(record)} // Opens DeleteConfirmModal
  locked={record.locked}
/>
```

#### **Button Actions**
- **Edit Button** (pencil icon)
  - Opens: `EditRecordModal` with pre-populated form
  - Fields: All editable record properties
  - Validation: Required fields, format checks
  - Actions: Save Changes, Cancel
  - Post-action: Toast notification, audit log entry

- **Lock/Unlock Button** (lock/unlock icon)
  - Opens: `LockUnlockModal`
  - If Locking: Requires reason input, shows preview of lock effect
  - If Unlocking: Shows lock details (who, when, why), requires confirmation
  - Actions: Confirm Lock/Unlock, Cancel
  - Post-action: Toast notification, audit log entry, permission change

- **Delete Button** (trash icon)
  - Opens: `DeleteConfirmModal` (4-step wizard for complex deletions)
  - Steps:
    1. **Impact Review**: Show what will be deleted, dependencies
    2. **Backup Check**: Offer backup creation option
    3. **Confirmation**: Type "DELETE" to confirm
    4. **Final Review**: Summary of deletion action
  - Actions: Cancel, Back, Permanently Delete
  - Post-action: Toast notification, audit log entry, data removal

---

## **3. Modal & Wizard Templates**

### **A. Create/Add Record Modal**
**Purpose**: Add new data records with proper validation

**Structure**:
```tsx
<Modal 
  title="Add New [Record Type]"
  subtitle="Super Admin — Create a new record"
  icon="bi-plus-circle-fill"
  tone="green"
  size="md"
>
  <div className="pm-modal-body">
    <div className="pm-note mb-3">
      <i className="bi bi-shield-lock me-1" />
      Only Super Admins can create records. All actions are audit-logged.
    </div>
    
    {/* Type-specific form fields */}
    {fields.map(field => (
      <div key={field.label} className="mb-3">
        <label className="form-label">{field.label}</label>
        <input
          className="form-control"
          type={field.type || "text"}
          placeholder={field.placeholder}
          value={form[field.label] || ""}
          onChange={e => setForm(prev => ({ ...prev, [field.label]: e.target.value }))}
        />
      </div>
    ))}
    
    <label className="form-label">Admin Notes</label>
    <textarea 
      className="form-control" 
      rows={2} 
      placeholder="Optional notes..." 
      value={form.notes || ""} 
      onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} 
    />
  </div>
  
  <div className="pm-modal-foot">
    <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
      Cancel
    </button>
    <button 
      className="btn btn-primary btn-sm" 
      onClick={() => { 
        onAdd(form); 
        toast({ kind: "success", title: "Record created" }); 
        onClose(); 
      }}
    >
      <i className="bi bi-check2 me-1" />Create Record
    </button>
  </div>
</Modal>
```

**Required Elements**:
- Security notice (audit logging)
- All required fields with validation
- Optional admin notes field
- Clear cancel/confirm actions
- Success feedback

---

### **B. Edit Record Modal**
**Purpose**: Modify existing record data

**Structure**:
```tsx
<Modal 
  title={`Edit: ${record.name}`}
  subtitle="Super Admin — Modify record data"
  icon="bi-pencil-square"
  tone="blue"
  size="lg"
>
  <div className="pm-modal-body">
    <div className="pm-note mb-3">
      <i className="bi bi-info-circle me-1" />
      All changes are audit-logged. Only Super Admins can edit records.
    </div>
    
    {Object.entries(record)
      .filter(([k]) => !["permissions", "vestingSchedule", "icon", "color", "id"].includes(k))
      .map(([key, val]) => (
        <div key={key} className="mb-3">
          <label className="form-label">
            {key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())}
          </label>
          <input
            className="form-control"
            value={String(val ?? "")}
            onChange={e => setForm((prev: any) => ({ ...prev, [key]: e.target.value }))}
          />
        </div>
      ))}
  </div>
  
  <div className="pm-modal-foot">
    <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
      Cancel
    </button>
    <button 
      className="btn btn-primary btn-sm" 
      onClick={() => { 
        onSave(form); 
        toast({ kind: "success", title: "Record updated" }); 
        onClose(); 
      }}
    >
      <i className="bi bi-check2 me-1" />Save Changes
    </button>
  </div>
</Modal>
```

**Required Elements**:
- Change tracking notice
- All editable fields
- Cancel/Save actions
- Success feedback

---

### **C. Delete Confirmation Wizard (4-Step Minimum)**
**Purpose**: Safely delete records with full confirmation

**Structure**:
```tsx
<Modal 
  title="Delete Record"
  subtitle={`Step ${step + 1} of 4: ${steps[step].label}`}
  icon="bi-trash3-fill"
  tone="red"
  size="md"
>
  <div className="pm-wizard-progress">
    <span style={{ width: `${((step + 1) / 4) * 100}%` }} />
  </div>
  <Steps steps={steps} current={step} />
  
  <div className="pm-modal-body">
    {/* Step 1: Impact Review */}
    {step === 0 && (
      <div className="d-flex flex-column gap-2">
        <div className="pm-note mb-3" style={{ 
          borderLeft: "3px solid var(--pm-danger)", 
          background: "var(--pm-danger-soft)" 
        }}>
          <div className="pm-td-strong" style={{ color: "var(--pm-danger)" }}>
            <i className="bi bi-exclamation-triangle me-1" />
            This action is IRREVERSIBLE
          </div>
          <div className="mt-1">
            All data associated with this record will be permanently removed.
          </div>
        </div>
        
        <div className="pm-card pm-card-pad mb-3">
          <div className="pm-eyebrow mb-1">Record to Delete</div>
          <div className="pm-td-strong">{record.name}</div>
          {record.role && <div className="pm-td-sub">{record.role}</div>}
        </div>
        
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">Affected Data</div>
          <div className="pm-kv">
            <span className="k">Related Records</span>
            <span className="v">{relatedCount} items</span>
          </div>
          <div className="pm-kv">
            <span className="k">Dependencies</span>
            <span className="v">{dependencyCount} links</span>
          </div>
        </div>
      </div>
    )}
    
    {/* Step 2: Backup Option */}
    {step === 1 && (
      <div className="d-flex flex-column gap-2">
        <div className="pm-eyebrow mb-1">Backup Options</div>
        <label className="d-flex align-items-center gap-2 mb-2">
          <input type="checkbox" className="form-check-input" />
          Create encrypted backup before deletion
        </label>
        <label className="d-flex align-items-center gap-2 mb-2">
          <input type="checkbox" className="form-check-input" />
          Send backup to corporate archive
        </label>
        <div className="pm-note">
          <i className="bi bi-info-circle me-1" />
          Backup will be retained for 90 days per data retention policy.
        </div>
      </div>
    )}
    
    {/* Step 3: Confirmation */}
    {step === 2 && (
      <div className="d-flex flex-column gap-2">
        <div className="mb-3">
          <label className="form-label" style={{ color: "var(--pm-danger)" }}>
            Type DELETE to confirm
          </label>
          <input 
            className="form-control" 
            style={{ borderColor: "var(--pm-danger)" }} 
            placeholder="Type DELETE" 
            value={confirm} 
            onChange={e => setConfirm(e.target.value)} 
          />
        </div>
        
        <label className="d-flex align-items-center gap-2">
          <input type="checkbox" className="form-check-input" />
          I understand this action cannot be undone
        </label>
      </div>
    )}
    
    {/* Step 4: Final Review */}
    {step === 3 && (
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Final Deletion Summary</div>
        <div className="pm-kv">
          <span className="k">Record</span>
          <span className="v">{record.name}</span>
        </div>
        <div className="pm-kv">
          <span className="k">Backup Created</span>
          <span className="v">{backupOption ? "Yes" : "No"}</span>
        </div>
        <div className="pm-kv">
          <span className="k">Audit Log</span>
          <span className="v">Will be recorded</span>
        </div>
        <div className="pm-note mt-3">
          <i className="bi bi-shield-lock me-1" />
          Deletion will be executed immediately upon confirmation.
        </div>
      </div>
    )}
  </div>
  
  <div className="pm-modal-foot">
    <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
      Cancel
    </button>
    {step > 0 && (
      <button 
        className="btn btn-outline-secondary btn-sm" 
        onClick={() => setStep(s => s - 1)}
      >
        ← Back
      </button>
    )}
    {step < 3 ? (
      <button 
        className="btn btn-primary btn-sm" 
        onClick={() => setStep(s => s + 1)}
      >
        Continue →
      </button>
    ) : (
      <button 
        className="btn btn-danger btn-sm" 
        disabled={confirm !== "DELETE"} 
        onClick={() => { 
          onDelete(); 
          toast({ kind: "success", title: "Record deleted" }); 
          onClose(); 
        }}
      >
        <i className="bi bi-trash3 me-1" />Permanently Delete
      </button>
    )}
  </div>
</Modal>
```

**Required Elements**:
- 4-step minimum process
- Impact assessment
- Backup options
- Type confirmation
- Final summary
- Progress indicator
- Navigation controls

---

### **D. Lock/Unlock Modal**
**Purpose**: Control record access permissions

**Structure**:
```tsx
<Modal 
  title={isLocked ? "Unlock Record" : "Lock Record"}
  subtitle="Super Admin — Data access control"
  icon={isLocked ? "bi-unlock-fill" : "bi-lock-fill"}
  tone={isLocked ? "green" : "amber"}
  size="md"
>
  <div className="pm-modal-body">
    <div className="pm-card pm-card-pad mb-3">
      <div className="pm-eyebrow mb-1">Record</div>
      <div className="pm-td-strong">{record.name}</div>
      <Badge tone={isLocked ? "amber" : "green"}>
        {isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}
      </Badge>
    </div>
    
    {isLocked ? (
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">Lock Details</div>
        <div className="pm-kv">
          <span className="k">Locked by</span>
          <span className="v">Super Admin</span>
        </div>
        <div className="pm-kv">
          <span className="k">Locked at</span>
          <span className="v">Jan 15, 2026 14:30</span>
        </div>
        <div className="pm-kv">
          <span className="k">Reason</span>
          <span className="v">Board resolution pending</span>
        </div>
      </div>
    ) : (
      <div className="mb-3">
        <label className="form-label">Reason for Locking</label>
        <textarea 
          className="form-control" 
          rows={3} 
          placeholder="e.g. Under legal review, pending board approval..." 
        />
      </div>
    )}
    
    <div className="pm-note">
      <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
      {isLocked
        ? "Unlocking will allow other admins to edit this record."
        : "Locking prevents all other admins from editing. Only the locking admin can unlock."}
    </div>
  </div>
  
  <div className="pm-modal-foot">
    <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
      Cancel
    </button>
    <button 
      className={`btn btn-sm ${isLocked ? "btn-primary" : "btn-primary"}`} 
      onClick={() => { 
        onToggle(!isLocked); 
        toast({ kind: "success", title: isLocked ? "Record unlocked" : "Record locked" }); 
        onClose(); 
      }}
    >
      <i className={`bi ${isLocked ? "bi-unlock" : "bi-lock"} me-1`} />
      {isLocked ? "Unlock Record" : "Lock Record"}
    </button>
  </div>
</Modal>
```

**Required Elements**:
- Current status display
- Lock details (if locked)
- Reason input (if locking)
- Permission impact notice
- Confirm/Cancel actions

---

### **E. Multi-Step Wizard Template (4+ Steps)**
**Purpose**: Complex operations requiring guided workflow

**Structure**:
```tsx
<Modal 
  title="[Operation Name]"
  subtitle={`Step ${step + 1} of ${totalSteps}: ${steps[step].label}`}
  icon="[appropriate-icon]"
  tone="[appropriate-tone]"
  size="lg"
>
  <div className="pm-wizard-progress">
    <span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
  </div>
  <Steps steps={steps} current={step} />
  
  <div className="pm-modal-body">
    {/* Step 1: Initial Selection */}
    {step === 0 && (
      <div className="d-flex flex-column gap-2">
        <div className="pm-eyebrow mb-1">[Selection Context]</div>
        {[selectionOptions].map(option => (
          <button 
            key={option} 
            className={`pm-opt ${selected === option ? "active" : ""}`} 
            onClick={() => setSelected(option)}
          >
            <div className="r" />
            <span className="pm-td-strong">{option}</span>
          </button>
        ))}
      </div>
    )}
    
    {/* Step 2: Data Input */}
    {step === 1 && (
      <div className="d-flex flex-column gap-2">
        <label className="form-label">[Field Label]</label>
        <input className="form-control" placeholder="[Placeholder]" />
        
        <div className="pm-card pm-card-pad">
          <div className="pm-eyebrow mb-2">[Context Information]</div>
          <div className="pm-kv">
            <span className="k">[Key]</span>
            <span className="v">[Value]</span>
          </div>
        </div>
      </div>
    )}
    
    {/* Step 3: Validation/Review */}
    {step === 2 && (
      <div className="d-flex flex-column gap-2">
        <div className="pm-eyebrow mb-1">[Validation Context]</div>
        {[validationItems].map(item => (
          <label 
            key={item} 
            className="d-flex align-items-center gap-2 mb-2" 
            style={{ fontSize: ".82rem" }}
          >
            <input type="checkbox" className="form-check-input" />
            {item}
          </label>
        ))}
      </div>
    )}
    
    {/* Step 4: Final Confirmation */}
    {step === 3 && (
      <div className="pm-card pm-card-pad">
        <div className="pm-eyebrow mb-2">[Operation] Summary</div>
        {[summaryItems].map(([key, value]) => (
          <div key={key} className="pm-kv">
            <span className="k">{key}</span>
            <span className="v">{value}</span>
          </div>
        ))}
        <div className="pm-note mt-3">
          <i className="bi bi-info-circle me-1" />
          [Post-action information]
        </div>
      </div>
    )}
  </div>
  
  <div className="pm-modal-foot">
    <button className="btn btn-outline-secondary btn-sm" onClick={onClose}>
      Cancel
    </button>
    {step > 0 && (
      <button 
        className="btn btn-outline-secondary btn-sm" 
        onClick={() => setStep(s => s - 1)}
      >
        ← Back
      </button>
    )}
    {step < totalSteps - 1 ? (
      <button 
        className="btn btn-primary btn-sm" 
        onClick={() => setStep(s => s + 1)}
      >
        Continue →
      </button>
    ) : (
      <button 
        className="btn btn-primary btn-sm" 
        onClick={() => { 
          toast({ kind: "success", title: "[Success message]" }); 
          onClose(); 
        }}
      >
        <i className="bi bi-check2 me-1" />[Final Action]
      </button>
    )}
  </div>
</Modal>
```

**Required Elements**:
- Progress bar indicator
- Step navigation
- Contextual information per step
- Validation where appropriate
- Final summary
- Clear action buttons

---

## **4. Specialized Permission Types**

### **A. Onboard Member Wizard (5 Steps)**
**Purpose**: Add new team members/roles with full setup

**Steps**:
1. **Member Details**: Name, email, role, department
2. **Access Level**: Permission groups, system access
3. **Equipment/Assets**: Assign devices, software licenses
4. **Onboarding Checklist**: Documents, training, orientation
5. **Review & Confirm**: Summary of all assignments

### **B. Offboard Member Wizard (5 Steps)**
**Purpose**: Remove team members with proper handover

**Steps**:
1. **Member Selection**: Choose member to offboard
2. **Access Revocation**: Systems, data, permissions to remove
3. **Asset Recovery**: Equipment, licenses to collect
4. **Handover Process**: Tasks, responsibilities reassignment
5. **Final Confirmation**: Summary and archive

### **C. Pause/Resume Service Wizard (4 Steps)**
**Purpose**: Temporarily suspend running services

**Steps**:
1. **Service Selection**: Choose service to pause/resume
2. **Impact Assessment**: Affected users, dependencies
3. **Schedule/Duration**: Immediate or scheduled, time period
4. **Confirmation**: Summary and execution

### **D. Configure Permissions Drawer**
**Purpose**: Manage complex permission matrices

**Structure**:
- User/Role selection
- Permission category tabs
- Checkbox matrix for permissions
- Save/Cancel actions
- Audit trail preview

---

## **5. Data Table Standards**

### **Every Data Table Must Include**:
```tsx
<table className="pm-table">
  <thead>
    <tr>
      <th>[Primary Field]</th>
      <th>[Secondary Field]</th>
      <th>[Key Metric]</th>
      <th>Status</th>
      <th>[Date/Time]</th>
      <th className="text-end">Actions</th>
    </tr>
  </thead>
  <tbody>
    {records.map(record => (
      <tr key={record.id}>
        <td className="pm-td-strong">{record.primaryField}</td>
        <td>{record.secondaryField}</td>
        <td className="mono">{record.keyMetric}</td>
        <td><Badge tone="[status-tone]">{record.status}</Badge></td>
        <td className="pm-td-sub">{record.dateField}</td>
        <td className="text-end text-nowrap">
          <button 
            className="btn btn-sm btn-outline-primary me-1" 
            onClick={() => openEdit(record)}
          >
            <i className="bi bi-pencil-square" />
          </button>
          <button 
            className="btn btn-sm btn-outline-secondary me-1" 
            onClick={() => openLock(record)}
          >
            <i className={`bi ${record.locked ? "bi-unlock" : "bi-lock"}`} />
          </button>
          <button 
            className="btn btn-sm btn-outline-danger" 
            onClick={() => openDelete(record)}
          >
            <i className="bi bi-trash3" />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Required Elements**:
- Clear column headers
- Consistent data formatting
- Status badges
- Action buttons with proper spacing
- Responsive design

---

## **6. Quick Actions Grid**

### **Standard Quick Action Button**:
```tsx
<button className="pm-qa" onClick={action}>
  <i className={`bi ${icon}`} />
  <span className="t">{label}</span>
</button>
```

**Categories**:
- **Create Actions**: Add new items, create records
- **View Actions**: Open detailed views, reports
- **Process Actions**: Workflows, approvals, transfers
- **Admin Actions**: Permissions, settings, configuration

---

## **7. Anti-Pattern Checklist**

### **❌ What to Avoid**:
- Placeholder text like "the modal now opens"
- Dead-end buttons with no actions
- Blank modals with no content
- Single-step delete confirmations
- Missing validation on forms
- No success/error feedback
- Inconsistent button styling
- Missing audit trail references
- Unclear action consequences

### **✅ What to Ensure**:
- Every button has a complete modal/action
- All modals have real content and functionality
- Multi-step processes for destructive actions
- Clear validation and error handling
- Success feedback with toast notifications
- Consistent styling and patterns
- Audit logging references
- Security notices where appropriate
- Progress indicators for long operations
- Clear cancel/back navigation

---

## **8. Implementation Checklist for New Admin Pages**

### **Page Structure**:
- [ ] Header with entity identity and admin actions
- [ ] Key metrics strip with clickable cards
- [ ] Tabbed navigation (6-8 tabs recommended)
- [ ] Each tab has stats, data table, quick actions

### **Data Records**:
- [ ] All records have Edit/Lock/Delete buttons
- [ ] Admin controls bar implemented
- [ ] Status indicators and badges
- [ ] Proper data formatting

### **Modals & Wizards**:
- [ ] Create modal with validation
- [ ] Edit modal with pre-populated data
- [ ] Delete wizard (4-step minimum)
- [ ] Lock/Unlock modal with reason tracking
- [ ] Specialized wizards for complex operations

### **User Experience**:
- [ ] No placeholder text
- [ ] No dead-end buttons
- [ ] Success/error feedback
- [ ] Progress indicators
- [ ] Clear navigation
- [ ] Responsive design

### **Security & Compliance**:
- [ ] Audit trail references
- [ ] Security notices
- [ ] Permission checks
- [ ] Data validation
- [ ] Confirmation requirements

---

This template provides a comprehensive foundation for building admin pages with complete, production-ready modal systems and permission structures. Apply this pattern to ensure consistency across all admin interfaces while maintaining security and user experience standards.

now add absolute similar data and records and text permission for the following page styling the modals perfectly the inputs sections, buttons, texts, icons etc all adding multistep modals, and wizards and tabs whenever necessary:
add documents mock display like how they document sill be clicked to view and edit, deleted lock replace etc make this features added and advanced, and comprehensive and adding the features might require adding some css styles add comprehensive additions and improvements, document previewing should be possible


this page  needs furthure improvements some buttons are stuck some modals show dummy data..buttons show dead ends.. some modals dont navigate anywhere and have dead ends...multistep modals are not working..add 10+ new features add new data dd  record make the have multistep modal for doing it and warnings and pop ups etc.....make this page extremely advanced add 10+ new features add data add modals ad new tabs like 3+ add new features relevant
add modals, pop ups multistep wizards, adding as many as 25+ or more depending on the need...work on each pages comprehesively  i bellow you finish all the  page i have given 
work on refining and comprehensively adding customizations and data and features to the page:


C:\Users\Admin\Downloads\design-responsive-admin-dashboard-page 9\src\features\permissions-roles