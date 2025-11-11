import frappe
from frappe import _

def after_app_install(app_name):
    """Create all required roles after app installation"""
    # Create Sales roles
    create_sales_user_role()
    create_sales_manager_role()
    create_sales_agent_role()
    # Create legacy roles (for backward compatibility)
    create_lead_manager_role()
    create_lead_user_role()
    # Create profiles
    create_sales_user_profile()
    create_sales_manager_profile()
    create_sales_agent_profile()
    create_lead_manager_profile()
    create_lead_user_profile()
    # Assign roles to profiles
    assign_profile_to_roles()
    assign_sales_profile_to_roles()
    # Add permissions
    add_role_permissions()
    add_sales_role_permissions()
    update_website_settings()

def create_lead_manager_role():
    """Create Lead Manager role if it doesn't exist"""
    if not frappe.db.exists("Role", "Lead Manager"):
        role = frappe.get_doc({
            "doctype": "Role",
            "role_name": "Lead Manager",
            "desk_access": 1,
            "restrict_to_domain": None
        })
        role.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Lead Manager role created successfully")
    else:
        print("Lead Manager role already exists")

def create_lead_user_role():
    """Create Lead User role if it doesn't exist"""
    if not frappe.db.exists("Role", "Lead User"):
        role = frappe.get_doc({
            "doctype": "Role",
            "role_name": "Lead User",
            "desk_access": 1,
            "restrict_to_domain": None
        })
        role.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Lead User role created successfully")
    else:
        print("Lead User role already exists")

def create_lead_manager_profile():
    """Create Lead Manager profile if it doesn't exist"""
    if not frappe.db.exists("Role Profile", "Lead Manager"):
        profile = frappe.get_doc({
            "doctype": "Role Profile",
            "role_profile": "Lead Manager",
            "roles": []
        })
        profile.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Lead Manager profile created successfully")
    else:
        print("Lead Manager profile already exists")

def create_lead_user_profile():
    """Create Lead User profile if it doesn't exist"""
    if not frappe.db.exists("Role Profile", "Lead User"):
        profile = frappe.get_doc({
            "doctype": "Role Profile",
            "role_profile": "Lead User",
            "roles": []
        })
        profile.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Lead User profile created successfully")
    else:
        print("Lead User profile already exists")

def assign_profile_to_roles():
    """Assign roles to their respective profiles"""
    # Assign Lead Manager role to Lead Manager profile
    if frappe.db.exists("Role", "Lead Manager") and frappe.db.exists("Role Profile", "Lead Manager"):
        profile = frappe.get_doc("Role Profile", "Lead Manager")
        role_assigned = False
        for role_row in profile.roles:
            if role_row.role == "Lead Manager":
                role_assigned = True
                break
        
        if not role_assigned:
            profile.append("roles", {
                "role": "Lead Manager"
            })
            profile.save(ignore_permissions=True)
            frappe.db.commit()
            print("Lead Manager role assigned to Lead Manager profile successfully")
        else:
            print("Lead Manager role is already assigned to Lead Manager profile")
    
    # Assign Lead User role to Lead User profile
    if frappe.db.exists("Role", "Lead User") and frappe.db.exists("Role Profile", "Lead User"):
        profile = frappe.get_doc("Role Profile", "Lead User")
        role_assigned = False
        for role_row in profile.roles:
            if role_row.role == "Lead User":
                role_assigned = True
                break
        
        if not role_assigned:
            profile.append("roles", {
                "role": "Lead User"
            })
            profile.save(ignore_permissions=True)
            frappe.db.commit()
            print("Lead User role assigned to Lead User profile successfully")
        else:
            print("Lead User role is already assigned to Lead User profile")

