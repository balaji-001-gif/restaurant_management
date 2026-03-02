app_name = "restaurant_management"
app_title = "Restaurant Management"
app_publisher = "Restaurant Management"
app_description = "Restaurant Billing & Order Management for ERPNext - Dine-in & Parcel orders, KOT & Bill printing, Table management, Revenue analytics"
app_email = "info@restaurant.com"
app_license = "MIT"
app_version = "1.0.0"

# Required Apps
required_apps = ["frappe", "erpnext"]

# Includes in <head>
# ------------------

app_include_css = "/assets/restaurant_management/css/restaurant.css"
app_include_js = "/assets/restaurant_management/js/restaurant.js"

# Include js in page
# page_js = {"page" : "public/js/file.js"}

# Include css in page
# page_css = {"page" : "public/css/file.css"}

# Website
# -------
website_route_rules = []

# Installation
# ------------

# before_install = "restaurant_management.install.before_install"
after_install = "restaurant_management.install.after_install"

# Fixtures
# --------
fixtures = []

# Permissions
# -----------

has_permission = {}

# DocType Class
# ---------------

# Override standard doctype classes
override_doctype_class = {}

# Document Events
# ----------------

doc_events = {}

# Scheduled Tasks
# ----------------

scheduler_events = {}

# Jinja
# ----------

jinja = {}

# Override Methods
# ----------------

override_whitelisted_methods = {}

# Setup Wizard
# ------------

# before_wizard_complete = "restaurant_management.install.before_wizard_complete"
# after_wizard_complete = "restaurant_management.install.after_wizard_complete"
