import frappe


def after_install():
	"""Create default Restaurant Tables and Settings after app installation."""
	create_default_tables()
	create_default_settings()


def create_default_tables():
	"""Create 10 default restaurant tables."""
	for i in range(1, 11):
		if not frappe.db.exists("Restaurant Table", {"table_number": i}):
			doc = frappe.get_doc({
				"doctype": "Restaurant Table",
				"table_number": i,
				"status": "Available",
				"seating_capacity": 4,
			})
			doc.insert(ignore_permissions=True)
	frappe.db.commit()


def create_default_settings():
	"""Create default Restaurant Settings if not exists."""
	if not frappe.db.exists("Restaurant Settings"):
		doc = frappe.get_doc({
			"doctype": "Restaurant Settings",
			"restaurant_name": "My Restaurant",
			"address": "Enter your restaurant address here",
			"default_currency_symbol": "₹",
			"enable_kot_printing": 1,
			"auto_create_sales_invoice": 1,
		})
		doc.insert(ignore_permissions=True)
		frappe.db.commit()
