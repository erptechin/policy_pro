import frappe
import base64
import random
from frappe.utils.password import check_password, update_password
from frappe.utils import escape_html, get_url
from policy_pro.api.utils import create_response

@frappe.whitelist(allow_guest=True)
def login(usr, pwd, device_id=None):
    # Pre-check: if the user exists and is disabled, return a clear error
    try:
        user_name = frappe.db.get_value("User", {"name": usr}, "name") or frappe.db.get_value("User", {"username": usr}, "name")
        if user_name:
            is_enabled = frappe.db.get_value("User", user_name, "enabled")
            if not is_enabled:
                frappe.clear_messages()
                frappe.local.response.http_status_code = 403
                frappe.local.response["message"] = "Your account is disabled"
                return
    except Exception:
        pass
    try:
        login_manager = frappe.auth.LoginManager()
        login_manager.authenticate(user=usr, pwd=pwd)
        # Block login if user is disabled
        is_enabled = frappe.get_value("User", login_manager.user, "enabled")
        if not is_enabled:
            frappe.clear_messages()
            frappe.local.response.http_status_code = 403
            frappe.local.response["message"] = "Your account is disabled"
            return
        login_manager.post_login()
        set_device_id(usr, device_id)
    except frappe.exceptions.AuthenticationError:
        frappe.clear_messages()
        frappe.local.response.http_status_code = 422
        frappe.local.response["message"] = "Invalid Email or Password"
        return

    user = frappe.get_doc("User", frappe.session.user)

    api_generate = generate_keys(user)

    # Update the User
    frappe.db.set_value(
        "User", frappe.session.user, {"api_key": str(api_generate["api_key"])}
    )
    frappe.db.commit()

    token_string = str(api_generate["api_key"]) + ":" + str(api_generate["api_secret"])

    # settings = frappe.get_cached_doc('Nonprofit Settings')


    frappe.response["user"] = {
        "id": escape_html(user.name or ""),
        "first_name": escape_html(user.first_name or ""),
        "last_name": escape_html(user.last_name or ""),
        "gender": escape_html(user.gender or "") or "",
        "birth_date": user.birth_date or "",
        "mobile_no": user.mobile_no or "",
        "username": user.username or "",
        "full_name": user.full_name or "",
        "email": user.email or "",
        "user_image": user.user_image,
        "user_roles": get_permissions_map(user.role_profile_name),
        "role_profiles": user.role_profiles,
        "role_profile_name": user.role_profiles[0].role_profile if user.role_profiles else None,
        # "settings": settings,
    }
    frappe.response["token"] = base64.b64encode(token_string.encode("ascii")).decode(
        "utf-8"
    )
    return

def set_device_id(user, device_id):
    """Set device ID for user (placeholder for future implementation)"""
    # Future: Implement device tracking
    pass

def generate_keys(user):
    """Generate or retrieve API keys for user"""
    if not user.api_key and not user.api_secret:
        api_secret = frappe.generate_hash(length=15)
        api_key = frappe.generate_hash(length=15)
        user.api_key = api_key
        user.api_secret = api_secret
        user.save(ignore_permissions=True)
    else:
        api_secret = user.get_password("api_secret")
        api_key = user.get("api_key")
    
    return {"api_secret": api_secret, "api_key": api_key}

def send_welcome_email(user, chapter=None, event=None):
    """Send custom welcome email to new user"""
    try:
        if not user.email:
            frappe.log_error(f"No email address found for user {user.name}")
            return
        
        # Get organization name from settings
        organization_name = "Policy Pro"
        
        # Get chapter info if chapter parameter exists
        chapter_info = None
        if chapter and frappe.db.exists("Chapter", chapter):
            try:
                chapter_doc = frappe.get_doc("Chapter", chapter)
                chapter_info = {
                    "title": chapter_doc.title,
                    "location": chapter_doc.location or "Not specified",
                    "description": chapter_doc.description or ""
                }
            except Exception as e:
                frappe.log_error(f"Error getting chapter info: {str(e)}")
        
        # Get event info if event parameter exists
        event_info = None
        if event and frappe.db.exists("My Event", event):
            try:
                event_doc = frappe.get_doc("My Event", event)
                event_date = "Not specified"
                if event_doc.event_date:
                    event_date = event_doc.event_date.strftime("%B %d, %Y")
                
                event_info = {
                    "title": event_doc.title,
                    "location": event_doc.location or "Not specified",
                    "event_date": event_date,
                    "description": event_doc.description or ""
                }
            except Exception as e:
                frappe.log_error(f"Error getting event info: {str(e)}")
        
        # Prepare email context
        context = {
            "user_name": user.full_name or user.first_name or user.email,
            "user_email": user.email,
            "role_type": user.role_profile_name or "Volunteer",
            "status": "Active",
            "organization_name": organization_name,
            "login_url": get_url("/app"),
            "chapter_info": chapter_info,
            "event_info": event_info
        }
        
        # Send custom welcome email
        frappe.sendmail(
            recipients=[user.email],
            subject=f"Welcome to {organization_name}! Your Account is Ready",
            template="welcome_new_user",
            args=context,
            header=["Welcome to Policy Pro", "blue"]
        )
        
        frappe.log_error(f"Welcome email sent to {user.email}", "Welcome Email")
        
    except Exception as e:
        frappe.log_error(f"Error sending welcome email: {str(e)}", "Welcome Email Error")

