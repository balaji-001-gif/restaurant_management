// Copyright (c) 2026, Restaurant Management and contributors
// For license information, please see license.txt

frappe.ui.form.on("Restaurant Order", {
    refresh(frm) {
        // Add custom buttons based on status
        if (frm.doc.status === "In Progress") {
            frm.add_custom_button(__("Complete Order"), function () {
                frm.set_value("status", "Completed");
                frm.save();
            }, __("Actions"));

            frm.add_custom_button(__("Cancel Order"), function () {
                frappe.confirm(
                    __("Are you sure you want to cancel this order?"),
                    function () {
                        frm.set_value("status", "Cancelled");
                        frm.save();
                    }
                );
            }, __("Actions"));

            frm.add_custom_button(__("Print KOT"), function () {
                // Open KOT print format
                frappe.call({
                    method: "restaurant_management.restaurant_management.api.get_kot_data",
                    args: { order_name: frm.doc.name },
                    callback: function (r) {
                        if (r.message) {
                            let w = window.open();
                            w.document.write(r.message);
                            w.document.close();
                            w.print();
                        }
                    }
                });
            }, __("Print"));

            frm.add_custom_button(__("Print Bill"), function () {
                frappe.call({
                    method: "restaurant_management.restaurant_management.api.get_bill_data",
                    args: { order_name: frm.doc.name },
                    callback: function (r) {
                        if (r.message) {
                            let w = window.open();
                            w.document.write(r.message);
                            w.document.close();
                            w.print();
                        }
                    }
                });
            }, __("Print"));
        }

        if (frm.doc.status === "Completed" && !frm.doc.sales_invoice) {
            frm.add_custom_button(__("Create Sales Invoice"), function () {
                frappe.call({
                    method: "restaurant_management.restaurant_management.api.create_invoice_for_order",
                    args: { order_name: frm.doc.name },
                    callback: function (r) {
                        if (r.message) {
                            frappe.msgprint(__("Sales Invoice {0} created", [r.message]));
                            frm.reload_doc();
                        }
                    }
                });
            });
        }

        // Color the status indicator
        frm.page.set_indicator(get_status_indicator(frm.doc.status));
    },

    order_type(frm) {
        if (frm.doc.order_type === "Parcel") {
            frm.set_value("table", "");
        }
    },
});

frappe.ui.form.on("Restaurant Order Item", {
    menu_item(frm, cdt, cdn) {
        let row = locals[cdt][cdn];
        if (row.menu_item) {
            frappe.db.get_value("Restaurant Menu Item", row.menu_item, "price", function (r) {
                if (r) {
                    frappe.model.set_value(cdt, cdn, "rate", r.price);
                    calculate_row_amount(frm, cdt, cdn);
                }
            });
        }
    },

    quantity(frm, cdt, cdn) {
        calculate_row_amount(frm, cdt, cdn);
    },

    rate(frm, cdt, cdn) {
        calculate_row_amount(frm, cdt, cdn);
    },

    items_remove(frm) {
        calculate_totals(frm);
    }
});

function calculate_row_amount(frm, cdt, cdn) {
    let row = locals[cdt][cdn];
    frappe.model.set_value(cdt, cdn, "amount", flt(row.rate) * cint(row.quantity));
    calculate_totals(frm);
}

function calculate_totals(frm) {
    let total_amount = 0;
    let total_qty = 0;

    (frm.doc.items || []).forEach(function (item) {
        total_amount += flt(item.amount);
        total_qty += cint(item.quantity);
    });

    frm.set_value("total_amount", total_amount);
    frm.set_value("total_qty", total_qty);
}

function get_status_indicator(status) {
    const indicators = {
        "Draft": "blue",
        "In Progress": "orange",
        "Completed": "green",
        "Cancelled": "red"
    };
    return indicators[status] || "blue";
}
