import frappe
from frappe.model.document import Document
from frappe.utils import get_url

class RestaurantBranch(Document):
	def before_save(self):
		base_url = get_url()
		# Format: /restaurant/order?branch=BranchName
		self.ordering_url = f"{base_url}/restaurant/order?branch={frappe.utils.data.quote(self.name)}"
