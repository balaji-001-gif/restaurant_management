frappe.pages["restaurant-pos"].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Restaurant POS",
        single_column: true,
    });

    $(frappe.render_template("restaurant_pos")).appendTo(page.body);
    new RestaurantPOS(page);
};

class RestaurantPOS {
    constructor(page) {
        this.page = page;
        this.order_items = {};
        this.order_type = "Dine In";
        this.selected_table = null;
        this.currency_symbol = "₹";
        this.menu_items = {};
        this.active_category = null;

        this.load_settings();
        this.setup_events();
        this.load_menu();
        this.load_tables();
    }

    load_settings() {
        frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Restaurant Settings" },
            async: false,
            callback: (r) => {
                if (r.message) {
                    this.currency_symbol = r.message.default_currency_symbol || "₹";
                }
            },
        });
    }

    setup_events() {
        // Order type toggle
        $(".btn-order-type").on("click", (e) => {
            $(".btn-order-type").removeClass("active");
            $(e.currentTarget).addClass("active");
            this.order_type = $(e.currentTarget).data("type");

            if (this.order_type === "Parcel") {
                $("#table-selector").hide();
                this.selected_table = null;
            } else {
                $("#table-selector").show();
            }
        });

        // Table selector
        $("#table-selector").on("change", (e) => {
            this.selected_table = $(e.currentTarget).val();
        });

        // Menu search
        $("#menu-search").on("input", (e) => {
            this.filter_menu($(e.currentTarget).val());
        });

        // Clear order
        $("#btn-clear-order").on("click", () => {
            this.clear_order();
        });

        // Place order
        $("#btn-save-order").on("click", () => {
            this.place_order();
        });
    }

    load_menu() {
        frappe.call({
            method: "restaurant_management.restaurant_management.api.get_menu_items",
            callback: (r) => {
                if (r.message) {
                    this.menu_items = r.message;
                    this.render_categories();
                    // Select first category
                    let first_cat = Object.keys(this.menu_items)[0];
                    if (first_cat) {
                        this.active_category = first_cat;
                        this.render_menu_items(first_cat);
                    }
                }
            },
        });
    }

    load_tables() {
        frappe.call({
            method: "restaurant_management.restaurant_management.api.get_tables",
            callback: (r) => {
                if (r.message) {
                    let $select = $("#table-selector");
                    $select.find("option:not(:first)").remove();

                    r.message.forEach((table) => {
                        if (table.status === "Available") {
                            $select.append(
                                `<option value="${table.name}">Table ${table.table_number} (${table.seating_capacity} seats)</option>`
                            );
                        }
                    });

                    // Render table overview
                    this.render_tables(r.message);
                }
            },
        });
    }

    render_categories() {
        let $container = $("#menu-categories");
        $container.empty();

        Object.keys(this.menu_items).forEach((category) => {
            let count = this.menu_items[category].length;
            $container.append(`
				<button class="btn btn-category ${category === this.active_category ? 'active' : ''}"
						data-category="${category}">
					${category} <span class="badge">${count}</span>
				</button>
			`);
        });

        $container.on("click", ".btn-category", (e) => {
            $(".btn-category").removeClass("active");
            $(e.currentTarget).addClass("active");
            let cat = $(e.currentTarget).data("category");
            this.active_category = cat;
            this.render_menu_items(cat);
        });
    }

    render_menu_items(category) {
        let $container = $("#menu-items");
        $container.empty();

        let items = this.menu_items[category] || [];
        items.forEach((item) => {
            $container.append(`
				<div class="menu-item-card" data-item="${item.name}">
					${item.image ? `<div class="item-image" style="background-image:url(${item.image})"></div>` : '<div class="item-image item-placeholder"><i class="fa fa-utensils"></i></div>'}
					<div class="item-info">
						<div class="item-name">${item.item_name}</div>
						${item.description ? `<div class="item-desc">${item.description}</div>` : ''}
						<div class="item-price">${this.currency_symbol}${parseFloat(item.price).toFixed(2)}</div>
					</div>
					<button class="btn btn-add-item" data-item="${item.name}" data-name="${item.item_name}" data-price="${item.price}">
						<i class="fa fa-plus"></i>
					</button>
				</div>
			`);
        });

        $container.on("click", ".btn-add-item, .menu-item-card", (e) => {
            e.stopPropagation();
            let $card = $(e.currentTarget).closest(".menu-item-card");
            let item_id = $card.data("item");
            let $btn = $card.find(".btn-add-item");
            let item_name = $btn.data("name");
            let price = parseFloat($btn.data("price"));
            this.add_item(item_id, item_name, price);
        });
    }

    filter_menu(search_text) {
        search_text = search_text.toLowerCase();
        if (!search_text) {
            if (this.active_category) {
                this.render_menu_items(this.active_category);
            }
            return;
        }

        let $container = $("#menu-items");
        $container.empty();

        Object.values(this.menu_items).flat().forEach((item) => {
            if (item.item_name.toLowerCase().includes(search_text)) {
                $container.append(`
					<div class="menu-item-card" data-item="${item.name}">
						${item.image ? `<div class="item-image" style="background-image:url(${item.image})"></div>` : '<div class="item-image item-placeholder"><i class="fa fa-utensils"></i></div>'}
						<div class="item-info">
							<div class="item-name">${item.item_name}</div>
							<div class="item-price">${this.currency_symbol}${parseFloat(item.price).toFixed(2)}</div>
						</div>
						<button class="btn btn-add-item" data-item="${item.name}" data-name="${item.item_name}" data-price="${item.price}">
							<i class="fa fa-plus"></i>
						</button>
					</div>
				`);
            }
        });
    }

    add_item(item_id, item_name, price) {
        if (this.order_items[item_id]) {
            this.order_items[item_id].quantity += 1;
        } else {
            this.order_items[item_id] = {
                menu_item: item_id,
                item_name: item_name,
                price: price,
                quantity: 1,
            };
        }
        this.render_order();
    }

    remove_item(item_id) {
        delete this.order_items[item_id];
        this.render_order();
    }

    update_quantity(item_id, delta) {
        if (this.order_items[item_id]) {
            this.order_items[item_id].quantity += delta;
            if (this.order_items[item_id].quantity <= 0) {
                delete this.order_items[item_id];
            }
        }
        this.render_order();
    }

    render_order() {
        let $container = $("#order-items");
        $container.empty();

        let items = Object.values(this.order_items);
        if (items.length === 0) {
            $container.html(`
				<div class="empty-order">
					<i class="fa fa-shopping-cart fa-3x"></i>
					<p>No items added yet</p>
				</div>
			`);
            $("#order-count").text("0 items");
            $("#order-total").text(`${this.currency_symbol}0.00`);
            return;
        }

        let total = 0;
        let total_qty = 0;

        items.forEach((item) => {
            let amount = item.price * item.quantity;
            total += amount;
            total_qty += item.quantity;

            $container.append(`
				<div class="order-item" data-item="${item.menu_item}">
					<div class="order-item-info">
						<div class="order-item-name">${item.item_name}</div>
						<div class="order-item-price">${this.currency_symbol}${item.price.toFixed(2)} each</div>
					</div>
					<div class="order-item-qty">
						<button class="btn btn-qty btn-minus" data-item="${item.menu_item}">−</button>
						<span class="qty-value">${item.quantity}</span>
						<button class="btn btn-qty btn-plus" data-item="${item.menu_item}">+</button>
					</div>
					<div class="order-item-amount">${this.currency_symbol}${amount.toFixed(2)}</div>
					<button class="btn btn-remove" data-item="${item.menu_item}">
						<i class="fa fa-times"></i>
					</button>
				</div>
			`);
        });

        // Bind events
        $container.find(".btn-minus").on("click", (e) => {
            this.update_quantity($(e.currentTarget).data("item"), -1);
        });
        $container.find(".btn-plus").on("click", (e) => {
            this.update_quantity($(e.currentTarget).data("item"), 1);
        });
        $container.find(".btn-remove").on("click", (e) => {
            this.remove_item($(e.currentTarget).data("item"));
        });

        $("#order-count").text(`${total_qty} items`);
        $("#order-total").text(`${this.currency_symbol}${total.toFixed(2)}`);
    }

    clear_order() {
        this.order_items = {};
        this.render_order();
    }

    place_order() {
        let items = Object.values(this.order_items);
        if (items.length === 0) {
            frappe.msgprint(__("Please add at least one item"));
            return;
        }

        if (this.order_type === "Dine In" && !this.selected_table) {
            frappe.msgprint(__("Please select a table for dine-in orders"));
            return;
        }

        let order_items = items.map((item) => ({
            menu_item: item.menu_item,
            quantity: item.quantity,
        }));

        frappe.call({
            method: "restaurant_management.restaurant_management.api.create_order",
            args: {
                items: JSON.stringify(order_items),
                order_type: this.order_type,
                table: this.selected_table || "",
            },
            callback: (r) => {
                if (r.message) {
                    frappe.show_alert({
                        message: __("Order {0} placed successfully!", [r.message]),
                        indicator: "green",
                    });
                    this.clear_order();
                    this.load_tables();

                    // Ask if user wants to print
                    frappe.confirm(
                        __("Order placed! Do you want to print the KOT?"),
                        () => {
                            frappe.call({
                                method: "restaurant_management.restaurant_management.api.get_kot_data",
                                args: { order_name: r.message },
                                callback: (res) => {
                                    if (res.message) {
                                        let w = window.open();
                                        w.document.write(res.message);
                                        w.document.close();
                                        w.print();
                                    }
                                },
                            });
                        }
                    );
                }
            },
        });
    }

    render_tables(tables) {
        let $grid = $("#tables-grid");
        $grid.empty();
        $("#tables-section").show();

        tables.forEach((table) => {
            let status_class = table.status.toLowerCase().replace(" ", "-");
            let order_info = "";

            if (table.current_order && table.order_items && table.order_items.length > 0) {
                let items_list = table.order_items
                    .map((item) => `${item.item_name} x${item.quantity}`)
                    .join(", ");
                order_info = `
					<div class="table-order-info">
						<div class="table-order-items">${items_list}</div>
						<div class="table-order-total">${this.currency_symbol}${parseFloat(table.order_total).toFixed(2)}</div>
					</div>
				`;
            }

            $grid.append(`
				<div class="table-card ${status_class}" data-table="${table.name}">
					<div class="table-number">Table ${table.table_number}</div>
					<div class="table-status">${table.status}</div>
					<div class="table-capacity"><i class="fa fa-chair"></i> ${table.seating_capacity}</div>
					${order_info}
					${table.status === "Occupied" ? `
						<div class="table-actions">
							<button class="btn btn-sm btn-clear-table" data-table="${table.name}" data-number="${table.table_number}">
								<i class="fa fa-check"></i> Clear
							</button>
							<button class="btn btn-sm btn-view-order" data-order="${table.current_order}">
								<i class="fa fa-eye"></i> View
							</button>
						</div>
					` : ''}
				</div>
			`);
        });

        // Bind events
        $grid.find(".btn-clear-table").on("click", (e) => {
            e.stopPropagation();
            let table_name = $(e.currentTarget).data("table");
            let table_number = $(e.currentTarget).data("number");

            frappe.confirm(
                __("Clear Table {0} and complete the order?", [table_number]),
                () => {
                    frappe.call({
                        method: "restaurant_management.restaurant_management.api.clear_table",
                        args: { table_name: table_name },
                        callback: (r) => {
                            if (r.message && r.message.status === "success") {
                                frappe.show_alert({
                                    message: r.message.message,
                                    indicator: "green",
                                });
                                this.load_tables();
                            }
                        },
                    });
                }
            );
        });

        $grid.find(".btn-view-order").on("click", (e) => {
            e.stopPropagation();
            let order_name = $(e.currentTarget).data("order");
            frappe.set_route("Form", "Restaurant Order", order_name);
        });
    }
}
