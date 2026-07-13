# Copyright (c) 2026, Restaurant Management and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


from frappe.utils import get_url

class RestaurantTable(Document):
	def before_save(self):
		base_url = get_url()
		# Format: /restaurant/order?table=TableName
		self.qr_ordering_url = f"{base_url}/restaurant/order?table={frappe.utils.data.quote(self.name)}"

		# Set QR Code display HTML
		qr_api = f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={frappe.utils.data.quote(self.qr_ordering_url)}"
		self.qr_code_display = f'<div style="text-align: center; padding: 10px; background: #fff; border-radius: 8px; display: inline-block;"><img src="{qr_api}" alt="QR Code" /><p style="margin-top: 5px; font-weight: bold; color: #333;">Table QR Code</p></div>'

	def validate(self):
		if self.status == "Available":
			self.current_order = None

	def clear_table(self):
		"""Clear the table and mark it as available."""
		if self.current_order:
			order = frappe.get_doc("Restaurant Order", self.current_order)
			if order.status == "In Progress":
				order.status = "Completed"
				order.save(ignore_permissions=True)

		self.status = "Available"
		self.current_order = None
		self.save(ignore_permissions=True)
