# Standardized Components Guide

This guide provides comprehensive documentation for the standardized CRUD components and patterns implemented in the motorcycle workshop management system.

## Overview

The system now includes a complete set of standardized components that provide consistent CRUD operations, UI patterns, and data management across all modules. This ensures maintainability, reduces code duplication, and provides a uniform user experience.

## Core Components

### 1. ViewModeSelector

**Location:** `src/components/ui/ViewModeSelector.jsx`

**Purpose:** Provides consistent filtering between active, inactive, deleted, and all items across modules.

**Usage:**
```jsx
import ViewModeSelector from '../components/ui/ViewModeSelector';

<ViewModeSelector
  currentMode={currentViewMode}
  onModeChange={handleViewModeChange}
  stats={stats}
  size="sm"
/>
```

**Props:**
- `currentMode`: Current selected mode ('active', 'inactive', 'deleted', 'all')
- `onModeChange`: Callback when mode changes
- `stats`: Object with count statistics (activos, inactivos, eliminados, total)
- `size`: Button size ('xs', 'sm', 'md', 'lg')
- `className`: Additional CSS classes

### 2. ActionButtons

**Location:** `src/components/ui/ActionButtons.jsx`

**Purpose:** Standardized action buttons for CRUD operations with consistent styling and behavior.

**Usage:**
```jsx
import ActionButtons, { ActionButtonsPresets } from '../components/ui/ActionButtons';

<ActionButtons
  item={item}
  onView={() => handleView(item)}
  onEdit={() => handleEdit(item)}
  onDelete={() => handleDelete(item.id)}
  onActivate={handleActivate}
  onDeactivate={handleDeactivate}
  onRestore={handleRestore}
  onHardDelete={handleHardDelete}
  permissions={ActionButtonsPresets.admin.permissions}
  size="sm"
  showLabels={false}
/>
```

**Props:**
- `item`: The data item
- `on[Action]`: Callback functions for each action
- `permissions`: Object defining which actions are allowed
- `size`: Button size
- `variant`: Layout ('horizontal', 'vertical')
- `showLabels`: Whether to show text labels

**Permission Presets:**
- `ActionButtonsPresets.full`: All operations
- `ActionButtonsPresets.readOnly`: View only
- `ActionButtonsPresets.basic`: Standard operations (no hard delete)
- `ActionButtonsPresets.admin`: All operations including hard delete
- `ActionButtonsPresets.statusOnly`: Only activate/deactivate/restore

### 3. DataManager

**Location:** `src/components/ui/DataManager.jsx`

**Purpose:** Comprehensive data management component that integrates ViewModeSelector, DataTable, ActionButtons, search, filtering, and bulk operations.

**Usage:**
```jsx
import DataManager from '../components/ui/DataManager';
import { productosService } from '../services/serviceFactory';

<DataManager
  title="Productos"
  data={productos}
  columns={columns}
  loading={loading}
  error={error}
  stats={stats}
  service={productosService}
  
  actions={{
    view: true,
    edit: true,
    delete: true,
    activate: true,
    restore: true,
    hardDelete: false
  }}
  
  viewModes={['active', 'inactive', 'deleted', 'all']}
  defaultViewMode="active"
  
  searchable={true}
  selectable={true}
  bulkActions={bulkActions}
  
  onAdd={handleAdd}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onActivate={handleActivate}
  onDeactivate={handleDeactivate}
  onRestore={handleRestore}
  onHardDelete={handleHardDelete}
  onRefresh={fetchData}
/>
```

**Key Features:**
- Integrated view mode switching
- Search and filtering
- Bulk operations
- Sorting and pagination
- Action buttons integration
- Loading states and error handling

### 4. BaseCrudService

**Location:** `src/services/baseCrudService.js`

**Purpose:** Base service class providing standardized CRUD operations with consistent error handling and toast notifications.

**Methods:**
- `getAll(params)`: Get all entities
- `getById(id)`: Get entity by ID
- `create(data)`: Create new entity
- `update(id, data)`: Update entity
- `patch(id, data)`: Partial update
- `delete(id)`: Delete entity
- `activate(id)`: Activate entity
- `deactivate(id)`: Deactivate entity
- `toggleActive(id)`: Toggle active status
- `softDelete(id)`: Soft delete entity
- `hardDelete(id)`: Hard delete entity
- `restore(id)`: Restore deleted entity
- `getActive(params)`: Get active entities
- `getInactive(params)`: Get inactive entities
- `getDeleted(params)`: Get deleted entities
- `search(query, params)`: Search entities
- `getStats()`: Get statistics
- `activateMultiple(ids)`: Bulk activate
- `deactivateMultiple(ids)`: Bulk deactivate
- `softDeleteMultiple(ids)`: Bulk soft delete
- `restoreMultiple(ids)`: Bulk restore