# Sign Up
@frappe.whitelist(allow_guest=True)
def sign_up():
    email = frappe.local.form_dict.email
    # password = frappe.local.form_dict.password
    first_name = frappe.local.form_dict.first_name
    last_name = frappe.local.form_dict.last_name
    mobile_no = frappe.local.form_dict.mobile_no
    gender = frappe.local.form_dict.gender
    birth_date = frappe.local.form_dict.birth_date
    chapter = frappe.local.form_dict.chapter
    event = frappe.local.form_dict.event

    # Check if user with the same email already exists
    if frappe.db.exists("User", {"email": email}):
        create_response(404, f"User with Email {email} already exists", {})
        return
    
    # Create User for the new user
    try:
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": first_name,
            "gender": gender,
            "role_profile_name": "Volunteer",
            "last_name": last_name,
            "mobile_no": mobile_no,
            # "new_password": password,
            "birth_date": birth_date,
        })
        # Disable default email notifications for user creation
        user.flags.ignore_mandatory = True
        user.flags.disable_email_notifications = True
        user.insert(ignore_permissions=True)

        # Send custom welcome email
        send_welcome_email(user, chapter, event)

        # Create Chapter Users record if chapter parameter exists
        if chapter:
            if frappe.db.exists("Chapter", chapter):
                try:
                    chapter_user = frappe.new_doc("Chapter Users")
                    chapter_user.user = user.name
                    chapter_user.chapter = chapter
                    chapter_user.role_type = "Volunteer"
                    chapter_user.status = "Active"
                    chapter_user.req_type = "Send"
                    # Disable email notifications for initial creation
                    chapter_user.flags.disable_email_notifications = True
                    chapter_user.insert(ignore_permissions=True)
                    frappe.log_error(f"Chapter Users record created for user {user.name} and chapter {chapter}", "Chapter Users Creation")
                except Exception as e:
                    frappe.log_error(f"Error creating Chapter Users record: {str(e)}", "Chapter Users Creation Error")
            else:
                frappe.log_error(f"Chapter {chapter} does not exist, skipping Chapter Users creation", "Chapter Users Creation")

        # Create Event Users record if event parameter exists
        if event:
            if frappe.db.exists("My Event", event):
                try:
                    event_user = frappe.new_doc("Event Users")
                    event_user.user = user.name
                    event_user.event = event
                    event_user.role_type = "Volunteer"
                    event_user.status = "Active"
                    event_user.req_type = "Send"
                    # Disable email notifications for initial creation
                    event_user.flags.disable_email_notifications = True
                    event_user.insert(ignore_permissions=True)
                    frappe.log_error(f"Event Users record created for user {user.name} and event {event}", "Event Users Creation")
                except Exception as e:
                    frappe.log_error(f"Error creating Event Users record: {str(e)}", "Event Users Creation Error")
            else:
                frappe.log_error(f"My Event {event} does not exist, skipping Event Users creation", "Event Users Creation")

        create_response(200, "User created successfully", user)
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "User Creation Error")
        create_response(500, f"Error creating user: {str(e)}", {})

@frappe.whitelist()
def test_welcome_email(user_email, chapter=None, event=None):
    """Test function for welcome email template"""
    try:
        user = frappe.get_doc("User", {"email": user_email})
        send_welcome_email(user, chapter, event)
        return {"status": "success", "message": "Welcome email sent successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_permissions_map(role_profile_name):
    user_roles = frappe.get_roles(frappe.session.user)
    permissions = frappe.get_all(
        "Custom DocPerm", 
        fields=["*"], 
        filters={"role": ["in", user_roles]}
    )

    permissions_by_doctype = {}
    for perm in permissions:
        doctype = perm.get('parent')
        if doctype not in permissions_by_doctype:
            permissions_by_doctype[doctype] = {}
        
        # Aggregate permissions: if any role grants a permission, it's granted (value of 1).
        for key, value in perm.items():
            if key not in ['name', 'parent', 'role', 'creation', 'modified', 'modified_by', 'owner', 'docstatus', 'idx', 'parentfield', 'parenttype']:
                if permissions_by_doctype[doctype].get(key) != 1:
                    permissions_by_doctype[doctype][key] = value

    return permissions_by_doctype

@frappe.whitelist()
def profile():
    user = frappe.get_doc("User", frappe.session.user)
    # settings = frappe.get_cached_doc('Nonprofit Settings')

    frappe.response["user"] = {
        "id": escape_html(user.name or ""),
        "first_name": escape_html(user.first_name or ""),
        "last_name": escape_html(user.last_name or ""),
        "gender": escape_html(user.gender or "") or "",
        "birth_date": user.birth_date or "",
        "mobile_no": user.mobile_no or "",
        "username": user.username or "",
        "full_name": user.full_name or "",
        "user_roles": get_permissions_map(user.role_profile_name),
        "email": user.email or "",
        "user_image": user.user_image,
        "role_profile_name": user.role_profile_name,
        # "settings": settings,
    }
    return

# Update Profile
@frappe.whitelist()
def update_profile():

    # Parameters
    user = frappe.local.form_dict.user
    first_name = frappe.local.form_dict.first_name
    last_name = frappe.local.form_dict.last_name
    mobile_no = frappe.local.form_dict.mobile_no
    user_image = frappe.local.form_dict.user_image
    gender = frappe.local.form_dict.gender
    role_profile_name = frappe.local.form_dict.role_profile_name
    birth_date = frappe.local.form_dict.birth_date

    # Check if the user is logged in
    if frappe.session.user == "Guest":
        return {
            "status": "failed",
            "message": ("You need to be logged in to change your password"),
        }

    # Validate if the user exists
    if not frappe.db.exists("User", user):
        return {"status": "failed", "message": ("User does not exist")}

    # Update the Profile
    try:
        frappe.db.set_value(
            "User", frappe.session.user, {
                "first_name": first_name,
                "last_name": last_name,
                "full_name": first_name + " " + last_name,
                "mobile_no": mobile_no,
                "gender": gender,
                "user_image": user_image,
                "role_profile_name": role_profile_name,
            }
        )
        frappe.db.commit()

        return {"status": "success", "message": ("Profile updated successfully")}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), ("Profile updated  Error"))
        return {
            "status": "failed",
            "message": ("An error occurred while updating the Profile: {0}").format(
                str(e)
            ),
        }
    
