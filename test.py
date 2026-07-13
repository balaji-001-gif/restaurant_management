import frappe
from restaurant_management.restaurant_management.api import get_tables, get_menu_items

frappe.init(site="bkshop.aimaxl.com")
frappe.connect()

print("Testing get_tables with no branch:")
t1 = get_tables()
print(f"Result: {t1}")

print("\nTesting get_tables with branch:")
t2 = get_tables(branch="Some Branch")
print(f"Result: {t2}")

print("\nTesting get_tables with branch parameter as empty string:")
t3 = get_tables(branch="")
print(f"Result: {t3}")