### 5. ServiceFactory

**Location:** `src/services/serviceFactory.js`

**Purpose:** Factory for creating standardized CRUD services with consistent patterns.

**Usage:**
```jsx
import { ServiceFactory, services, usuariosService } from '../services/serviceFactory';

// Use pre-configured service
const response = await usuariosService.getAll();

// Get service by name
const productosService = ServiceFactory.getService('productos');

// Create custom service
const customService = ServiceFactory.createCustomService('custom', {
  apiService: customAPI,
  entityName: 'elemento',
  entityNamePlural: 'elementos',
  customMethods: {
    customMethod: async function() {
      // Custom implementation
    }
  }
});
```

**Available Services:**
- `usuariosService`: User management
- `rolesService`: Role management
- `personasService`: Person management
- `productosService`: Product management
- `serviciosService`: Service management
- `categoriasService`: Category management
- `proveedoresService`: Supplier management
- `motosService`: Motorcycle management
- `mantenimientosService`: Maintenance management
- `ventasService`: Sales management
- `inventarioService`: Inventory management

### 6. FormValidation

**Location:** `src/components/ui/FormValidation.jsx`

**Purpose:** Comprehensive form validation system with built-in validators and error display components.

**Components:**
- `FieldError`: Display field-level errors
- `FieldSuccess`: Display field-level success messages
- `FieldInfo`: Display field-level info messages
- `FormErrors`: Display form-level errors

**Hook Usage:**
```jsx
import { useFormValidation, validators } from '../components/ui/FormValidation';

const validationRules = {
  nombre: [
    validators.required('El nombre es requerido'),
    validators.minLength(2, 'Mínimo 2 caracteres')
  ],
  email: [
    validators.required(),
    validators.email()
  ],
  precio: [
    validators.required(),
    validators.numeric(),
    validators.positive()
  ]
};

const {
  data: formData,
  errors: formErrors,
  isValid,
  setFieldValue,
  setFieldTouched,
  validateAll,
  reset
} = useFormValidation(initialData, validationRules);
```

**Available Validators:**
- `required(message)`: Required field
- `email(message)`: Email format
- `minLength(length, message)`: Minimum length
- `maxLength(length, message)`: Maximum length
- `pattern(regex, message)`: Pattern matching
- `numeric(message)`: Numeric value
- `positive(message)`: Positive number
- `min(value, message)`: Minimum value
- `max(value, message)`: Maximum value
- `phone(message)`: Phone number
- `url(message)`: URL format
- `date(message)`: Date format
- `futureDate(message)`: Future date
- `pastDate(message)`: Past date

## Implementation Patterns

### 1. Standard Module Structure

```
src/modulos/[module]/
├── pages/
│   └── [Module]Page.jsx
├── components/
│   ├── [Module]Form.jsx
│   └── [Module]Details.jsx
└── hooks/
    └── use[Module].js
```

### 2. Standard Page Implementation

```jsx
import React, { useState, useEffect } from 'react';
import DataManager from '../../../components/ui/DataManager';
import Modal from '../../../components/ui/Modal';
import { useFormValidation, validators } from '../../../components/ui/FormValidation';
import { [module]Service } from '../../../services/serviceFactory';

const [Module]Page = () => {
  // State management
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form validation
  const validationRules = {
    // Define validation rules
  };

  const {
    data: formData,
    errors: formErrors,
    isValid,
    setFieldValue,
    validateAll,
    reset: resetForm
  } = useFormValidation(initialData, validationRules);

  // Table columns
  const columns = [
    // Define columns
  ];

  // Load data
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await [module]Service.getAll();
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // CRUD handlers
  const handleAdd = () => {
    setEditingItem(null);
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    resetForm(item);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const response = await [module]Service.softDelete(id);
    if (response.success) {
      fetchData();
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      setLoading(true);
      const response = editingItem
        ? await [module]Service.update(editingItem.id, formData)
        : await [module]Service.create(formData);

      if (response.success) {
        setShowModal(false);
        fetchData();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <DataManager
        title="[Module] Management"
        data={data}
        columns={columns}
        loading={loading}
        error={error}
        stats={stats}
        service={[module]Service}
        
        actions={{
          view: true,
          edit: true,
          delete: true,
          activate: true,
          restore: true
        }}
        
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={fetchData}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingItem ? 'Edit [Module]' : 'New [Module]'}
      >
        <form onSubmit={handleSubmit}>
          {/* Form fields */}
        </form>
      </Modal>
    </div>
  );
};
```

