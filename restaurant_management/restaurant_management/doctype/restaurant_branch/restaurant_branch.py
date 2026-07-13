import frappe
from frappe.model.document import Document
from frappe.utils import get_url

class RestaurantBranch(Document):
	def before_save(self):
		base_url = get_url()
		# Format: /restaurant/order?branch=BranchName
		self.ordering_url = f"{base_url}/restaurant/order?branch={frappe.utils.data.quote(self.name)}"
		
		# Set QR Code display HTML
		qr_api = f"https://api.qrserver.com/v1/create-qr-code/?size=150x150&data={frappe.utils.data.quote(self.ordering_url)}"
		self.qr_code_display = f'<div style="text-align: center; padding: 10px; background: #fff; border-radius: 8px; display: inline-block;"><img src="{qr_api}" alt="QR Code" /><p style="margin-top: 5px; font-weight: bold; color: #333;">Scan to Order</p></div>'
