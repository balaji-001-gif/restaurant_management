import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def update_delivery_boy_location(delivery_boy, latitude, longitude):
	"""
	API for delivery boys to update their current location.
	Called from a mobile app or browser-based tracking script.
	"""
	if not delivery_boy or not latitude or not longitude:
		frappe.throw(_("Missing required parameters: delivery_boy, latitude, longitude"))
	
	try:
		# Update the delivery boy record
		frappe.db.set_value("Restaurant Delivery Boy", delivery_boy, {
			"last_latitude": float(latitude),
			"last_longitude": float(longitude),
			"last_location_update": now_datetime()
		}, update_modified=True)
		
		return {"status": "success", "message": _("Location updated successfully")}
	except Exception as e:
		frappe.log_error(f"Failed to update delivery boy location: {str(e)}", "Delivery Tracking")
		return {"status": "error", "message": str(e)}

@frappe.whitelist(allow_guest=True)
def get_delivery_location(order_name):
	"""
	API for customers to get the live location of their delivery boy.
	"""
	order = frappe.db.get_value("Restaurant Order", order_name, ["delivery_boy", "delivery_status", "branch"], as_dict=True)
	
	if not order:
		frappe.throw(_("Order not found"))
	
	if not order.delivery_boy:
		return {"status": "pending", "message": _("Delivery boy not yet assigned")}
	
	dboy_data = frappe.db.get_value("Restaurant Delivery Boy", order.delivery_boy, 
		["last_latitude", "last_longitude", "last_location_update", "full_name", "phone"], as_dict=True)
	
	branch_data = frappe.db.get_value("Restaurant Branch", order.branch, ["latitude", "longitude", "branch_name"], as_dict=True)
	
	return {
		"status": order.delivery_status,
		"delivery_boy": dboy_data,
		"branch": branch_data,
		"order_name": order_name
	}

@frappe.whitelist(allow_guest=True)
def get_delivery_boy_assignments(delivery_boy):
	"""
	Get list of active assignments for a delivery boy to show on their dashboard.
	"""
	if not delivery_boy:
		return []
		
	orders = frappe.get_all("Restaurant Order", 
		filters={
			"delivery_boy": delivery_boy,
			"delivery_status": ["in", ["Assigned", "Out for Delivery"]],
			"status": ["not in", ["Completed", "Cancelled"]]
		},
		fields=["name", "delivery_status", "delivery_address", "delivery_latitude", "delivery_longitude", "total_amount", "customer_name"]
	)
	
	return orders