# Changes Password
@frappe.whitelist()
def change_password():
    # Parameters
    user = frappe.local.form_dict.user
    old_password = frappe.local.form_dict.old_password
    new_password = frappe.local.form_dict.new_password
    confirm_password = frappe.local.form_dict.confirm_password

    # Check if the user is logged in
    if frappe.session.user == "Guest":
        return {
            "status": "failed",
            "message": ("You need to be logged in to change your password"),
        }

    # Validate if the user exists
    if not frappe.db.exists("User", user):
        return {"status": "failed", "message": ("User does not exist")}

    # Check if old password is correct
    try:
        check_password(user, old_password)
    except frappe.exceptions.AuthenticationError:
        return {"status": "failed", "message": ("Old password is incorrect")}

    # Validate if the new password and confirm password match
    if new_password != confirm_password:
        return {
            "status": "failed",
            "message": ("New password and confirm password do not match"),
        }

    # Update the password
    try:
        update_password(user, new_password)

        return {"status": "success", "message": ("Password updated successfully")}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), ("Password Change Error"))
        return {
            "status": "failed",
            "message": ("An error occurred while updating the password: {0}").format(
                str(e)
            ),
        }
 



 # Forgot Password

@frappe.whitelist(allow_guest=True)
def forgot_password():
    # Parameters
    email = frappe.local.form_dict.email

    # Validate if the user exists
    try:
        username = frappe.get_doc("User", {"email": email})
    except frappe.DoesNotExistError:
        return {"status": "failed", "message": "User does not exist"}

    # Update the OPT
    try:
        otp = random.randint(1000, 9999)
        frappe.db.set_value(
            "User", username, {
                "otp": otp
            }
        )
        frappe.db.commit()

         # Send Email
        frappe.sendmail(
            recipients=[email],
            subject="Your OTP Code",
            template="otp_email_template",
            args={"otp": otp},
            header=["OTP Verification", "blue"]
        )

        create_response(
            200,
            "Generate OTP successfully",
            {"email": email},
        )
        return {"status": "success", "message": ("Generate OTP successfully")}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), ("Generate OTP  Error"))
        return {
            "status": "failed",
            "message": ("An error occurred while updating the Generate OTP: {0}").format(
                str(e)
            ),
        }
    
# Reset Password
@frappe.whitelist(allow_guest=True)
def reset_password():
    # Parameters
    otp = frappe.local.form_dict.otp
    email = frappe.local.form_dict.email
    new_password = frappe.local.form_dict.password
    cPassword = frappe.local.form_dict.cPassword

    # Validate if the user exists
    try:
        username = frappe.get_doc("User", {"email": email})
    except frappe.DoesNotExistError:
        return {"status": "failed", "message": "User does not exist"}

    # Validate if the OTP match
    if username.otp != otp:
        return {
            "status": "failed",
            "message": ("otp gives error"),
        }
    
    # Validate if the new password and confirm password match
    if new_password != cPassword:
        return {
            "status": "failed",
            "message": ("New password and confirm password do not match"),
        }
    
    # Update the password
    try:

        frappe.db.set_value(
            "User", username, {
                "otp": ''
            }
        )
        frappe.db.commit()

        update_password(username.name, new_password)

        return {"status": "success", "message": ("Password updated successfully")}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), ("Password Change Error"))
        return {
            "status": "failed",
            "message": ("An error occurred while updating the password: {0}").format(
                str(e)
            ),
        }