def add_role_permissions():
    """Add role permissions for Lead Manager and Lead User"""
    # Add permissions for Lead Manager
    if frappe.db.exists("Role", "Lead Manager"):
        add_doctype_permission("Lead", "Lead Manager", {
            "read": 1,
            "write": 1,
            "create": 1,
            "delete": 1,
            "share": 1
        })
        print("Role permissions added successfully for Lead Manager")
    else:
        print("Lead Manager role doesn't exist")
    
    # Add permissions for Lead User
    if frappe.db.exists("Role", "Lead User"):
        add_doctype_permission("Lead", "Lead User", {
            "if_owner": 1,
            "read": 1,
            "write": 1,
            "create": 1,
            "share": 1
        })
        print("Role permissions added successfully for Lead User")
    else:
        print("Lead User role doesn't exist")

def add_doctype_permission(doctype, role, permissions):
    """Add or update role permission for a doctype"""
    # Check if permission already exists
    existing_permission = frappe.db.get_value(
        "Custom DocPerm",
        {
            "parent": doctype,
            "role": role
        }
    )
    
    if existing_permission:
        # Update existing permission
        perm = frappe.get_doc("Custom DocPerm", existing_permission)
        for key, value in permissions.items():
            setattr(perm, key, value)
        perm.save(ignore_permissions=True)
        print(f"Updated permission for {doctype} - {role}")
    else:
        # Create new permission
        perm = frappe.get_doc({
            "doctype": "Custom DocPerm",
            "parent": doctype,
            "role": role,
            **permissions
        })
        perm.insert(ignore_permissions=True)
        print(f"Created permission for {doctype} - {role}")
    
    frappe.db.commit()

def verify_role_permissions():
    """Verify role permissions for Lead Manager and Lead User"""
    # Verify Lead Manager permissions
    perms = frappe.get_all('Custom DocPerm', 
                          filters={'role': 'Lead Manager'}, 
                          fields=['parent', 'role', 'read', 'write', 'create'])
    
    print('Role Permissions for Lead Manager:')
    for p in perms:
        print(f'- {p.parent}: read={p.read}, write={p.write}, create={p.create}')
    
    # Verify Lead User permissions
    perms = frappe.get_all('Custom DocPerm', 
                          filters={'role': 'Lead User'}, 
                          fields=['parent', 'role', 'read', 'write', 'create'])
    
    print('Role Permissions for Lead User:')
    for p in perms:
        print(f'- {p.parent}: read={p.read}, write={p.write}, create={p.create}')
    
    return perms

# ============================================================================
# SALES ROLES CREATION
# ============================================================================

def create_sales_user_role():
    """Create Sales User role if it doesn't exist"""
    if not frappe.db.exists("Role", "Sales User"):
        role = frappe.get_doc({
            "doctype": "Role",
            "role_name": "Sales User",
            "desk_access": 1,
            "restrict_to_domain": None
        })
        role.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Sales User role created successfully")
    else:
        print("Sales User role already exists")

def create_sales_manager_role():
    """Create Sales Manager role if it doesn't exist"""
    if not frappe.db.exists("Role", "Sales Manager"):
        role = frappe.get_doc({
            "doctype": "Role",
            "role_name": "Sales Manager",
            "desk_access": 1,
            "restrict_to_domain": None
        })
        role.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Sales Manager role created successfully")
    else:
        print("Sales Manager role already exists")

def create_sales_agent_role():
    """Create Sales Agent role if it doesn't exist"""
    if not frappe.db.exists("Role", "Sales Agent"):
        role = frappe.get_doc({
            "doctype": "Role",
            "role_name": "Sales Agent",
            "desk_access": 1,
            "restrict_to_domain": None
        })
        role.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Sales Agent role created successfully")
    else:
        print("Sales Agent role already exists")

def create_sales_user_profile():
    """Create Sales User profile if it doesn't exist"""
    if not frappe.db.exists("Role Profile", "Sales User"):
        profile = frappe.get_doc({
            "doctype": "Role Profile",
            "role_profile": "Sales User",
            "roles": []
        })
        profile.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Sales User profile created successfully")
    else:
        print("Sales User profile already exists")

def create_sales_manager_profile():
    """Create Sales Manager profile if it doesn't exist"""
    if not frappe.db.exists("Role Profile", "Sales Manager"):
        profile = frappe.get_doc({
            "doctype": "Role Profile",
            "role_profile": "Sales Manager",
            "roles": []
        })
        profile.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Sales Manager profile created successfully")
    else:
        print("Sales Manager profile already exists")

