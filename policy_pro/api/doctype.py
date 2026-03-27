import frappe
import json
from policy_pro.api.utils import create_response

@frappe.whitelist()
def list_info():
    try:
        # Fetch doctype, fields, and filters from the request
        doctype = frappe.local.form_dict.get("doctype")
        getFields = frappe.local.form_dict.get("fields") or None

        # Fetch meta
        meta = frappe.get_meta(doctype)
        fields = meta.get("fields")
        filtered_fields = []
        for field in fields:
            field_dict = field.as_dict()
            if getFields:
                if field_dict.fieldname in getFields:
                    if field_dict.fieldtype == 'Link':
                        subMeta = frappe.get_meta(field.options)
                        subFields = ["name"]
                        subTitel = None
                        if subMeta.as_dict()['title_field']:
                            subTitel = subMeta.as_dict()['title_field']
                            subFields.append(subTitel)
                        options_lists = frappe.get_all(field.options, fields=subFields)
                        converted_options_lists = []
                        for item in options_lists:
                            converted_options_lists.append({
                                'value': item['name'],
                                'label':  item[subTitel] if subTitel else item['name']
                            })
                        field_dict['options_list'] = converted_options_lists
                        field_dict['title_field'] = subTitel
                    if field_dict.fieldtype == 'Table MultiSelect':
                        subMeta = frappe.get_meta(field.options)
                        subFields = ["name"]
                        subTitel = None
                        if subMeta.as_dict()['title_field']:
                            subTitel = subMeta.as_dict()['title_field']
                            subFields.append(subTitel)
                        doc_type = field.options 
                        doc_type = doc_type.replace(" Detail", "")
                        options_lists = frappe.get_all(doc_type, fields=subFields)
                        converted_options_lists = []
                        for item in options_lists:
                            converted_options_lists.append({
                                'value': item['name'],
                                'label':  item[subTitel] if subTitel else item['name']
                            })
                        field_dict['options_list'] = converted_options_lists
                        field_dict['title_field'] = subTitel
                    if field_dict.fieldtype == 'Table':
                        subMeta = frappe.get_meta(field.options)
                        sub_fields = subMeta.as_dict()['fields']
                        converted_sub_fields = []
                        for item in sub_fields:
                            converted_sub_fields.append({
                                'fieldname': item['fieldname'],
                                'fieldtype': item['fieldtype'],
                                'options': item['options'] if item['options'] else None
                            })
                        field_dict['sub_fields'] = converted_sub_fields
                    filtered_fields.append(field_dict)
            else:
                if field_dict.fieldtype == 'Link':
                        subMeta = frappe.get_meta(field.options)
                        subFields = ["name"]
                        subTitel = None
                        if subMeta.as_dict()['title_field']:
                            subTitel = subMeta.as_dict()['title_field']
                            subFields.append(subTitel)
                        options_lists = frappe.get_all(field.options, fields=subFields)
                        converted_options_lists = []
                        for item in options_lists:
                            converted_options_lists.append({
                                'value': item['name'],
                                'label':  item[subTitel] if subTitel else item['name']
                            })
                        field_dict['options_list'] = converted_options_lists
                        field_dict['title_field'] = subTitel
                if field_dict.fieldtype == 'Table MultiSelect':
                        subMeta = frappe.get_meta(field.options)
                        subFields = ["name"]
                        subTitel = None
                        if subMeta.as_dict()['title_field']:
                            subTitel = subMeta.as_dict()['title_field']
                            subFields.append(subTitel)
                        doc_type = field.options 
                        doc_type = doc_type.replace(" Detail", "")
                        options_lists = frappe.get_all(doc_type, fields=subFields)
                        converted_options_lists = []
                        for item in options_lists:
                            converted_options_lists.append({
                                'value': item['name'],
                                'label':  item[subTitel] if subTitel else item['name']
                            })
                        field_dict['options_list'] = converted_options_lists
                        field_dict['title_field'] = subTitel
                filtered_fields.append(field_dict)

        # Send response
        meta_dict = meta.as_dict()
        create_response(
            200,
            f"{doctype} field info fetched!",
            {"fields": filtered_fields, "field_order": meta_dict.get("field_order"), "is_submittable": meta_dict.get("is_submittable")},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

@frappe.whitelist()
def list_data():
    try:
        # Fetch doctype, fields, and filters from the request
        doctype = frappe.local.form_dict.get("doctype")
        fields = frappe.local.form_dict.get("fields") or []
        filters = frappe.local.form_dict.get("filters") or []
        or_filters = frappe.local.form_dict.get("or_filters") or []
        page = int(frappe.local.form_dict.get("page", 1))
        page_length = int(frappe.local.form_dict.get("page_length", 10))
        order_by = frappe.local.form_dict.get("order_by") or "modified desc"
        
        # Parse JSON strings if they are strings
        if isinstance(fields, str):
            try:
                fields = json.loads(fields)
            except json.JSONDecodeError:
                fields = []
        if isinstance(filters, str):
            try:
                filters = json.loads(filters)
            except json.JSONDecodeError:
                filters = []
        if isinstance(or_filters, str):
            try:
                or_filters = json.loads(or_filters)
            except json.JSONDecodeError:
                or_filters = []

        # Fetch data
        counts = frappe.get_all(
            doctype,
            filters=filters,
            or_filters=or_filters,
            fields=[{"COUNT": "*", "as": "count"}],
        )

        data = frappe.get_all(
            doctype,
            filters=filters,
            or_filters=or_filters,
            fields=fields,
            order_by=order_by,
            start=(page - 1) * page_length,
            limit_page_length=page_length,
        )

        # Fetch linked field values
        enhanced_data = []
        for record in data:
            enhanced_record = record.copy()
            for field, value in record.items():
                # Check if the field is a link field
                field_meta = frappe.get_meta(doctype).get_field(field)
                if field_meta and field_meta.fieldtype == "Link":
                    # Fetch the linked document name or value
                    linked_doctype = field_meta.options
                    if linked_doctype and value:
                        link_data = frappe.db.get_value(linked_doctype,value,["*"],as_dict=True)
                        if link_data:
                            enhanced_record[linked_doctype] = link_data
                            # enhanced_record['bb'] = field_meta

            enhanced_record["id"] = enhanced_record.name
            enhanced_data.append(enhanced_record)

        # Send response
        create_response(
            200,
            f"{doctype} list successfully fetched!",
            {"counts": counts[0]["count"], "data": enhanced_data},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

@frappe.whitelist()
def single_data():
    try:
        # Fetch doctype and id from the request
        doctype = frappe.local.form_dict.get("doctype")
        id = frappe.local.form_dict.get("id")

        if not id:
            create_response(400, "ID is required", {})
            return

        # Get the complete document
        record = frappe.get_doc(doctype, id)
        result = record.as_dict()

        # Get meta information for the doctype
        meta = frappe.get_meta(doctype)
        
        # Process each field
        for field in meta.fields:
            field_value = result.get(field.fieldname)
            
            # Handle Link type fields
            if field.fieldtype == "Link" and field_value:
                linked_doctype = field.options
                if linked_doctype:
                    link_data = frappe.db.get_value(linked_doctype, field_value, ["*"], as_dict=True)
                    if link_data:
                        result[field.fieldname + "_data"] = link_data
            
            # Handle Table type fields
            elif field.fieldtype == "Table" and field_value:
                table_doctype = field.options
                if table_doctype:
                    table_meta = frappe.get_meta(table_doctype)
                    table_records = []
                    
                    for row in record.get(field.fieldname):
                        row_data = row.as_dict()
                        
                        # Process Link fields within table
                        for table_field in table_meta.fields:
                            if table_field.fieldtype == "Link" and row_data.get(table_field.fieldname):
                                linked_value = row_data.get(table_field.fieldname)
                                linked_doctype = table_field.options
                                link_data = frappe.db.get_value(linked_doctype, linked_value, ["*"], as_dict=True)
                                if link_data:
                                    row_data[table_field.fieldname + "_data"] = link_data
                                    
                        table_records.append(row_data)
                    
                    result[field.fieldname] = table_records

        # Send response
        create_response(
            200,
            f"{doctype} fetched successfully!",
            {"data": result},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching item list")
        create_response(500, ex)

@frappe.whitelist()
def delete_data():
    try:
        # Fetch doctype, fields, and filters from the request
        doctype = frappe.local.form_dict.get("doctype")
        ids = frappe.local.form_dict.get("ids")
        for id in ids:
            frappe.delete_doc(doctype, id)

        # Send response
        create_response(
            200,
            f"{ids} are deleted successfully!",
            {"success": True},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in deleting data")
        create_response(500, ex)

@frappe.whitelist()
def update_data():
    try:
        # Fetch doctype, name, and update data from the request
        doctype = frappe.local.form_dict.get("doctype")
        name = frappe.local.form_dict.get("name")
        update_fields = frappe.local.form_dict.get("update_fields") or {}
        
        # Handle JSON stringified update_fields
        if isinstance(update_fields, str):
            try:
                update_fields = json.loads(update_fields)
            except json.JSONDecodeError:
                create_response(400, "Invalid JSON format in update_fields", {})
                return
        
        if not name:
            create_response(400, "Name is required", {})
            return
            
        if not update_fields:
            create_response(400, "Update fields are required", {})
            return

        # Get table name from doctype
        table_name = f"tab{doctype}"
        
        # Build the SET clause for the SQL query
        set_clauses = []
        values = []
        
        # Handle if update_fields is a list of dictionaries
        if isinstance(update_fields, list):
            for update_dict in update_fields:
                for field_name, field_value in update_dict.items():
                    set_clauses.append(f"`{field_name}` = %s")
                    values.append(field_value)
        else:
            # Handle if update_fields is a single dictionary
            for field_name, field_value in update_fields.items():
                set_clauses.append(f"`{field_name}` = %s")
                values.append(field_value)
        
        # Add modified timestamp
        set_clauses.append("`modified` = %s")
        values.append(frappe.utils.now())
        
        # Build the complete SQL query
        sql_query = f"""
            UPDATE `{table_name}` 
            SET {', '.join(set_clauses)}
            WHERE `name` = %s
        """
        
        # Add the name parameter
        values.append(name)
        
        # Execute the SQL query
        frappe.db.sql(sql_query, values)
        
        # Commit the transaction
        frappe.db.commit()

        # Build list of updated field names for response
        updated_field_names = []
        if isinstance(update_fields, list):
            for update_dict in update_fields:
                updated_field_names.extend(update_dict.keys())
        else:
            updated_field_names = list(update_fields.keys())

        # Send response
        create_response(
            200,
            f"{doctype} {name} updated successfully using MySQL!",
            {"success": True, "name": name, "data": updated_field_names},
        )

    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in updating data with MySQL")
        create_response(500, ex)

@frappe.whitelist(allow_guest=True)
def create_lead_with_customer():
    """
    Create a Lead with Customer and Car Profiles in a single transaction.
    This endpoint handles the complete lead creation flow:
    1. Create Customer
    2. Create Lead with Customer reference
    3. Update Customer with Lead reference
    4. Create all Car Profiles
    
    This endpoint is whitelisted to allow guest users (public access).
    """
    try:
        # Get form data from request
        form_data = frappe.local.form_dict.get("form_data")
        car_profiles = frappe.local.form_dict.get("car_profiles") or []
        username = frappe.session.user or "Guest"
        
        # Parse JSON strings if they are strings
        if isinstance(form_data, str):
            try:
                form_data = json.loads(form_data)
            except json.JSONDecodeError:
                create_response(400, "Invalid JSON format in form_data", {})
                return
        
        if isinstance(car_profiles, str):
            try:
                car_profiles = json.loads(car_profiles)
            except json.JSONDecodeError:
                car_profiles = []
        
        # Validate: at least one car profile is required
        # if not car_profiles or len(car_profiles) == 0:
        #     create_response(400, "Please add at least one Car Profile before creating the lead.", {})
        #     return
        
        # Validate required fields
        if not form_data:
            create_response(400, "Form data is required", {})
            return
        
        # Step 1: Create Customer
        customer_name = f"{form_data.get('first_name', '')} {form_data.get('last_name', '')}".strip() or 'Customer'
        customer_data = {
            "doctype": "Customer",
            "customer_name": customer_name,
            "customer_type": "Individual",
            "email_id": form_data.get("email_id") or "",
            "mobile_no": form_data.get("mobile_no") or ""
        }
        
        customer_doc = frappe.get_doc(customer_data)
        customer_doc.flags.ignore_mandatory = True
        customer_doc.insert(ignore_permissions=True)
        customer_id = customer_doc.name
        frappe.db.commit()
        
        # Step 2: Create Lead with Customer id and status="Open"
        lead_data = {
            "doctype": "Lead",
            "first_name": form_data.get("first_name") or "",
            "last_name": form_data.get("last_name") or "",
            "email_id": form_data.get("email_id") or "",
            "mobile_no": form_data.get("mobile_no") or "",
            "customer": customer_id,
            "status": "Open",
            "custom_assigned_user": username,
            "custom_lead_status": "New"
        }
        
        # Add optional fields if they exist
        if form_data.get("source"):
            lead_data["source"] = form_data.get("source")
        if form_data.get("custom_next_follow_up_date"):
            lead_data["custom_next_follow_up_date"] = form_data.get("custom_next_follow_up_date")
        
        lead_doc = frappe.get_doc(lead_data)
        lead_doc.flags.ignore_mandatory = True
        lead_doc.insert(ignore_permissions=True)
        lead_id = lead_doc.name
        frappe.db.commit()
        
        # Step 3: Update customer with lead id
        customer_doc.lead_name = lead_id
        customer_doc.save(ignore_permissions=True)
        frappe.db.commit()
        
        # Step 4: Create all Car Profiles
        created_car_profiles = []
        for car_profile in car_profiles:
            car_profile_data = {
                "doctype": "Car Profile",
                "customer": customer_id,
                "lead": lead_id,
                "status": "New"
            }
            
            # Copy all fields from car_profile to car_profile_data
            for key, value in car_profile.items():
                if key not in ["doctype", "customer", "lead", "status"]:
                    car_profile_data[key] = value
            
            car_profile_doc = frappe.get_doc(car_profile_data)
            car_profile_doc.flags.ignore_mandatory = True
            car_profile_doc.insert(ignore_permissions=True)
            created_car_profiles.append(car_profile_doc.name)
        
        frappe.db.commit()
        
        # Return success response
        create_response(
            200,
            "Lead created successfully with Customer and Car Profiles",
            {
                "customer_id": customer_id,
                "lead_id": lead_id,
                "car_profile_ids": created_car_profiles
            }
        )
        
    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in creating lead with customer")
        create_response(500, f"Error creating lead: {str(ex)}", {})

@frappe.whitelist(allow_guest=True)
def create_customer():
    """
    Create a Customer document.
    This endpoint is whitelisted to allow guest users (public access).
    """
    try:
        # Get customer data from request
        customer_data = frappe.local.form_dict.get("customer_data") or frappe.local.form_dict
        
        # Parse JSON string if it's a string
        if isinstance(customer_data, str):
            try:
                customer_data = json.loads(customer_data)
            except json.JSONDecodeError:
                create_response(400, "Invalid JSON format in customer_data", {})
                return
        
        # Validate required fields
        if not customer_data:
            create_response(400, "Customer data is required", {})
            return
        
        # Prepare customer document
        doc_data = {
            "doctype": "Customer",
            "customer_name": customer_data.get("customer_name") or "Customer",
            "customer_type": customer_data.get("customer_type") or "Individual",
            "email_id": customer_data.get("email_id") or "",
            "mobile_no": customer_data.get("mobile_no") or ""
        }
        
        # Add any additional fields
        for key, value in customer_data.items():
            if key not in ["doctype"] and value is not None:
                doc_data[key] = value
        
        customer_doc = frappe.get_doc(doc_data)
        customer_doc.flags.ignore_mandatory = True
        customer_doc.insert(ignore_permissions=True)
        frappe.db.commit()
        
        create_response(
            200,
            "Customer created successfully",
            {
                "customer_id": customer_doc.name,
                "customer_name": customer_doc.customer_name
            }
        )
        
    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in creating customer")
        create_response(500, f"Error creating customer: {str(ex)}", {})

@frappe.whitelist(allow_guest=True)
def create_lead():
    """
    Create a Lead document.
    This endpoint is whitelisted to allow guest users (public access).
    """
    try:
        # Get lead data from request
        lead_data = frappe.local.form_dict.get("lead_data") or frappe.local.form_dict
        username = frappe.local.form_dict.get("username") or frappe.session.user or "Guest"
        
        # Parse JSON string if it's a string
        if isinstance(lead_data, str):
            try:
                lead_data = json.loads(lead_data)
            except json.JSONDecodeError:
                create_response(400, "Invalid JSON format in lead_data", {})
                return
        
        # Validate required fields
        if not lead_data:
            create_response(400, "Lead data is required", {})
            return
        
        # Prepare lead document
        doc_data = {
            "doctype": "Lead",
            "first_name": lead_data.get("first_name") or "",
            "last_name": lead_data.get("last_name") or "",
            "email_id": lead_data.get("email_id") or "",
            "mobile_no": lead_data.get("mobile_no") or "",
            "status": lead_data.get("status") or "Open",
            "custom_assigned_user": username,
            "custom_lead_status": lead_data.get("custom_lead_status") or "New"
        }
        
        # Add customer if provided
        if lead_data.get("customer"):
            doc_data["customer"] = lead_data.get("customer")
        
        # Add any additional fields
        for key, value in lead_data.items():
            if key not in ["doctype"] and value is not None and key not in doc_data:
                doc_data[key] = value
        
        lead_doc = frappe.get_doc(doc_data)
        lead_doc.flags.ignore_mandatory = True
        lead_doc.insert(ignore_permissions=True)
        frappe.db.commit()
        
        create_response(
            200,
            "Lead created successfully",
            {
                "lead_id": lead_doc.name,
                "lead_name": lead_doc.lead_name if hasattr(lead_doc, "lead_name") else f"{lead_doc.first_name} {lead_doc.last_name}".strip()
            }
        )
        
    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in creating lead")
        create_response(500, f"Error creating lead: {str(ex)}", {})

@frappe.whitelist(allow_guest=True)
def create_cod_management():
    """
    Create a COD Management document.
    This endpoint is whitelisted to allow guest users (public access).
    """
    try:
        # Get COD Management data from request
        cod_data = frappe.local.form_dict.get("cod_data") or frappe.local.form_dict
        
        # Parse JSON string if it's a string
        if isinstance(cod_data, str):
            try:
                cod_data = json.loads(cod_data)
            except json.JSONDecodeError:
                create_response(400, "Invalid JSON format in cod_data", {})
                return
        
        # Validate required fields
        if not cod_data:
            create_response(400, "COD Management data is required", {})
            return
        
        # Validate mandatory fields
        required_fields = ["lead", "car_profile", "policy_name", "file_attachment", "approval_manager"]
        missing_fields = [field for field in required_fields if not cod_data.get(field)]
        if missing_fields:
            create_response(400, f"Missing required fields: {', '.join(missing_fields)}", {})
            return
        
        # Prepare COD Management document
        doc_data = {
            "doctype": "COD Management",
            "lead": cod_data.get("lead"),
            "customer": cod_data.get("customer"),
            "car_profile": cod_data.get("car_profile"),
            "policy_name": cod_data.get("policy_name"),
            "policy_amount": cod_data.get("policy_amount") or 0,
            "status": cod_data.get("status") or "Waiting",
            "type": cod_data.get("type") or "New",
            "file_attachment": cod_data.get("file_attachment"),
            "approval_manager": cod_data.get("approval_manager"),
            "comments": cod_data.get("comments") or ""
        }
        
        cod_doc = frappe.get_doc(doc_data)
        cod_doc.flags.ignore_mandatory = True
        cod_doc.insert(ignore_permissions=True)
        frappe.db.commit()
        
        create_response(
            200,
            "COD Management created successfully",
            {
                "cod_id": cod_doc.name,
                "lead": cod_doc.lead,
                "customer": cod_doc.customer,
                "car_profile": cod_doc.car_profile
            }
        )
        
    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in creating COD Management")
        create_response(500, f"Error creating COD Management: {str(ex)}", {})

@frappe.whitelist(allow_guest=True)
def update_cod_management():
    """
    Update a COD Management document.
    This endpoint is whitelisted to allow guest users (public access).
    """
    try:
        # Get COD Management data and id from request
        cod_data = frappe.local.form_dict.get("cod_data") or frappe.local.form_dict
        cod_id = frappe.local.form_dict.get("id") or cod_data.get("id")
        
        # Parse JSON string if it's a string
        if isinstance(cod_data, str):
            try:
                cod_data = json.loads(cod_data)
            except json.JSONDecodeError:
                create_response(400, "Invalid JSON format in cod_data", {})
                return
        
        # Validate required fields
        if not cod_id:
            create_response(400, "COD Management ID is required", {})
            return
        
        if not cod_data:
            create_response(400, "COD Management data is required", {})
            return
        
        # Check if document exists
        if not frappe.db.exists("COD Management", cod_id):
            create_response(404, f"COD Management with ID {cod_id} not found", {})
            return
        
        # Get the document
        cod_doc = frappe.get_doc("COD Management", cod_id)
        
        # Update fields
        updateable_fields = [
            "car_profile", "policy_name", "policy_amount", "status", "type",
            "file_attachment", "approval_manager", "comments"
        ]
        
        for field in updateable_fields:
            if field in cod_data and cod_data[field] is not None:
                cod_doc.set(field, cod_data[field])
        
        # Validate mandatory fields are still present
        if not cod_doc.file_attachment:
            create_response(400, "File attachment is required", {})
            return
        
        cod_doc.flags.ignore_mandatory = True
        cod_doc.save(ignore_permissions=True)
        frappe.db.commit()
        
        create_response(
            200,
            "COD Management updated successfully",
            {
                "cod_id": cod_doc.name,
                "lead": cod_doc.lead,
                "customer": cod_doc.customer,
                "car_profile": cod_doc.car_profile
            }
        )
        
    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in updating COD Management")
        create_response(500, f"Error updating COD Management: {str(ex)}", {})

@frappe.whitelist(allow_guest=True)
def get_makes():
    """
    Get all Make records.
    This endpoint is whitelisted to allow guest users (public access).
    
    Returns:
        dict: List of all Make records with name and title
    """
    try:
        # Fetch all Make records
        makes = frappe.get_all(
            "Make",
            fields=["name", "title"],
            order_by="title asc"
        )
        
        create_response(
            200,
            "Makes fetched successfully",
            {"data": makes}
        )
        
    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching Makes")
        create_response(500, f"Error fetching Makes: {str(ex)}", {})

@frappe.whitelist(allow_guest=True)
def get_models():
    """
    Get all Model records.
    This endpoint is whitelisted to allow guest users (public access).
    
    Optional Parameters:
        make (str): Filter models by Make name
        year (int): Filter models by year
    
    Returns:
        dict: List of all Model records with name, title, year, and make
    """
    try:
        # Get optional filters from request
        make_filter = frappe.local.form_dict.get("make")
        year_filter = frappe.local.form_dict.get("year")
        
        # Build filters
        filters = {}
        if make_filter:
            filters["make"] = make_filter
        if year_filter:
            try:
                filters["year"] = int(year_filter)
            except (ValueError, TypeError):
                pass  # Ignore invalid year filter
        
        # Fetch all Model records
        models = frappe.get_all(
            "Model",
            fields=["name", "title", "year", "make"],
            filters=filters if filters else None,
            order_by="title asc"
        )
        
        create_response(
            200,
            "Models fetched successfully",
            {"data": models}
        )
        
    except Exception as ex:
        frappe.log_error(frappe.get_traceback(), "Error in fetching Models")
        create_response(500, f"Error fetching Models: {str(ex)}", {})