### 3. Column Configuration Patterns

```jsx
const columns = [
  // ID column
  {
    header: 'ID',
    accessor: 'id',
    sortable: true,
    className: 'text-gray-500 font-mono text-sm'
  },
  
  // Text column with icon
  {
    header: 'Name',
    accessor: 'nombre',
    sortable: true,
    searchable: true,
    render: (value, item) => (
      <div className="flex items-center">
        <Icon className="mr-2" />
        <span className="font-medium">{value}</span>
      </div>
    )
  },
  
  // Status column
  {
    header: 'Status',
    accessor: 'activo',
    type: 'status',
    statusType: 'active',
    sortable: true
  },
  
  // Date column
  {
    header: 'Created',
    accessor: 'created_at',
    type: 'datetime',
    sortable: true
  },
  
  // Currency column
  {
    header: 'Price',
    accessor: 'precio',
    type: 'currency',
    sortable: true
  },
  
  // Custom render column
  {
    header: 'Custom',
    accessor: 'custom_field',
    render: (value, item) => (
      <CustomComponent value={value} item={item} />
    )
  }
];
```

## Migration Guide

### Converting Existing Modules

1. **Replace manual CRUD operations** with service factory services
2. **Replace custom tables** with DataManager component
3. **Replace manual action buttons** with ActionButtons component
4. **Add form validation** using FormValidation components
5. **Implement view mode switching** with ViewModeSelector
6. **Add bulk operations** support

### Step-by-Step Migration

1. **Update imports:**
```jsx
// Old
import { rolesAPI } from '../../../services/api';

// New
import { rolesService } from '../../../services/serviceFactory';
import DataManager from '../../../components/ui/DataManager';
```

2. **Replace API calls:**
```jsx
// Old
const response = await rolesAPI.getAll();

// New
const response = await rolesService.getAll();
```

3. **Replace table implementation:**
```jsx
// Old
<Table
  columns={columns}
  data={roles}
  loading={loading}
  actions={actions}
/>

// New
<DataManager
  data={roles}
  columns={columns}
  loading={loading}
  service={rolesService}
  actions={{
    view: true,
    edit: true,
    delete: true,
    activate: true
  }}
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

4. **Add form validation:**
```jsx
// Add validation rules
const validationRules = {
  nombre: [validators.required(), validators.minLength(2)]
};

// Use validation hook
const { data: formData, errors, isValid, setFieldValue, validateAll } = 
  useFormValidation(initialData, validationRules);
```

## Best Practices

### 1. Service Usage
- Always use service factory services instead of direct API calls
- Handle service responses consistently
- Use bulk operations for multiple item actions

### 2. Component Configuration
- Define clear column configurations with appropriate types
- Use consistent permission presets
- Implement proper error handling

### 3. Form Validation
- Define comprehensive validation rules
- Use appropriate validators for each field type
- Provide clear error messages

### 4. State Management
- Use consistent state patterns across modules
- Handle loading and error states properly
- Reset forms and clear selections appropriately

### 5. User Experience
- Provide feedback for all actions
- Use confirmation dialogs for destructive actions
- Implement proper loading states

## Troubleshooting

### Common Issues

1. **Service not found:** Ensure service is properly exported from serviceFactory
2. **Validation not working:** Check validation rules syntax and field names
3. **Actions not showing:** Verify permissions and action callbacks
4. **Data not loading:** Check service response handling and error states

### Debugging Tips

1. Check browser console for service errors
2. Verify API endpoints are correctly configured
3. Test validation rules in isolation
4. Use React Developer Tools to inspect component props

## Future Enhancements

1. **Advanced filtering:** Add more sophisticated filtering options
2. **Export functionality:** Implement data export features
3. **Real-time updates:** Add WebSocket support for live data updates
4. **Advanced permissions:** Implement field-level permissions
5. **Audit logging:** Add comprehensive audit trail functionality

This standardized system provides a solid foundation for consistent, maintainable, and scalable CRUD operations across the entire application.