def create_sales_agent_profile():
    """Create Sales Agent profile if it doesn't exist"""
    if not frappe.db.exists("Role Profile", "Sales Agent"):
        profile = frappe.get_doc({
            "doctype": "Role Profile",
            "role_profile": "Sales Agent",
            "roles": []
        })
        profile.insert(ignore_permissions=True)
        frappe.db.commit()
        print("Sales Agent profile created successfully")
    else:
        print("Sales Agent profile already exists")

def assign_sales_profile_to_roles():
    """Assign sales roles to their respective profiles"""
    # Sales User
    if frappe.db.exists("Role", "Sales User") and frappe.db.exists("Role Profile", "Sales User"):
        profile = frappe.get_doc("Role Profile", "Sales User")
        role_assigned = any(row.role == "Sales User" for row in profile.roles)
        if not role_assigned:
            profile.append("roles", {"role": "Sales User"})
            profile.save(ignore_permissions=True)
            frappe.db.commit()
            print("Sales User role assigned to Sales User profile successfully")
    
    # Sales Manager
    if frappe.db.exists("Role", "Sales Manager") and frappe.db.exists("Role Profile", "Sales Manager"):
        profile = frappe.get_doc("Role Profile", "Sales Manager")
        role_assigned = any(row.role == "Sales Manager" for row in profile.roles)
        if not role_assigned:
            profile.append("roles", {"role": "Sales Manager"})
            profile.save(ignore_permissions=True)
            frappe.db.commit()
            print("Sales Manager role assigned to Sales Manager profile successfully")
    
    # Sales Agent
    if frappe.db.exists("Role", "Sales Agent") and frappe.db.exists("Role Profile", "Sales Agent"):
        profile = frappe.get_doc("Role Profile", "Sales Agent")
        role_assigned = any(row.role == "Sales Agent" for row in profile.roles)
        if not role_assigned:
            profile.append("roles", {"role": "Sales Agent"})
            profile.save(ignore_permissions=True)
            frappe.db.commit()
            print("Sales Agent role assigned to Sales Agent profile successfully")

def add_sales_role_permissions():
    """Add role permissions for Sales roles"""
    # Sales User - Can view won leads and assign leads (read-only for most fields)
    if frappe.db.exists("Role", "Sales User"):
        add_doctype_permission("Lead", "Sales User", {
            "read": 1,
            "write": 0,  # Cannot edit lead details, only assign
            "create": 0,
            "delete": 0,
            "share": 0
        })
        print("Role permissions added successfully for Sales User")
    
    # Sales Manager - Full access to leads
    if frappe.db.exists("Role", "Sales Manager"):
        add_doctype_permission("Lead", "Sales Manager", {
            "read": 1,
            "write": 1,
            "create": 1,
            "delete": 1,
            "share": 1
        })
        print("Role permissions added successfully for Sales Manager")
    
    # Sales Agent - Can only edit assigned leads
    if frappe.db.exists("Role", "Sales Agent"):
        add_doctype_permission("Lead", "Sales Agent", {
            "if_owner": 1,
            "read": 1,
            "write": 1,
            "create": 1,
            "delete": 0,
            "share": 0
        })
        print("Role permissions added successfully for Sales Agent")

def update_website_settings():
    """Update Website Settings with home_page = 'index'"""
    try:
        # Website Settings is a single doctype, so we get it directly
        if frappe.db.exists("Website Settings", "Website Settings"):
            website_settings = frappe.get_doc("Website Settings", "Website Settings")
        else:
            # Create if it doesn't exist
            website_settings = frappe.get_doc({
                "doctype": "Website Settings",
                "name": "Website Settings"
            })
            website_settings.insert(ignore_permissions=True)
        
        # Update home_page
        website_settings.home_page = "index"
        website_settings.save(ignore_permissions=True)
        frappe.db.commit()
        print("Website Settings updated successfully with home_page = 'index'")
    except Exception as e:
        print(f"Error updating Website Settings: {str(e)}")
        frappe.db.rollback()
