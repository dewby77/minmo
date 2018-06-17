/*! 
 * jQuery Bootgrid v1.2.0 - 05/02/2015
 * Copyright (c) 2014-2015 Rafael Staib (http://www.jquery-bootgrid.com)
 * Licensed under MIT http://www.opensource.org/licenses/MIT
 */
; (function ($, window, undefined) {
	/*jshint validthis: true */
	"use strict";

	// GRID INTERNAL FIELDS
	// ====================

	var namespace = ".rs.jquery.bootgrid";
	var expanderColumnId = "bg-expander-column";
	var expanderRowId = "expander";

	// GRID INTERNAL FUNCTIONS
	// =====================

	function appendRow(row) {
		var that = this;

		function exists(item) {
			return that.identifier && item[that.identifier] === row[that.identifier];
		}

		if (!this.rows.contains(exists)) {
			this.rows.push(row);
			return true;
		}

		return false;
	}

	function findFooterAndHeaderItems(selector) {
		var footer = (this.footer) ? this.footer.find(selector) : $(),
			header = (this.header) ? this.header.find(selector) : $();
		return $.merge(footer, header);
	}

	function getParams(context) {
		return (context) ? $.extend({}, this.cachedParams, { ctx: context }) :
			this.cachedParams;
	}

	function getRequest() {
		var request = {
			current: this.current,
			rowCount: this.rowCount,
			sort: this.sortDictionary,
			searchPhrase: this.searchPhrase,
			filter: JSON.stringify(this.options.filterOptions.filter_rules) //this.options.filterOptions.filter_rules
		},
			post = this.options.post;

		post = ($.isFunction(post)) ? post() : post;
		return this.options.requestHandler($.extend(true, request, post));
	}

	function getCssSelector(css) {
		return "." + $.trim(css).replace(/\s+/gm, ".");
	}

	function getUrl() {
		var url = this.options.url;
		return ($.isFunction(url)) ? url() : url;
	}

	//MCCREA - METHODS USED FOR FILTER OPTIONS ADAPTED FROM JQUERY BS_GRID http://www.pontikis.net/labs/bs_grid/

	/**
	 * Create element id
	 * @function
	 * @param prefix
	 * @param plugin_container_id
	 * @return {*}
	 */
	var create_id = function (prefix, plugin_container_id) {
		return prefix + plugin_container_id;
	};

	function init() {
		this.element.trigger("initialize" + namespace);

		loadColumns.call(this); // Loads columns from HTML thead tag
		this.selection = this.options.selection && this.identifier != null;
		loadRows.call(this); // Loads rows from HTML tbody tag if ajax is false
		prepareTable.call(this);
		renderTableHeader.call(this);
		renderSearchField.call(this);
		renderActions.call(this);
		loadData.call(this);

		//McCrea - new functionality for filtering
		prepareFilter.call(this);

		//McCrea - new functionality for child rows
		if (this.options.childRowSettings.loadExpanded) {
			$(".btn-exp").each(function (i, obj) {
				alert("hi");
				$(obj).trigger("click");
			});
		}

		this.element.trigger("initialized" + namespace);
	}

	function highlightAppendedRows(rows) {
		if (this.options.highlightRows) {
			// todo: implement
		}
	}

	function isVisible(column) {
		return column.visible;
	}

	//McCrea - new function for hide feature
	function isHidden(column) {
		return column.hide;
	}

	//McCrea - new function for filtering
	function prepareFilter() {
		var that = this;

		if (that.options.useFilters) {
			var container_id = that.element._bgId(),
				filter_container_id = create_id(that.options.filterOptions.filter_container_id_prefix, container_id),
				filter_rules_id = create_id(that.options.filterOptions.filter_rules_id_prefix, container_id),
				filter_tools_id = create_id(that.options.filterOptions.filter_tools_id_prefix, container_id);
			if ($('#' + filter_container_id)) {
				$('#' + filter_container_id).remove();
			}

			var elem_html = "";

			elem_html += '<div id="' + filter_container_id + '" class="' + that.options.filterOptions.filterContainerClass + '">';

			elem_html += '<div id="' + filter_rules_id + '"></div>';

			elem_html += '<div id="' + filter_tools_id + '" class="' + that.options.filterOptions.filterToolsClass + '">';
			elem_html += '<button type="button" class="' + that.options.filterOptions.filterApplyBtnClass + '">Apply</button>';
			elem_html += '<button type="button" class="' + that.options.filterOptions.filterResetBtnClass + '">Reset</button>';

			if (that.options.filterOptions.allowSave) {
				elem_html += '<button type="button" class="' + that.options.filterOptions.filterSaveBtnClass + '">Save</button>';
			}

			elem_html += '</div>';

			$(elem_html).insertBefore("#" + container_id);

			var elem_filter_container = $("#" + filter_container_id),
			elem_filter_rules = $("#" + filter_rules_id),
			elem_filter_tools = $("#" + filter_tools_id);

			// initialize jui_filter_rules plugin ----------------------
			var filter_options = that.options.filterOptions; //TODO: might only want to pass filters in
			filter_options = $.extend({}, filter_options);
			elem_filter_rules.jui_filter_rules(filter_options);

			if (filter_options.filter_rules.length > 0) {
				elem_filter_container.show();
			} else {
				elem_filter_container.hide();
			}

			/* filter tools */
			elem_filter_tools.off("click", "button").on("click", "button", function () {

				var btn_index = $(this).index(),
					a_rules = elem_filter_rules.jui_filter_rules("getRules", 0, []);

				if (a_rules == false) {
					if (btn_index === 2) {
						//if we are the save, send feedback

						//need to allow the callback - strange behavior that it must be in this timeout function
						window.setTimeout(function () { that.element.trigger("saveFilter" + namespace); }, 10);
					}
					return false;
				}

				switch (btn_index) {
					case 0:
						//elem_filter_rules.jui_filter_rules("markAllRulesAsApplied");
						that.options.filterOptions.filter_rules = a_rules; //TODO: strange to me they use settings to hold the set of rules

						//TODO: might have to add more reset logic here down the road
						// Reset selected rows

						that.current = 1;
						loadData.call(that);

						break;
					case 1:
						elem_filter_rules.jui_filter_rules("clearAllRules");
						that.options.filterOptions.filter_rules = []; //TODO: strange to me they use settings to hold the set of rules

						that.current = 1;
						loadData.call(that);

						//need to allow the callback - strange behavior that it must be in this timeout function
						window.setTimeout(function () { that.element.trigger("resetFilter" + namespace); }, 10);
						break;
					case 2:
						//elem_filter_rules.jui_filter_rules("markAllRulesAsApplied");
						that.options.filterOptions.filter_rules = a_rules; //TODO: strange to me they use settings to hold the set of rules

						//need to allow the callback - strange behavior that it must be in this timeout function
						window.setTimeout(function () { that.element.trigger("saveFilter" + namespace); }, 10);

						break;
				}

			});
		}
	}

	function loadColumns() {
		var that = this,
			firstHeadRow = this.element.find("thead > tr").first(),
			sorted = false;

		//mccrea - new logic for expandable contents
		if (that.options.enableChildRows) {
			var column = {
				id: expanderColumnId,
				identifier: false,
				converter: "string",
				text: "",
				align: "left",
				headerAlign: "left",
				cssClass: "bootgrid-center",
				headerCssClass: "",
				formatter: null, //mccrea - revisit, could use this as a new property to let the user setup their own logic potentially
				order: null,
				searchable: false,
				sortable: false,
				visible: true,
				hide: false,
				width: "30px"
			};
			that.columns.push(column);
		}

		/*jshint -W018*/
		firstHeadRow.children().each(function () {
			var $this = $(this),
				data = $this.data(),
				column = {
					id: data.columnId,
					identifier: that.identifier == null && data.identifier || false,
					converter: that.options.converters[data.converter || data.type] || that.options.converters["string"],
					text: $this.html(), //McCrea - changed from text to html as text does not read html tags and wanted to line break column headings
					align: data.align || "left",
					headerAlign: data.headerAlign || "left",
					cssClass: data.cssClass || "",
					headerCssClass: data.headerCssClass || "",
					formatter: that.options.formatters[data.formatter] || null,
					order: (!sorted && (data.order === "asc" || data.order === "desc")) ? data.order : null,
					searchable: !(data.searchable === false), // default: true
					sortable: !(data.sortable === false), // default: true
					visible: !(data.visible === false), // default: true
					hide: data.hide === true ? true : false, //default: false //McCrea - for hiding columns on load only
					width: ($.isNumeric(data.width)) ? data.width + "px" :
						(typeof (data.width) === "string") ? data.width : null
				};
			that.columns.push(column);
			if (column.order != null) {
				that.sortDictionary[column.id] = column.order;
			}

			// Prevents multiple identifiers
			if (column.identifier) {
				that.identifier = column.id;
				that.converter = column.converter;
			}

			// ensures that only the first order will be applied in case of multi sorting is disabled
			if (!that.options.multiSort && column.order !== null) {
				sorted = true;
			}
		});
		/*jshint +W018*/
	}

	/*
	response = {
		current: 1,
		rowCount: 10,
		rows: [{}, {}],
		sort: [{ "columnId": "asc" }],
		total: 101
	}
	*/

	function triggerEvents() {
		var that = this;

		//need to allow the callback - strange behavior that it must be in this timeout function
		window.setTimeout(function () { that.element.trigger("load" + namespace); that.element.trigger("loaded" + namespace); }, 10);
	}

	function loadData() {
		var that = this;

		// McCrea - won't have data if it is an empty grid
		if (that.options.editableSettings.empty) {

			triggerEvents.call(that);

			return;
		}

		this.element._bgBusyAria(true).trigger("load" + namespace);
		showLoading.call(this);

		function containsPhrase(row) {
			var column,
				searchPattern = new RegExp(that.searchPhrase, (that.options.caseSensitive) ? "g" : "gi");

			for (var i = 0; i < that.columns.length; i++) {
				column = that.columns[i];
				if (column.searchable && column.visible &&
					column.converter.to(row[column.id]).search(searchPattern) > -1) {
					return true;
				}
			}

			return false;
		}

		function update(rows, total) {
			that.currentRows = rows;
			setTotals.call(that, total);

			if (!that.options.keepSelection) {
				that.selectedRows = [];
			}

			renderRows.call(that, rows);
			renderInfos.call(that);
			renderPagination.call(that);

			that.element._bgBusyAria(false).trigger("loaded" + namespace);
		}

		if (this.options.ajax) {
			var request = getRequest.call(this),
				url = getUrl.call(this);

			if (url == null || typeof url !== "string" || url.length === 0) {
				throw new Error("Url setting must be a none empty string or a function that returns one.");
			}

			// aborts the previous ajax request if not already finished or failed
			if (this.xqr) {
				this.xqr.abort();
			}

			var settings = {
				url: url,
				data: request,
				success: function (response) {
					that.xqr = null;

					if (typeof (response) === "string") {
						response = $.parseJSON(response);
					}

					response = that.options.responseHandler(response);

					that.current = response.current;
					update(response.rows, response.total);

					//McCrea - new logic for filter -- needs to be on success of ajax call for filter
					if (that.options.useFilters) {

						//TODO: figure out what needs to be coded server side to populate filter_error

						var container_id = that.element._bgId(),
							filter_rules_id = create_id(that.options.filterOptions.filter_rules_id_prefix, container_id);

						var elem_filter_rules = $("#" + filter_rules_id);
						var filter_error = response.filterError; //data["filter_error"];
						if (filter_error != undefined) {
							if (filter_error["error_message"] != null) {
								elem_filter_rules.jui_filter_rules("markRuleAsError", filter_error["element_rule_id"], true);
								elem_filter_rules.triggerHandler("onValidationError", { err_code: "filter_validation_server_error", err_description: filter_error["error_message"] });
								$.error(filter_error["error_message"]);
							}
						} else {
							if (filter_error === undefined) {
								$.error("jquery bootgrid: Grid Ajax Url should return filterError in response!");
							}
						}
					}
				},
				error: function (jqXHR, textStatus, errorThrown) {
					that.xqr = null;

					if (textStatus !== "abort") {
						renderNoResultsRow.call(that); // overrides loading mask
						that.element._bgBusyAria(false).trigger("loaded" + namespace);
					}
				}
			};
			settings = $.extend(this.options.ajaxSettings, settings);

			this.xqr = $.ajax(settings);
		}
		else {
			if (!this.options.editableSettings.empty) {
				var rows = (this.searchPhrase.length > 0) ? this.rows.where(containsPhrase) : this.rows,
					total = rows.length;
				if (this.rowCount !== -1) {
					rows = rows.page(this.current, this.rowCount);
				}

				// todo: improve the following comment
				// setTimeout decouples the initialization so that adding event handlers happens before
				window.setTimeout(function () { update(rows, total); }, 10);
			}
		}
	}

	function loadRows() {
		// McCrea - build for empty grid entry
		if (!this.options.ajax && !this.options.editableSettings.empty) {
			var that = this,
				rows = this.element.find("tbody > tr");

			rows.each(function () {
				var $this = $(this),
					cells = $this.children("td"),
					row = {};

				$.each(that.columns, function (i, column) {
					//mccrea - new expandable grid option
					if (that.options.enableChildRows) {
						if (column.id !== expanderColumnId) {
							row[column.id] = column.converter.to(cells.eq(i).text());
						}
					} else {
						row[column.id] = column.converter.to(cells.eq(i).text());
					}
				});

				appendRow.call(that, row);

				//McCrea - new spreadsheet mode, hybrid between empty grid and manual editing - test this
				if (this.options.editableSettings.spreadsheet) {
					var tbody = this.element.children("tbody").first();

					$this.each(function () {
						Mode.edit(this);
					});

					//McCrea - vendor specific code for date picker, input masks and validation
					// Initialize any datepickers, input masks and validators
					$(".date-picker").datepicker(); //jquery ui date picker
					$(":input").inputmask();        //jquery input mask
					$('form').validetta({ realTime: true });          //validetta                    
				}
			});

			setTotals.call(this, this.rows.length);
			sortRows.call(this);
		} else {
			// McCrea - new functionality for empty grid data entry
			if (this.options.editableSettings.empty) {
				var that = this,
					tpl = this.options.templates,
					tbody = this.element.children("tbody").first(),
					html = "";

				for (var i = 0; i < that.options.editableSettings.emptyRowCount; i++) {

					html += "<tr>";

					$.each(that.columns, function (j, column) {
						if (column.visible) {
							var hasFormatter = $.isFunction(column.formatter);

							var cssClass = (column.cssClass.length > 0) ? " " + column.cssClass : "";

							var cellContent = "";

							if (that.options.editable && !hasFormatter) {

								//make sure the editable properties are set
								if (that.options.hasOwnProperty('editableSettings') && that.options.editableSettings.hasOwnProperty('columns')) {

									//check if the column we are looking at is editable (only editable columns need to be setup)
									var colSpecificSettings = [];
									colSpecificSettings = $.grep(that.options.editableSettings.columns, function (col) { return col.name == column.id; });

									//check if the editable version of the column should be text input or select list
									var editType = colSpecificSettings[0].type.toLowerCase();

									switch (editType) {
										case "text":
											var input = "";
											var dataMask = colSpecificSettings[0].mask == undefined ? "" : colSpecificSettings[0].mask;
											var dataValidation = colSpecificSettings[0].validation == undefined ? "" : colSpecificSettings[0].validation;

											// Create text input element
											input = '<input class="tabledit-input form-control" type="text" name="' + colSpecificSettings[0].name + '" value="" data-inputmask="' + dataMask + '" data-validetta="' + dataValidation + '">';

											cellContent += input;
											break;
										case "label":
											//TODO: haven't tested this in empty grid
											var input = "";
											var dataMask = colSpecificSettings[0].mask == undefined ? "" : colSpecificSettings[0].mask;

											// Create text input element
											input = '<input class="tabledit-input form-control" type="text" name="' + colSpecificSettings[0].name + '" value="" data-inputmask="' + dataMask + '" tabindex="-1" >';

											cellContent += input;
											break;
										case "list":
											//create select element
											var inputSel = '<select class="tabledit-input form-control" name="' + colSpecificSettings[0].name + '">';

											// Create options for select element
											$.each(jQuery.parseJSON(colSpecificSettings[0].values), function (key, val) {
												inputSel += '<option value="' + key + '">' + val + '</option>';
											});

											// Create last piece of select element
											inputSel += '</select>';
											cellContent += inputSel;
											break;
										case "date":
											var inputDate = "";
											var dateValidation = colSpecificSettings[0].validation == undefined ? "" : colSpecificSettings[0].validation;
											//McCrea - vendor specific code for date picker - using that specific class to initialize date picker
											inputDate = '<input type="text" value="" name="' + colSpecificSettings[0].name + '" maxlength="10" class="tabledit-input form-control date-picker" data-validetta="' + dateValidation + '">';
											cellContent += inputDate;
											break;
										case "checkbox":
											var inputCheckbox = "";
											var cbTrue = false; // TODO: no way to setup defaults - might be a good enhancement

											if (cbTrue) {
												inputCheckbox = '<input type="checkbox" value="' + cbTrue + '" name="' + colSpecificSettings[0].name + '" class="tabledit-input" data-positive="' + colSpecificSettings[0].positive + '" data-negative="' + colSpecificSettings[0].negative + '" checked>';
											} else {
												inputCheckbox = '<input type="checkbox" value="' + cbTrue + '" name="' + colSpecificSettings[0].name + '" class="tabledit-input" data-positive="' + colSpecificSettings[0].positive + '" data-negative="' + colSpecificSettings[0].negative + '">';
											}

											cellContent += inputCheckbox;
											break;
										default:
											break;
									} //end switch

									//populate cell
									//<td class=\"{{ctx.css}}\" style=\"{{ctx.style}}\">{{ctx.content}}</td>
									html += tpl.cell.resolve(getParams.call(that, {
										content: cellContent,
										css: cssClass,
										style: (column.width == null) ? "" : "width:" + column.width + ";"
									}));
								}
							} else {
								//McCrea - allow for buttons
								/* if (i == (that.options.editableSettings.emptyRowCount - 1)) { */
								if (hasFormatter) {
									var value = column.formatter.call(that, column);
									cellContent = (value == null || value === "") ? "&nbsp;" : value;

									html += tpl.cell.resolve(getParams.call(that, {
										content: cellContent,
										css: cssClass,
										style: (column.width == null) ? "" : "width:" + column.width + ";"
									}));
								}
								//}
							}
						} //end column visible check
					}); //end each loop


					html += "</tr>";

					//append html to tbody
					tbody.append(html);

					html = "";
				}

				//McCrea - vendor specific code for date picker, input masks and validation
				// Initialize any datepickers, input masks and validators
				$(".date-picker").datepicker(); //jquery ui date picker
				$(":input").inputmask();        //jquery input mask
				$('form').validetta({ realTime: true });          //validetta
			} //end empty check   
		}
	} // end LoadRows

	function setTotals(total) {
		this.total = total;
		this.totalPages = (this.rowCount === -1) ? 1 :
			Math.ceil(this.total / this.rowCount);
	}

	function prepareTable() {
		var tpl = this.options.templates,
			wrapper = (this.element.parent().hasClass(this.options.css.responsiveTable)) ?
				this.element.parent() : this.element;

		this.element.addClass(this.options.css.table);

		// checks whether there is an tbody element; otherwise creates one
		if (this.element.children("tbody").length === 0) {
			this.element.append(tpl.body);
		}

		if (this.options.navigation & 1) {
			this.header = $(tpl.header.resolve(getParams.call(this, { id: this.element._bgId() + "-header" })));
			wrapper.before(this.header);
		}

		if (this.options.navigation & 2) {
			this.footer = $(tpl.footer.resolve(getParams.call(this, { id: this.element._bgId() + "-footer" })));
			wrapper.after(this.footer);
		}
	}

	function renderActions() {
		if (this.options.navigation !== 0) {
			var css = this.options.css,
				selector = getCssSelector(css.actions),
				actionItems = findFooterAndHeaderItems.call(this, selector);

			if (actionItems.length > 0) {
				var that = this,
					tpl = this.options.templates,
					actions = $(tpl.actions.resolve(getParams.call(this)));

				// Refresh Button
				if (this.options.ajax) {
					var refreshIcon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconRefresh })),
						refresh = $(tpl.actionButton.resolve(getParams.call(this,
						{ content: refreshIcon, text: this.options.labels.refresh })))
							.on("click" + namespace, function (e) {
								// todo: prevent multiple fast clicks (fast click detection)
								e.stopPropagation();
								that.current = 1;
								loadData.call(that);
							});
					//actions.append(refresh); //McCrea - unless we delete rows from the grid and do not refresh the page, we do not need refresh button
				}

				// Row count selection
				renderRowCountSelection.call(this, actions);

				// Column selection
				renderColumnSelection.call(this, actions);

				// Filter Button - McCrea - new option
				if (this.options.filterOptions) {
					renderFilter.call(this, actions);
				}

				replacePlaceHolder.call(this, actionItems, actions);
			}
		}
	}

	function renderColumnSelection(actions) {
		if (this.options.columnSelection && this.columns.length > 1) {
			var that = this,
				css = this.options.css,
				tpl = this.options.templates,
				icon = tpl.icon.resolve(getParams.call(this, { iconCss: css.iconColumns })),
				dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: icon }))),
				selector = getCssSelector(css.dropDownItem),
				checkboxSelector = getCssSelector(css.dropDownItemCheckbox),
				itemsSelector = getCssSelector(css.dropDownMenuItems);

			$.each(this.columns, function (i, column) {
				// McCrea - don't like hard coding, but don't want commands to show up in this list
				// TODO: enhance to say if grid is editable and you start hiding columns, remove edit button
				if (column.id != "commands" && column.visible === true) {

					//McCrea - if we do not want to show all columns on load, make sure they are still available in drop down
					var showAsChecked = column.visible;

					if (column.hide) {
						//they should default to not checked, because they are not shown on load
						showAsChecked = false;
					}

					var item = $(tpl.actionDropDownCheckboxItem.resolve(getParams.call(that,
						{ name: column.id, label: column.text, checked: showAsChecked })))
							.on("click" + namespace, selector, function (e) {
								e.stopPropagation();

								var $this = $(this),
									checkbox = $this.find(checkboxSelector);

								//McCrea - since this property is used for on load only, reset it back so it will show for the user
								column.hide = false;

								if (!checkbox.prop("disabled")) {
									column.visible = checkbox.prop("checked");
									var enable = that.columns.where(isVisible).length > 1;
									$this.parents(itemsSelector).find(selector + ":has(" + checkboxSelector + ":checked)")
										._bgEnableAria(enable).find(checkboxSelector)._bgEnableField(enable);

									//McCrea - new footer logic, so when columns go away the footer aligns properly
									if (that.element.find("tfoot")) {
										var cbName = checkbox.prop("name");
										var footerElem = that.element.find("tfoot");
										var footerColElem = $(footerElem).find("[data-footer-id='" + cbName + "']");
										if (column.visible) {
											footerColElem.show();
										} else {
											footerColElem.hide();
										}
									}
									that.element.find("tbody").empty(); // Fixes an column visualization bug
									renderTableHeader.call(that);
									loadData.call(that);
								}
							});
					dropDown.find(getCssSelector(css.dropDownMenuItems)).append(item);
				}
			});
			actions.append(dropDown);
		}
	}

	//McCrea - new function for filtering
	function renderFilter(actions) {
		var that = this;
		if (that.options.filterOptions.filters != undefined && that.options.filterOptions.filters.length > 0) {

			var tpl = this.options.templates;
			var filterIcon = tpl.icon.resolve(getParams.call(this, { iconCss: that.options.css.iconFilter })),
				filter = $(tpl.actionButton.resolve(getParams.call(this,
				{ content: filterIcon })))
					.on("click" + namespace, function (e) {
						// todo: prevent multiple fast clicks (fast click detection)
						e.stopPropagation();

						var container_id = that.element._bgId(),
						filter_toggle_id = create_id(that.options.filterOptions.filter_toggle_id_prefix, container_id),
						filter_container_id = create_id(that.options.filterOptions.filter_container_id_prefix, container_id),
						elem_filter_toggle = $("#" + filter_toggle_id),
						elem_filter_container = $("#" + filter_container_id);

						if (elem_filter_container.is(":visible")) {
							elem_filter_container.slideUp();
							if (that.options.filterOptions.filter_rules.length > 0) {
								// mark filter toggle as active
								elem_filter_toggle.addClass(that.options.filterOptions.filterToggleActiveClass);
							}
						} else {
							elem_filter_container.slideDown();
							// mark filter toggle as inactive
							elem_filter_toggle.removeClass(that.options.filterOptions.filterToggleActiveClass);
						}
					});
			actions.append(filter);
		}
	}

	function renderInfos() {
		if (this.options.navigation !== 0) {
			var selector = getCssSelector(this.options.css.infos),
				infoItems = findFooterAndHeaderItems.call(this, selector);

			if (infoItems.length > 0) {
				var end = (this.current * this.rowCount),
					infos = $(this.options.templates.infos.resolve(getParams.call(this, {
						end: (this.total === 0 || end === -1 || end > this.total) ? this.total : end,
						start: (this.total === 0) ? 0 : (end - this.rowCount + 1),
						total: this.total
					})));

				replacePlaceHolder.call(this, infoItems, infos);
			}
		}
	}

	function renderNoResultsRow() {
		var tbody = this.element.children("tbody").first(),
			tpl = this.options.templates,
			count = this.columns.where(isVisible).length;

		if (this.selection) {
			count = count + 1;
		}
		tbody.html(tpl.noResults.resolve(getParams.call(this, { columns: count })));
	}

	function renderPagination() {
		if (this.options.navigation !== 0) {
			var selector = getCssSelector(this.options.css.pagination),
				paginationItems = findFooterAndHeaderItems.call(this, selector)._bgShowAria(this.rowCount !== -1);

			if (this.rowCount !== -1 && paginationItems.length > 0) {
				var tpl = this.options.templates,
					current = this.current,
					totalPages = this.totalPages,
					pagination = $(tpl.pagination.resolve(getParams.call(this))),
					offsetRight = totalPages - current,
					offsetLeft = (this.options.padding - current) * -1,
					startWith = ((offsetRight >= this.options.padding) ?
						Math.max(offsetLeft, 1) :
						Math.max((offsetLeft - this.options.padding + offsetRight), 1)),
					maxCount = this.options.padding * 2 + 1,
					count = (totalPages >= maxCount) ? maxCount : totalPages;

				renderPaginationItem.call(this, pagination, "first", "&laquo;", "first")
					._bgEnableAria(current > 1);
				renderPaginationItem.call(this, pagination, "prev", "&lt;", "prev")
					._bgEnableAria(current > 1);

				for (var i = 0; i < count; i++) {
					var pos = i + startWith;
					renderPaginationItem.call(this, pagination, pos, pos, "page-" + pos)
						._bgEnableAria()._bgSelectAria(pos === current);
				}

				if (count === 0) {
					renderPaginationItem.call(this, pagination, 1, 1, "page-" + 1)
						._bgEnableAria(false)._bgSelectAria();
				}

				renderPaginationItem.call(this, pagination, "next", "&gt;", "next")
					._bgEnableAria(totalPages > current);
				renderPaginationItem.call(this, pagination, "last", "&raquo;", "last")
					._bgEnableAria(totalPages > current);

				replacePlaceHolder.call(this, paginationItems, pagination);
			}
		}
	}

	function renderPaginationItem(list, uri, text, markerCss) {
		var that = this,
			tpl = this.options.templates,
			css = this.options.css,
			values = getParams.call(this, { css: markerCss, text: text, uri: "#" + uri }),
			item = $(tpl.paginationItem.resolve(values))
				.on("click" + namespace, getCssSelector(css.paginationButton), function (e) {
					e.stopPropagation();

					var $this = $(this),
						parent = $this.parent();
					if (!parent.hasClass("active") && !parent.hasClass("disabled")) {
						var commandList = {
							first: 1,
							prev: that.current - 1,
							next: that.current + 1,
							last: that.totalPages
						};
						var command = $this.attr("href").substr(1);
						that.current = commandList[command] || +command; // + converts string to int
						loadData.call(that);
					}
					$this.trigger("blur");
				});

		list.append(item);
		return item;
	}

	function renderRowCountSelection(actions) {
		var that = this,
			rowCountList = this.options.rowCount;

		function getText(value) {
			return (value === -1) ? that.options.labels.all : value;
		}

		if ($.isArray(rowCountList)) {
			var css = this.options.css,
				tpl = this.options.templates,
				dropDown = $(tpl.actionDropDown.resolve(getParams.call(this, { content: getText(this.rowCount) }))),
				menuSelector = getCssSelector(css.dropDownMenu),
				menuTextSelector = getCssSelector(css.dropDownMenuText),
				menuItemsSelector = getCssSelector(css.dropDownMenuItems),
				menuItemSelector = getCssSelector(css.dropDownItemButton);

			$.each(rowCountList, function (index, value) {
				var item = $(tpl.actionDropDownItem.resolve(getParams.call(that,
					{ text: getText(value), uri: "#" + value })))
						._bgSelectAria(value === that.rowCount)
						.on("click" + namespace, menuItemSelector, function (e) {
							e.preventDefault();

							var $this = $(this),
								newRowCount = +$this.attr("href").substr(1);
							if (newRowCount !== that.rowCount) {
								// todo: sophisticated solution needed for calculating which page is selected
								that.current = 1; // that.rowCount === -1 ---> All
								that.rowCount = newRowCount;
								$this.parents(menuItemsSelector).children().each(function () {
									var $item = $(this),
										currentRowCount = +$item.find(menuItemSelector).attr("href").substr(1);
									$item._bgSelectAria(currentRowCount === newRowCount);
								});
								$this.parents(menuSelector).find(menuTextSelector).text(getText(newRowCount));
								loadData.call(that);
							}
						});
				dropDown.find(menuItemsSelector).append(item);
			});
			actions.append(dropDown);
		}
	}

	function renderRows(rows) {
		if (rows.length > 0) {
			var that = this,
				css = this.options.css,
				tpl = this.options.templates,
				tbody = this.element.children("tbody").first(),
				allRowsSelected = true,
				html = "";

			$.each(rows, function (index, row) {
				var cells = "",
					rowAttr = " data-row-id=\"" + ((that.identifier == null) ? index : row[that.identifier]) + "\"",
					rowCss = "";

				if (that.selection) {
					var selected = ($.inArray(row[that.identifier], that.selectedRows) !== -1),
						selectBox = tpl.select.resolve(getParams.call(that,
							{ type: "checkbox", value: row[that.identifier], checked: selected }));
					cells += tpl.cell.resolve(getParams.call(that, { content: selectBox, css: css.selectCell }));
					allRowsSelected = (allRowsSelected && selected);
					if (selected) {
						rowCss += css.selected;
						rowAttr += " aria-selected=\"true\"";
					}
				}

				var status = row.status != null && that.options.statusMapping[row.status];
				if (status) {
					rowCss += status;
				}

				$.each(that.columns, function (j, column) {
					if (column.visible && !column.hide) {
						var cellContent = "";
						var cssClass = (column.cssClass.length > 0) ? " " + column.cssClass : "";

						//mccrea - new logic for expandable grid
						if (that.options.enableChildRows && column.id === expanderColumnId) {
							//we are on the first column - set it up
							var tableId = $(that.element).closest("table").attr("id");
							var onClickStr = "$(&quot;#" + tableId + "&quot;).bootgrid(&quot;toggleRow&quot;, this, " + that.options.childRowSettings.expandedCallBack + "); return false";
							var expHtml = "<button id='btn-exp-" + row[that.identifier] + "' type='button' class='btn btn-xs btn-exp btn-success' data-row-id='" + row[that.identifier] + "' onclick='" + onClickStr + "'><i class='fa fa-plus'></i></button>";
							cellContent += expHtml;
						} else {
							//McCrea - need to see if using a formatter for editing too, so set it up as variable
							var hasFormatter = $.isFunction(column.formatter);

							var value = (hasFormatter) ?
								column.formatter.call(that, column, row) :
								column.converter.to(row[column.id]);
								

							//McCrea - evaluate new editable option - if using a custom formatter, editing is prohibited
							if (that.options.editable && !hasFormatter) {

								//make sure the editable properties are set
								if (that.options.hasOwnProperty('editableSettings') && that.options.editableSettings.hasOwnProperty('columns')) {

									//check if the column we are looking at is editable (only editable columns need to be setup)
									var colSpecificSettings = [];
									colSpecificSettings = $.grep(that.options.editableSettings.columns, function (col) { return col.name == column.id; });

									if (colSpecificSettings.length == 0) {
										//column not editable - carry on as normal
										cellContent = (value == null || value === "") ? "&nbsp;" : value;

									} else {
										//column is editable... will need two sets of cells

										var newValue = (value == null || value === "") ? "&nbsp;" : value;
										cssClass += " tabledit-view-mode";

										//create the non-editable version of cells
										cellContent += "<span class=\"tabledit-span\">" + newValue + "</span>";

										//check if the editable version of the column should be text input or select list
										var editType = colSpecificSettings[0].type.toLowerCase();

										switch (editType) {
											case "text":
												var input = "";
												var dataMask = colSpecificSettings[0].mask == undefined ? "" : colSpecificSettings[0].mask;
												var dataValidation = colSpecificSettings[0].validation == undefined ? "" : colSpecificSettings[0].validation;
												if (that.options.editableSettings.spreadsheet && that.options.editableSettings.spreadsheetOnBlur.length > 0) {
													// Create text input element
													input = '<input class="tabledit-input form-control" type="text" name="' + colSpecificSettings[0].name + '" value="' + newValue + '" data-inputmask="' + dataMask + '" data-validetta="' + dataValidation + '" style="display: none;" onblur="' + that.options.editableSettings.spreadsheetOnBlur + '(' + row[that.identifier] + ', event)" disabled>';
												} else {
													// Create text input element
													input = '<input class="tabledit-input form-control" type="text" name="' + colSpecificSettings[0].name + '" value="' + newValue + '" data-inputmask="' + dataMask + '" data-validetta="' + dataValidation + '" style="display: none;" disabled>';
												}
												cellContent += input;
												break;
											case "label":
												var input = "";
												var dataMask = colSpecificSettings[0].mask == undefined ? "" : colSpecificSettings[0].mask;
												var dataValidation = colSpecificSettings[0].validation == undefined ? "" : colSpecificSettings[0].validation;
												if (that.options.editableSettings.spreadsheet && that.options.editableSettings.spreadsheetOnBlur.length > 0) {
													// Create text input element
													input = '<input class="tabledit-input form-control" type="text" name="' + colSpecificSettings[0].name + '" value="' + newValue + '" data-inputmask="' + dataMask + '" data-validetta="' + dataValidation + '" style="display: none;" tabindex="-1" readonly>';
												} else {
													// Create text input element
													input = '<input class="tabledit-input form-control" type="text" name="' + colSpecificSettings[0].name + '" value="' + newValue + '" data-inputmask="' + dataMask + '" data-validetta="' + dataValidation + '" style="display: none;" readonly>';
												}
												cellContent += input;
												break;
											case "list":

												if (that.options.editableSettings.spreadsheet && that.options.editableSettings.spreadsheetOnBlur.length > 0) {
													// Create select element
													var inputSel = '<select class="tabledit-input form-control" name="' + colSpecificSettings[0].name + '" style="display: none;" onblur="' + that.options.editableSettings.spreadsheetOnBlur + '(' + row[that.identifier] + ', event)" disabled>';
												} else {
													//create select element
													var inputSel = '<select class="tabledit-input form-control" name="' + colSpecificSettings[0].name + '" style="display: none;" disabled>';
												}
												// Create options for select element
												$.each(jQuery.parseJSON(colSpecificSettings[0].values), function (key, val) {
													if (newValue === val) {
														inputSel += '<option value="' + key + '" selected>' + val + '</option>';
													} else {
														inputSel += '<option value="' + key + '">' + val + '</option>';
													}
												});
												// Create last piece of select element
												inputSel += '</select>';
												cellContent += inputSel;
												break;
											case "date":
												var inputDate = "";
												var dateValidation = colSpecificSettings[0].validation == undefined ? "" : colSpecificSettings[0].validation;

												if (that.options.editableSettings.spreadsheet && that.options.editableSettings.spreadsheetOnBlur.length > 0) {
													//McCrea - vendor specific code for date picker - using that specific class to initialize date picker
													inputDate = '<input type="text" value="' + newValue + '" name="' + colSpecificSettings[0].name + '" maxlength="10" class="tabledit-input form-control date-picker" data-validetta="' + dateValidation + '" style="display: none;" onblur="' + that.options.editableSettings.spreadsheetOnBlur + '(' + row[that.identifier] + ', event)" disabled>';
												} else {
													//McCrea - vendor specific code for date picker - using that specific class to initialize date picker
													inputDate = '<input type="text" value="' + newValue + '" name="' + colSpecificSettings[0].name + '" maxlength="10" class="tabledit-input form-control date-picker" data-validetta="' + dateValidation + '" style="display: none;" disabled>';
												}

												cellContent += inputDate;
												break;
											case "checkbox":
												var inputCheckbox = "";
												var cbTrue = colSpecificSettings[0].positive == newValue;

												if (that.options.editableSettings.spreadsheet && that.options.editableSettings.spreadsheetOnBlur.length > 0) {
													if (cbTrue) {
														inputCheckbox = '<input type="checkbox" value="' + cbTrue + '" name="' + colSpecificSettings[0].name + '" class="tabledit-input" data-positive="' + colSpecificSettings[0].positive + '" data-negative="' + colSpecificSettings[0].negative + '" style="display: none;" onblur="' + that.options.editableSettings.spreadsheetOnBlur + '(' + row[that.identifier] + ', event)" disabled checked>';
													} else {
														inputCheckbox = '<input type="checkbox" value="' + cbTrue + '" name="' + colSpecificSettings[0].name + '" class="tabledit-input" data-positive="' + colSpecificSettings[0].positive + '" data-negative="' + colSpecificSettings[0].negative + '" style="display: none;" onblur="' + that.options.editableSettings.spreadsheetOnBlur + '(' + row[that.identifier] + ', event)" disabled>';
													}
												} else {
													if (cbTrue) {
														inputCheckbox = '<input type="checkbox" value="' + cbTrue + '" name="' + colSpecificSettings[0].name + '" class="tabledit-input" data-positive="' + colSpecificSettings[0].positive + '" data-negative="' + colSpecificSettings[0].negative + '" style="display: none;" disabled checked>';
													} else {
														inputCheckbox = '<input type="checkbox" value="' + cbTrue + '" name="' + colSpecificSettings[0].name + '" class="tabledit-input" data-positive="' + colSpecificSettings[0].positive + '" data-negative="' + colSpecificSettings[0].negative + '" style="display: none;" disabled>';
													}
												}

												cellContent += inputCheckbox;
												break;
											default:
												break;
										}
									}
								} else {
									//editable properties were not sent in - carry on as normal
									cellContent = (value == null || value === "") ? "&nbsp;" : value;
								}
							} else {
								//entire grid is not editable - carry on as normal
								cellContent = (value == null || value === "") ? "&nbsp;" : value;
							}
						}

						//populate cell
						cells += tpl.cell.resolve(getParams.call(that, {
							content: cellContent,
							css: ((column.align === "right") ? css.right : (column.align === "center") ?
								css.center : css.left) + cssClass,
							style: (column.width == null) ? "" : "width:" + column.width + ";"
						}));
					} //end column visible check
				});

				if (rowCss.length > 0) {
					rowAttr += " class=\"" + rowCss + "\"";
				}
				html += tpl.row.resolve(getParams.call(that, { attr: rowAttr, cells: cells }));

				//mccrea - new logic for child rows
				if (that.options.enableChildRows) {
					//need to add an empty row that is hidden
                                        var colspan = 0;
                                        $.each(that.columns, function (j, column) {
                                            if(column.visible){
                                                colspan++;
                                            }
                                        });
					var expandedRowStr = "<tr id='" + expanderRowId + "-" + row[that.identifier] + "' style='display:none;'><td colspan='" + colspan + "'>" + that.options.childRowSettings.defaultRowText + "</td></tr>"; //mccrea - could make default text configurable
					html += expandedRowStr;
				}
			});

			//McCrea - new footer logic, so when columns initially load as hidden the footer aligns properly
			$.each(that.columns, function (j, column) {
				if (column.hide) {

					if (that.element.find("tfoot")) {
						var cbName = column.id;
						var footerElem = that.element.find("tfoot");
						var footerColElem = $(footerElem).find("[data-footer-id='" + cbName + "']");
						footerColElem.hide();
					}
				}
			});
			// sets or clears multi selectbox state
			that.element.find("thead " + getCssSelector(that.options.css.selectBox))
				.prop("checked", allRowsSelected);

			tbody.html(html);

			//McCrea - new spreadsheet mode, hybrid between empty grid and manual editing
			if (that.options.editableSettings.spreadsheet) {
				$(tbody).find('tr').each(function () {
					$(this).find('td').each(function () {
						Mode.edit(this);
					});
				});

				//McCrea - vendor specific code for date picker, input masks and validation
				// Initialize any datepickers, input masks and validators
				$(".date-picker").datepicker(); //jquery ui date picker
				$(":input").inputmask();        //jquery input mask
				$('form').validetta({ realTime: true });          //validetta                    
			}

			registerRowEvents.call(this, tbody);
		}
		else {
			renderNoResultsRow.call(this);
		}
	}

	function registerRowEvents(tbody) {
		var that = this,
			selectBoxSelector = getCssSelector(this.options.css.selectBox);

		if (this.selection) {
			tbody.off("click" + namespace, selectBoxSelector)
				.on("click" + namespace, selectBoxSelector, function (e) {
					e.stopPropagation();

					var $this = $(this),
						id = that.converter.from($this.val());

					if ($this.prop("checked")) {
						that.select([id]);
					}
					else {
						that.deselect([id]);
					}
				});
		}

		//McCrea - reconfigured so event propogation is only stopped if the grid is setup for selection or row select
		tbody.off("click" + namespace, "> tr")
			.on("click" + namespace, "> tr", function (e) {
				var $this = $(this),
					id = (that.identifier == null) ? $this.data("row-id") :
						that.converter.from($this.data("row-id") + ""),
					row = (that.identifier == null) ? that.currentRows[id] :
						that.currentRows.first(function (item) { return item[that.identifier] === id; });

				if (that.selection && that.options.rowSelect) {
					e.stopPropagation(); //moved from first line to within if

					if ($this.hasClass(that.options.css.selected)) {
						that.deselect([id]);
					}
					else {
						that.select([id]);
					}

					that.element.trigger("click" + namespace, [that.columns, row]); //moved this inside if
				}
			});
	}

	function renderSearchField() {
		if (this.options.navigation !== 0) {
			var css = this.options.css,
				selector = getCssSelector(css.search),
				searchItems = findFooterAndHeaderItems.call(this, selector);

			if (searchItems.length > 0) {
				var that = this,
					tpl = this.options.templates,
					timer = null, // fast keyup detection
					currentValue = "",
					searchFieldSelector = getCssSelector(css.searchField),
					search = $(tpl.search.resolve(getParams.call(this))),
					searchField = (search.is(searchFieldSelector)) ? search :
						search.find(searchFieldSelector);

				searchField.on("keyup" + namespace, function (e) {
					e.stopPropagation();
					var newValue = $(this).val();
					if (currentValue !== newValue || (e.which === 13 && newValue !== "")) {
						currentValue = newValue;
						if (e.which === 13 || newValue.length === 0 || newValue.length >= that.options.searchSettings.characters) {
							window.clearTimeout(timer);
							timer = window.setTimeout(function () {
								executeSearch.call(that, newValue);
							}, that.options.searchSettings.delay);
						}
					}
				});

				replacePlaceHolder.call(this, searchItems, search);
			}
		}
	}

	function executeSearch(phrase) {
		if (this.searchPhrase !== phrase) {
			this.current = 1;
			this.searchPhrase = phrase;
			loadData.call(this);
		}
	}

	function renderTableHeader() {
		var that = this,
			headerRow = this.element.find("thead > tr"),
			css = this.options.css,
			tpl = this.options.templates,
			html = "",
			sorting = this.options.sorting;

		if (this.selection) {
			var selectBox = (this.options.multiSelect) ?
				tpl.select.resolve(getParams.call(that, { type: "checkbox", value: "all" })) : "";
			html += tpl.rawHeaderCell.resolve(getParams.call(that, {
				content: selectBox,
				css: css.selectCell
			}));
		}

		$.each(this.columns, function (index, column) {
			//McCrea - to allow for columns to not be rendered on load, but able to be selected in toggle drop down
			if (column.visible && !column.hide) {
				var sortOrder = that.sortDictionary[column.id],
					iconCss = ((sorting && sortOrder && sortOrder === "asc") ? css.iconUp :
						(sorting && sortOrder && sortOrder === "desc") ? css.iconDown : ""),
					icon = tpl.icon.resolve(getParams.call(that, { iconCss: iconCss })),
					align = column.headerAlign,
					cssClass = (column.headerCssClass.length > 0) ? " " + column.headerCssClass : "";
				html += tpl.headerCell.resolve(getParams.call(that, {
					column: column, icon: icon, sortable: sorting && column.sortable && css.sortable || "",
					css: ((align === "right") ? css.right : (align === "center") ?
						css.center : css.left) + cssClass,
					style: (column.width == null) ? "" : "width:" + column.width + ";"
				}));
			}
		});

		headerRow.html(html);

		if (sorting) {
			var sortingSelector = getCssSelector(css.sortable);
			headerRow.off("click" + namespace, sortingSelector)
				.on("click" + namespace, sortingSelector, function (e) {
					e.preventDefault();

					setTableHeaderSortDirection.call(that, $(this));
					sortRows.call(that);
					loadData.call(that);
				});
		}

		// todo: create a own function for that piece of code
		if (this.selection && this.options.multiSelect) {
			var selectBoxSelector = getCssSelector(css.selectBox);
			headerRow.off("click" + namespace, selectBoxSelector)
				.on("click" + namespace, selectBoxSelector, function (e) {
					e.stopPropagation();

					if ($(this).prop("checked")) {
						that.select();
					}
					else {
						that.deselect();
					}
				});
		}
	}

	function setTableHeaderSortDirection(element) {
		var css = this.options.css,
			iconSelector = getCssSelector(css.icon),
			columnId = element.data("column-id") || element.parents("th").first().data("column-id"),
			sortOrder = this.sortDictionary[columnId],
			icon = element.find(iconSelector);

		if (!this.options.multiSort) {
			element.parents("tr").first().find(iconSelector).removeClass(css.iconDown + " " + css.iconUp);
			this.sortDictionary = {};
		}

		if (sortOrder && sortOrder === "asc") {
			this.sortDictionary[columnId] = "desc";
			icon.removeClass(css.iconUp).addClass(css.iconDown);
		}
		else if (sortOrder && sortOrder === "desc") {
			if (this.options.multiSort) {
				var newSort = {};
				for (var key in this.sortDictionary) {
					if (key !== columnId) {
						newSort[key] = this.sortDictionary[key];
					}
				}
				this.sortDictionary = newSort;
				icon.removeClass(css.iconDown);
			}
			else {
				this.sortDictionary[columnId] = "asc";
				icon.removeClass(css.iconDown).addClass(css.iconUp);
			}
		}
		else {
			this.sortDictionary[columnId] = "asc";
			icon.addClass(css.iconUp);
		}
	}

	function replacePlaceHolder(placeholder, element) {
		placeholder.each(function (index, item) {
			// todo: check how append is implemented. Perhaps cloning here is superfluous.
			$(item).before(element.clone(true)).remove();
		});
	}

	function showLoading() {
		var that = this;

		window.setTimeout(function () {
			if (that.element._bgAria("busy") === "true") {
				var tpl = that.options.templates,
					thead = that.element.children("thead").first(),
					tbody = that.element.children("tbody").first(),
					firstCell = tbody.find("tr > td").first(),
					padding = (that.element.height() - thead.height()) - (firstCell.height() + 20),
					count = that.columns.where(isVisible).length;

				if (that.selection) {
					count = count + 1;
				}
				tbody.html(tpl.loading.resolve(getParams.call(that, { columns: count })));
				if (that.rowCount !== -1 && padding > 0) {
					tbody.find("tr > td").css("padding", "20px 0 " + padding + "px");
				}
			}
		}, 250);
	}

	function sortRows() {
		var sortArray = [];
		var cols = this.columns;

		function sort(x, y, current) {
			current = current || 0;
			var next = current + 1,
				item = sortArray[current];

			function sortOrder(value) {
				return (item.order === "asc") ? value : value * -1;
			}

			//McCrea - modify the sort so it works with custom converters
			var xValue; //= x[item.id];
			var yValue; //= y[item.id];

			$.each(cols, function (i, column) {
				if (column.id === item.id) {
					xValue = column.converter.sort(x[item.id]);
					yValue = column.converter.sort(y[item.id]);
				}
			});

			return (xValue > yValue) ? sortOrder(1) :
				(xValue < yValue) ? sortOrder(-1) :
					(sortArray.length > next) ? sort(x, y, next) : 0;
		}

		if (!this.options.ajax) {
			for (var key in this.sortDictionary) {
				if (this.options.multiSort || sortArray.length === 0) {
					sortArray.push({
						id: key,
						order: this.sortDictionary[key]
					});
				}
			}

			if (sortArray.length > 0) {
				this.rows.sort(sort);
			}
		}
	}

	// MCCREA - GRID EXTENSION FOR EDITABLE ROWS ADAPTED FROM JQUERY TABLEDIT
	// ====================

	/**
	 * Change to view mode or edit mode with table td element as parameter.
	 *
	 * @type object
	 */
	var Mode = {
		view: function (td) {
			// Get table row.
			var $tr = $(td).parent('tr');
			// Hide and disable input element.
			$(td).find('.tabledit-input').blur().hide().prop('disabled', true);
			// Show span element.
			$(td).find('.tabledit-span').show();
			// Add "view" class and remove "edit" class in td element.
			$(td).addClass('tabledit-view-mode').removeClass('tabledit-edit-mode');
			// Update toolbar buttons.
			$tr.find('button.' + 'command-save').hide();                       //TODO: Come back - should not hard code these styles
			$tr.find('button.' + 'command-edit').removeClass('active').blur(); //TODO: Come back - should not hard code these styles
		},
		edit: function (td) {
			// Get table row.
			var $tr = $(td).parent('tr');
			// Hide span element.
			$(td).find('.tabledit-span').hide();
			// Get input element.
			var $input = $(td).find('.tabledit-input');
			// Enable and show input element.
			$input.prop('disabled', false).show();

			//McCrea - vendor specific code for datepicker

			// Focus on input element.
			//$input.focus(); -- this was firing the datepicker... 

			//if check will prevent the datepicker
			//from dropping down when it is not the first field, however, this will also prevent focus if a 
			//date picker is the first input field in a row... TODO: fix
			if (!$(td).find(':input:enabled:visible:first').hasClass("date-picker")) {
				//$(td).find(':input:enabled:visible:first').focus(); //McCrea - this was uncommented
			}

			// Add "edit" class and remove "view" class in td element.
			$(td).addClass('tabledit-edit-mode').removeClass('tabledit-view-mode');
			// Update toolbar buttons.
			$tr.find('button.' + 'command-edit').addClass('active'); //TODO: Come back - should not hard code these styles
			$tr.find('button.' + 'command-save').show();             //TODO: Come back - should not hard code these styles
		}
	};

	/**
	 * Available actions for edit function, with table td element as parameter or set of td elements.
	 *
	 * @type object
	 */
	var Edit = {
		reset: function (td) {
			$(td).each(function () {
				// Get input element.
				var $input = $(this).find('.tabledit-input');
				// Get span text.
				var text = $(this).find('.tabledit-span').text();
				// Set input/select value with span text.
				if ($input.is('select')) {
					$input.find('option').filter(function () {
						return $.trim($(this).text()) === text;
					}).attr('selected', true);
				} else {
					$input.val(text);
				}

				//McCrea - vendor specific code for validation
				// Clear up any leftover validations - specific to validetta
				$('form').trigger("validetta:clear");

				// Change to view mode.
				Mode.view(this);
			});
		},
		submit: function (grid, tr, rowId) {
			//McCrea - vendor specific code for validation
			$('form').trigger("validetta:validate");

			if ($('td').hasClass("validetta-error")) {
				return "";
			}

			var strJson = "{'id': '" + rowId + "'";

			// Original thought was to use ajax to submit - decided to let the page handle that, so return json
			var cells = tr.children("td");

			//McCrea - this seems completely unnecessary but we do not have TR's for the columns which are not visible (at least not ID)
			var cols = [];
			$.each(grid.columns, function (i, column) {
				if (column.visible) {
					cols.push(column);
				}
			});

			$.each(cols, function (i, column) {
				var finalText = "";
				var $input = $(cells[i]).find('.tabledit-input');

				if ($input.length > 0) {
					// Set span text with input/select new value.
					if ($input.is('select')) {
						finalText = $input.find('option:selected').val();
						$(cells[i]).find('.tabledit-span').text($input.find('option:selected').text());
					} else {
						if ($input.is(':checkbox')) {
							if ($input.is(':checked')) {
								//need to use the positive indicator text
								var posText = $input.attr("data-positive");
								finalText = posText;
								$(cells[i]).find('.tabledit-span').text(posText);
							} else {
								//need to use the negative indicator text
								var negText = $input.attr("data-negative");
								finalText = negText;
								$(cells[i]).find('.tabledit-span').text(negText);
							}
						} else {
							finalText = column.converter.from($input.val());
							$(cells[i]).find('.tabledit-span').text(column.converter.to($input.val()));
						}
					}
					strJson = strJson + ", '" + column.id + "': '" + finalText + "'";

					//McCrea - vendor specific code for validation
					// Clear up any leftover validations - specific to validetta
					//$('form').validetta();
					$('form').trigger("validetta:clear");

					Mode.view(cells[i]);
				}
			});

			return strJson + "}";
		}
	};

	// GRID PUBLIC CLASS DEFINITION
	// ====================

	/**
	 * Represents the jQuery Bootgrid plugin.
	 *
	 * @class Grid
	 * @constructor
	 * @param element {Object} The corresponding DOM element.
	 * @param options {Object} The options to override default settings.
	 * @chainable
	 **/
	var Grid = function (element, options) {
		this.element = $(element);
		this.origin = this.element.clone();
		this.options = $.extend(true, {}, Grid.defaults, this.element.data(), options);
		// overrides rowCount explicitly because deep copy ($.extend) leads to strange behaviour
		var rowCount = this.options.rowCount = this.element.data().rowCount || options.rowCount || this.options.rowCount;
		this.columns = [];
		this.current = 1;
		this.currentRows = [];
		this.identifier = null; // The first column ID that is marked as identifier
		this.selection = false;
		this.converter = null; // The converter for the column that is marked as identifier
		this.rowCount = ($.isArray(rowCount)) ? rowCount[0] : rowCount;
		this.rows = [];
		this.searchPhrase = "";
		this.selectedRows = [];
		this.sortDictionary = {};
		this.total = 0;
		this.totalPages = 0;
		this.cachedParams = {
			lbl: this.options.labels,
			css: this.options.css,
			ctx: {}
		};
		this.header = null;
		this.footer = null;
		this.xqr = null;

		// todo: implement cache
	};

	/**
	 * An object that represents the default settings.
	 *
	 * @static
	 * @class defaults
	 * @for Grid
	 * @example
	 *   // Global approach
	 *   $.bootgrid.defaults.selection = true;
	 * @example
	 *   // Initialization approach
	 *   $("#bootgrid").bootgrid({ selection = true });
	 **/
	Grid.defaults = {
		navigation: 3, // it's a flag: 0 = none, 1 = top, 2 = bottom, 3 = both (top and bottom)
		padding: 2, // page padding (pagination)
		columnSelection: true,
		rowCount: [10, 25, 50, -1], // rows per page int or array of int (-1 represents "All")

		/**
		 * Enables row selection (to enable multi selection see also `multiSelect`). Default value is `false`.
		 *
		 * @property selection
		 * @type Boolean
		 * @default false
		 * @for defaults
		 * @since 1.0.0
		 **/
		selection: false,

		/**
		 * Enables multi selection (`selection` must be set to `true` as well). Default value is `false`.
		 *
		 * @property multiSelect
		 * @type Boolean
		 * @default false
		 * @for defaults
		 * @since 1.0.0
		 **/
		multiSelect: false,

		/**
		 * Enables entire row click selection (`selection` must be set to `true` as well). Default value is `false`.
		 *
		 * @property rowSelect
		 * @type Boolean
		 * @default false
		 * @for defaults
		 * @since 1.1.0
		 **/
		rowSelect: false,

		/**
		 * Defines whether the row selection is saved internally on filtering, paging and sorting
		 * (even if the selected rows are not visible).
		 *
		 * @property keepSelection
		 * @type Boolean
		 * @default false
		 * @for defaults
		 * @since 1.1.0
		 **/
		keepSelection: false,

		highlightRows: false, // highlights new rows (find the page of the first new row)
		sorting: true,
		multiSort: false,

		/**
		 * General search settings to configure the search field behaviour.
		 *
		 * @property searchSettings
		 * @type Object
		 * @for defaults
		 * @since 1.2.0
		 **/
		searchSettings: {
			/**
			 * The time in milliseconds to wait before search gets executed.
			 *
			 * @property delay
			 * @type Number
			 * @default 250
			 * @for searchSettings
			 **/
			delay: 250,

			/**
			 * The characters to type before the search gets executed.
			 *
			 * @property characters
			 * @type Number
			 * @default 1
			 * @for searchSettings
			 **/
			characters: 1
		},

		/**
		 * Defines whether the data shall be loaded via an asynchronous HTTP (Ajax) request.
		 *
		 * @property ajax
		 * @type Boolean
		 * @default false
		 * @for defaults
		 **/
		ajax: false,

		/**
		 * Ajax request settings that shall be used for server-side communication.
		 * All setting except data, error, success and url can be overridden.
		 * For the full list of settings go to http://api.jquery.com/jQuery.ajax/.
		 *
		 * @property ajaxSettings
		 * @type Object
		 * @for defaults
		 * @since 1.2.0
		 **/
		ajaxSettings: {
			/**
			 * Specifies the HTTP method which shall be used when sending data to the server.
			 * Go to http://api.jquery.com/jQuery.ajax/ for more details.
			 * This setting is overriden for backward compatibility.
			 *
			 * @property method
			 * @type String
			 * @default "POST"
			 * @for ajaxSettings
			 **/
			method: "POST"
		},

		/**
		 * Enriches the request object with additional properties. Either a `PlainObject` or a `Function`
		 * that returns a `PlainObject` can be passed. Default value is `{}`.
		 *
		 * @property post
		 * @type Object|Function
		 * @default function (request) { return request; }
		 * @for defaults
		 * @deprecated Use instead `requestHandler`
		 **/
		post: {}, // or use function () { return {}; } (reserved properties are "current", "rowCount", "sort" and "searchPhrase")

		/**
		 * Sets the data URL to a data service (e.g. a REST service). Either a `String` or a `Function`
		 * that returns a `String` can be passed. Default value is `""`.
		 *
		 * @property url
		 * @type String|Function
		 * @default ""
		 * @for defaults
		 **/
		url: "", // or use function () { return ""; }

		/**
		 * Defines whether the search is case sensitive or insensitive.
		 *
		 * @property caseSensitive
		 * @type Boolean
		 * @default true
		 * @for defaults
		 * @since 1.1.0
		 **/
		caseSensitive: true,

		// note: The following properties should not be used via data-api attributes

		/**
		 * Transforms the JSON request object in what ever is needed on the server-side implementation.
		 *
		 * @property requestHandler
		 * @type Function
		 * @default function (request) { return request; }
		 * @for defaults
		 * @since 1.1.0
		 **/
		requestHandler: function (request) { return request; },

		/**
		 * Transforms the response object into the expected JSON response object.
		 *
		 * @property responseHandler
		 * @type Function
		 * @default function (response) { return response; }
		 * @for defaults
		 * @since 1.1.0
		 **/
		responseHandler: function (response) { return response; },

		/**
		 * A list of converters.
		 *
		 * @property converters
		 * @type Object
		 * @for defaults
		 * @since 1.0.0
		 **/
		converters: {
			numeric: {
				from: function (value) { return +value; }, // converts from string to numeric
				to: function (value) { return value == null ? "" : value + ""; }, // converts from numeric to string
				sort: function (value) { return +value; }
			},
			string: {
				// default converter
				from: function (value) { return value; },
				to: function (value) { return value; },
				sort: function (value) { return value; }
			},
			//McCrea - adding date... for formatting options go to  moment js dot com
			date: {
				from: function (value) {
					var returnValue;
					if (!$.trim(value)) {
						returnValue = "";
					} else {
						var dateObj = new Date(value);
						returnValue = moment(dateObj).format("M/D/YYYY");
					}
					return returnValue;
				},
				to: function (value) {
					//in this case it should be in the same format, so no need to do any different
					var returnValue;
					if (!$.trim(value)) {
						returnValue = "";
					} else {
						//  account for time zone offset handling being different across browsers when date comes in as UTC from json
						var dateObj;
						if (value.indexOf("/") >= 0) {
							dateObj = new Date(value);
						} else {
							value = value + "+00:00";
							dateObj = new Date(value);
							dateObj = new Date((dateObj.getTime() + (dateObj.getTimezoneOffset() * 60 * 1000)));
						}

						returnValue = moment(dateObj).format("M/D/YYYY");
					}
					return returnValue;
				},
				sort: function (value) {
					return new Date(value);
				}
			},
			//Ed
			dateGeneral: {
				from: function (value) {
					var returnValue;
					if (!$.trim(value)) {
						returnValue = "";
					} else {
						var dateObj = new Date(value);
						returnValue = moment(dateObj).format("M/D/YYYY h:mm:ss A");
					}
					return returnValue;
				},
				to: function (value) {
					//in this case it should be in the same format, so no need to do any different
					var returnValue;
					if (!$.trim(value)) {
						returnValue = "";
					} else {
						//  account for time zone offset handling being different across browsers when date comes in as UTC from json
						var dateObj;
						if (value.indexOf("/") >= 0) {
							dateObj = new Date(value);
						} else {
							value = value + "+00:00";
							dateObj = new Date(value);
							dateObj = new Date((dateObj.getTime() + (dateObj.getTimezoneOffset() * 60 * 1000)));
						}

						returnValue = moment(dateObj).format("M/D/YYYY h:mm:ss A");
					}
					return returnValue;
				},
				sort: function (value) {
					return new Date(value);
				}
			},
			//McCrea - adding currency... 
			currencyNoDecimal: {
				to: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = "";
					} else {
						returnValue = $("<span>" + value + "</span>").formatCurrency({ roundToDecimalPlace: 0 }).text();
					}
					return returnValue;
				},
				from: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = null;
					} else {
						returnValue = $("<span>" + value + "</span>").asNumber({ parseType: 'int' });
					}
					return returnValue;
				},
				sort: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = null;
					} else {
						returnValue = $("<span>" + value + "</span>").asNumber({ parseType: 'int' });
					}
					return returnValue;
				}
			},
			//McCrea - adding currency... 
			currencyTwoDecimal: {
				to: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = "";
					} else {
						returnValue = $("<span>" + value + "</span>").formatCurrency().text();
					}
					return returnValue;
				},
				from: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = null;
					} else {
						returnValue = $("<span>" + value + "</span>").asNumber();
					}
					return returnValue;
				},
				sort: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = null;
					} else {
						returnValue = $("<span>" + value + "</span>").asNumber();
					}
					return returnValue;
				}
			},
			//McCrea - adding decimal... 
			percentNoDecimal: {
				to: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = "";
					} else {
						returnValue = $("<span>" + value + "</span>").formatCurrency({ roundToDecimalPlace: 0, symbol: "%", positiveFormat: '%n %s', negativeFormat: '%n %s' }).text();
					}
					return returnValue;
				},
				from: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = null;
					} else {
						returnValue = $("<span>" + value + "</span>").asNumber({ parseType: 'int' });
					}
					return returnValue;
				},
				sort: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = null;
					} else {
						returnValue = $("<span>" + value + "</span>").asNumber({ parseType: 'int' });
					}
					return returnValue;
				}
			},
			//McCrea - adding decimal... 
			percentTwoDecimal: {
				to: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = "";
					} else {
						returnValue = $("<span>" + value + "</span>").formatCurrency({ symbol: "%", positiveFormat: '%n %s', negativeFormat: '%n %s' }).text();
					}
					return returnValue;
				},
				from: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = null;
					} else {
						returnValue = $("<span>" + value + "</span>").asNumber();
					}
					return returnValue;
				},
				sort: function (value) {
					var returnValue;
					if (value === null || value === "") {
						returnValue = null;
					} else {
						returnValue = $("<span>" + value + "</span>").asNumber();
					}
					return returnValue;
				}
			}
		},

		/**
		 * Contains all css classes.
		 *
		 * @property css
		 * @type Object
		 * @for defaults
		 **/
		css: {
			actions: "actions btn-group", // must be a unique class name or constellation of class names within the header and footer
			center: "text-center",
			columnHeaderAnchor: "column-header-anchor", // must be a unique class name or constellation of class names within the column header cell
			columnHeaderText: "text",
			dropDownItem: "dropdown-item", // must be a unique class name or constellation of class names within the actionDropDown,
			dropDownItemButton: "dropdown-item-button", // must be a unique class name or constellation of class names within the actionDropDown
			dropDownItemCheckbox: "dropdown-item-checkbox", // must be a unique class name or constellation of class names within the actionDropDown
			dropDownMenu: "dropdown btn-group", // must be a unique class name or constellation of class names within the actionDropDown
			dropDownMenuItems: "dropdown-menu pull-right", // must be a unique class name or constellation of class names within the actionDropDown
			dropDownMenuText: "dropdown-text", // must be a unique class name or constellation of class names within the actionDropDown
			footer: "bootgrid-footer container-fluid",
			header: "bootgrid-header container-fluid",
			icon: "icon glyphicon",
			iconColumns: "glyphicon-th-list",
			iconDown: "glyphicon-chevron-down",
			iconRefresh: "glyphicon-refresh",
			iconSearch: "glyphicon-search",
			iconUp: "glyphicon-chevron-up",
			iconFilter: "glyphicon glyphicon-filter",
			infos: "infos", // must be a unique class name or constellation of class names within the header and footer,
			left: "text-left",
			pagination: "pagination", // must be a unique class name or constellation of class names within the header and footer
			paginationButton: "button", // must be a unique class name or constellation of class names within the pagination

			/**
			 * CSS class to select the parent div which activates responsive mode.
			 *
			 * @property responsiveTable
			 * @type String
			 * @default "table-responsive"
			 * @for css
			 * @since 1.1.0
			 **/
			responsiveTable: "table-responsive",

			right: "text-right",
			search: "search form-group", // must be a unique class name or constellation of class names within the header and footer
			searchField: "search-field form-control",
			selectBox: "select-box", // must be a unique class name or constellation of class names within the entire table
			selectCell: "select-cell", // must be a unique class name or constellation of class names within the entire table

			/**
			 * CSS class to highlight selected rows.
			 *
			 * @property selected
			 * @type String
			 * @default "active"
			 * @for css
			 * @since 1.1.0
			 **/
			selected: "active",

			sortable: "sortable",
			table: "bootgrid-table table"
		},

		/**
		 * A dictionary of formatters.
		 *
		 * @property formatters
		 * @type Object
		 * @for defaults
		 * @since 1.0.0
		 **/
		formatters: {},

		/**
		 * Contains all labels.
		 *
		 * @property labels
		 * @type Object
		 * @for defaults
		 **/
		labels: {
			all: "All",
			infos: "Showing {{ctx.start}} to {{ctx.end}} of {{ctx.total}} entries",
			loading: "Loading...",
			noResults: "No results found!",
			refresh: "Refresh",
			search: "Search"
		},

		/**
		 * Specifies the mapping between status and contextual classes to color rows.
		 *
		 * @property statusMapping
		 * @type Object
		 * @for defaults
		 * @since 1.2.0
		 **/
		statusMapping: {
			/**
			 * Specifies a successful or positive action.
			 *
			 * @property 0
			 * @type String
			 * @for statusMapping
			 **/
			0: "success",

			/**
			 * Specifies a neutral informative change or action.
			 *
			 * @property 1
			 * @type String
			 * @for statusMapping
			 **/
			1: "info",

			/**
			 * Specifies a warning that might need attention.
			 *
			 * @property 2
			 * @type String
			 * @for statusMapping
			 **/
			2: "warning",

			/**
			 * Specifies a dangerous or potentially negative action.
			 *
			 * @property 3
			 * @type String
			 * @for statusMapping
			 **/
			3: "danger"
		},

		/**
		 * Contains all templates.
		 *
		 * @property templates
		 * @type Object
		 * @for defaults
		 **/
		templates: {
			actionButton: "<button class=\"btn btn-default\" type=\"button\" title=\"{{ctx.text}}\">{{ctx.content}}</button>",
			actionDropDown: "<div class=\"{{css.dropDownMenu}}\"><button class=\"btn btn-default dropdown-toggle\" type=\"button\" data-toggle=\"dropdown\"><span class=\"{{css.dropDownMenuText}}\">{{ctx.content}}</span> <span class=\"caret\"></span></button><ul class=\"{{css.dropDownMenuItems}}\" role=\"menu\"></ul></div>",
			actionDropDownItem: "<li><a href=\"{{ctx.uri}}\" class=\"{{css.dropDownItem}} {{css.dropDownItemButton}}\">{{ctx.text}}</a></li>",
			actionDropDownCheckboxItem: "<li><label class=\"{{css.dropDownItem}}\"><input name=\"{{ctx.name}}\" type=\"checkbox\" value=\"1\" class=\"{{css.dropDownItemCheckbox}}\" {{ctx.checked}} /> {{ctx.label}}</label></li>",
			actions: "<div class=\"{{css.actions}}\"></div>",
			body: "<tbody></tbody>",
			cell: "<td class=\"{{ctx.css}}\" style=\"{{ctx.style}}\">{{ctx.content}}</td>",
			footer: "<div id=\"{{ctx.id}}\" class=\"{{css.footer}}\"><div class=\"row\"><div class=\"col-sm-6\"><p class=\"{{css.pagination}}\"></p></div><div class=\"col-sm-6 infoBar\"><p class=\"{{css.infos}}\"></p></div></div></div>",
			header: "<div id=\"{{ctx.id}}\" class=\"{{css.header}}\"><div class=\"row\"><div class=\"col-sm-12 actionBar\"><p class=\"{{css.search}}\"></p><p class=\"{{css.actions}}\"></p></div></div></div>",
			headerCell: "<th data-column-id=\"{{ctx.column.id}}\" class=\"{{ctx.css}}\" style=\"{{ctx.style}}\"><a href=\"javascript:void(0);\" class=\"{{css.columnHeaderAnchor}} {{ctx.sortable}}\"><span class=\"{{css.columnHeaderText}}\">{{ctx.column.text}}</span>{{ctx.icon}}</a></th>",
			icon: "<span class=\"{{css.icon}} {{ctx.iconCss}}\"></span>",
			infos: "<div class=\"{{css.infos}}\">{{lbl.infos}}</div>",
			loading: "<tr><td colspan=\"{{ctx.columns}}\" class=\"loading\">{{lbl.loading}}</td></tr>",
			noResults: "<tr><td colspan=\"{{ctx.columns}}\" class=\"no-results\">{{lbl.noResults}}</td></tr>",
			pagination: "<ul class=\"{{css.pagination}}\"></ul>",
			paginationItem: "<li class=\"{{ctx.css}}\"><a href=\"{{ctx.uri}}\" class=\"{{css.paginationButton}}\">{{ctx.text}}</a></li>",
			rawHeaderCell: "<th class=\"{{ctx.css}}\">{{ctx.content}}</th>", // Used for the multi select box
			row: "<tr{{ctx.attr}}>{{ctx.cells}}</tr>",
			search: "<div class=\"{{css.search}}\"><div class=\"input-group\"><span class=\"{{css.icon}} input-group-addon {{css.iconSearch}}\"></span> <input type=\"text\" class=\"{{css.searchField}}\" placeholder=\"{{lbl.search}}\" /></div></div>",
			select: "<input name=\"select\" type=\"{{ctx.type}}\" class=\"{{css.selectBox}}\" value=\"{{ctx.value}}\" {{ctx.checked}} />"
		},
		/**
		 * Defines whether inline editing is allowed.  McCrea - Extension
		 *
		 * @property enableChildRows
		 * @type Boolean
		 * @default false
		 * @for defaults
		 **/
		enableChildRows: false,
		childRowSettings: {
			loadExpanded: false,
			expandedCallBack: "",
                        defaultRowText: "No Results Found"
		},
		/**
		 * Defines whether inline editing is allowed.  McCrea - Extension
		 *
		 * @property editable
		 * @type Boolean
		 * @default false
		 * @for defaults
		 **/
		editable: false,
		editableSettings: {
			columns: {},   //define inputs for editable columns
			empty: false,  //allows for data entry if true - data does not pull into grid
			emptyRowCount: 5,                //number of empty rows to display at a time
			spreadsheet: false,              //allows for rows to be loaded in editable state
			spreadsheetOnBlur: "" //function to fire on blur of editable cells
		},
		/**
		 * Defines whether the grid is filterable.  McCrea - Extension
		 *
		 * See jui_filter_rules plugin documentation - http://www.pontikis.net/labs/jui_filter_rules/
		 */
		useFilters: false,
		filterOptions: {
			allowSave: false, //McCrea - new option I added to allow 'saving' of the filters
			filters: [],
			filter_rules: [],
			filter_toggle_id_prefix: "filter_toggle_",
			filter_container_id_prefix: "flt_container_",
			filter_rules_id_prefix: "flt_rules_",
			filter_tools_id_prefix: "flt_tools_",
			filterToggleActiveClass: "btn-info",
			filterApplyBtnClass: "btn btn-success btn-sm filters-button",
			filterResetBtnClass: "btn btn-danger btn-sm filters-button",
			filterSaveBtnClass: "btn btn-primary btn-sm filters-button",
			filterContainerClass: "well filters-container",
			filterToolsClass: "pull-right",
			bootstrap_version: "3",
			onValidationError: function (event, data) {
				alert(data["err_description"] + ' (' + data["err_code"] + ')');
				if (data.hasOwnProperty("elem_filter")) {
					data.elem_filter.focus();
				}
			}
		}
	};

	/**
	 * Appends rows.
	 *
	 * @method append
	 * @param rows {Array} An array of rows to append
	 * @chainable
	 **/
	Grid.prototype.append = function (rows) {
		if (this.options.ajax) {
			// todo: implement ajax DELETE
		}
		else {
			var appendedRows = [];
			for (var i = 0; i < rows.length; i++) {
				if (appendRow.call(this, rows[i])) {
					appendedRows.push(rows[i]);
				}
			}
			sortRows.call(this);
			highlightAppendedRows.call(this, appendedRows);
			loadData.call(this);
			this.element.trigger("appended" + namespace, [appendedRows]);
		}

		return this;
	};

	/**
	 * Removes all rows.
	 *
	 * @method clear
	 * @chainable
	 **/
	Grid.prototype.clear = function () {
		if (this.options.ajax) {
			// todo: implement ajax POST
		}
		else {
			var removedRows = $.extend([], this.rows);
			this.rows = [];
			this.current = 1;
			this.total = 0;
			loadData.call(this);
			this.element.trigger("cleared" + namespace, [removedRows]);
		}

		return this;
	};

	/**
	 * Removes the control functionality completely and transforms the current state to the initial HTML structure.
	 *
	 * @method destroy
	 * @chainable
	 **/
	Grid.prototype.destroy = function () {
		// todo: this method has to be optimized (the complete initial state must be restored)
		$(window).off(namespace);
		if (this.options.navigation & 1) {
			this.header.remove();
		}
		if (this.options.navigation & 2) {
			this.footer.remove();
		}
		if (that.options.useFilters) {
			var container_id = that.element._bgId(),
				filter_container_id = create_id(that.options.filterOptions.filter_container_id_prefix, container_id);
			$('#' + filter_container_id).remove();
		}
		this.element.before(this.origin).remove();

		return this;
	};

	/**
	 * Resets the state and reloads rows.
	 *
	 * @method reload
	 * @chainable
	 **/
	Grid.prototype.reload = function () {
		this.current = 1; // reset
		loadData.call(this);

		return this;
	};

	/**
	 * Resets the state and reloads rows.
	 *
	 * @method reload
	 * @chainable
	 * @McCrea extension
	 **/
	Grid.prototype.reloadFilter = function (filterRules) {
		this.current = 1; // reset

		this.options.filterOptions.filter_rules = filterRules;
		prepareFilter.call(this);

		//TODO: might have to add more reset logic here down the road
		// Reset selected rows

		this.current = 1;

		loadData.call(this);

		return this;
	};

	/**
	 * Removes rows by ids. Removes selected rows if no ids are provided.
	 *
	 * @method remove
	 * @param [rowsIds] {Array} An array of rows ids to remove
	 * @chainable
	 **/
	Grid.prototype.remove = function (rowIds) {
		if (this.identifier != null) {
			var that = this;

			if (this.options.ajax) {
				// todo: implement ajax DELETE
			}
			else {
				rowIds = rowIds || this.selectedRows;
				var id,
					removedRows = [];

				for (var i = 0; i < rowIds.length; i++) {
					id = rowIds[i];

					for (var j = 0; j < this.rows.length; j++) {
						if (this.rows[j][this.identifier] === id) {
							removedRows.push(this.rows[j]);
							this.rows.splice(j, 1);
							break;
						}
					}
				}

				this.current = 1; // reset
				loadData.call(this);
				this.element.trigger("removed" + namespace, [removedRows]);
			}
		}

		return this;
	};

	/**
	 * Searches in all rows for a specific phrase (but only in visible cells). 
	 * The search filter will be reseted, if no argument is provided.
	 *
	 * @method search
	 * @param [phrase] {String} The phrase to search for
	 * @chainable
	 **/
	Grid.prototype.search = function (phrase) {
		phrase = phrase || "";

		if (this.searchPhrase !== phrase) {
			var selector = getCssSelector(this.options.css.searchField),
				searchFields = findFooterAndHeaderItems.call(this, selector);
			searchFields.val(phrase);
		}

		executeSearch.call(this, phrase);

		return this;
	};

	/**
	 * Selects rows by ids. Selects all visible rows if no ids are provided.
	 * In server-side scenarios only visible rows are selectable.
	 *
	 * @method select
	 * @param [rowsIds] {Array} An array of rows ids to select
	 * @chainable
	 **/
	Grid.prototype.select = function (rowIds) {
		if (this.selection) {
			rowIds = rowIds || this.currentRows.propValues(this.identifier);

			var id, i,
				selectedRows = [];

			while (rowIds.length > 0 && !(!this.options.multiSelect && selectedRows.length === 1)) {
				id = rowIds.pop();
				if ($.inArray(id, this.selectedRows) === -1) {
					for (i = 0; i < this.currentRows.length; i++) {
						if (this.currentRows[i][this.identifier] === id) {
							selectedRows.push(this.currentRows[i]);
							this.selectedRows.push(id);
							break;
						}
					}
				}
			}

			if (selectedRows.length > 0) {
				var selectBoxSelector = getCssSelector(this.options.css.selectBox),
					selectMultiSelectBox = this.selectedRows.length >= this.currentRows.length;

				i = 0;
				while (!this.options.keepSelection && selectMultiSelectBox && i < this.currentRows.length) {
					selectMultiSelectBox = ($.inArray(this.currentRows[i++][this.identifier], this.selectedRows) !== -1);
				}
				this.element.find("thead " + selectBoxSelector).prop("checked", selectMultiSelectBox);

				if (!this.options.multiSelect) {
					this.element.find("tbody > tr " + selectBoxSelector + ":checked")
						.trigger("click" + namespace);
				}

				for (i = 0; i < this.selectedRows.length; i++) {
					this.element.find("tbody > tr[data-row-id=\"" + this.selectedRows[i] + "\"]")
						.addClass(this.options.css.selected)._bgAria("selected", "true")
						.find(selectBoxSelector).prop("checked", true);
				}

				this.element.trigger("selected" + namespace, [selectedRows]);
			}
		}

		return this;
	};

	/**
	 * Deselects rows by ids. Deselects all visible rows if no ids are provided.
	 * In server-side scenarios only visible rows are deselectable.
	 *
	 * @method deselect
	 * @param [rowsIds] {Array} An array of rows ids to deselect
	 * @chainable
	 **/
	Grid.prototype.deselect = function (rowIds) {
		if (this.selection) {
			rowIds = rowIds || this.currentRows.propValues(this.identifier);

			var id, i, pos,
				deselectedRows = [];

			while (rowIds.length > 0) {
				id = rowIds.pop();
				pos = $.inArray(id, this.selectedRows);
				if (pos !== -1) {
					for (i = 0; i < this.currentRows.length; i++) {
						if (this.currentRows[i][this.identifier] === id) {
							deselectedRows.push(this.currentRows[i]);
							this.selectedRows.splice(pos, 1);
							break;
						}
					}
				}
			}

			if (deselectedRows.length > 0) {
				var selectBoxSelector = getCssSelector(this.options.css.selectBox);

				this.element.find("thead " + selectBoxSelector).prop("checked", false);
				for (i = 0; i < deselectedRows.length; i++) {
					this.element.find("tbody > tr[data-row-id=\"" + deselectedRows[i][this.identifier] + "\"]")
						.removeClass(this.options.css.selected)._bgAria("selected", "false")
						.find(selectBoxSelector).prop("checked", false);
				}

				this.element.trigger("deselected" + namespace, [deselectedRows]);
			}
		}

		return this;
	};

	/**
	 * Sorts the rows by a given sort descriptor dictionary. 
	 * The sort filter will be reseted, if no argument is provided.
	 *
	 * @method sort
	 * @param [dictionary] {Object} A sort descriptor dictionary that contains the sort information
	 * @chainable
	 **/
	Grid.prototype.sort = function (dictionary) {
		var values = (dictionary) ? $.extend({}, dictionary) : {};

		if (values === this.sortDictionary) {
			return this;
		}

		this.sortDictionary = values;
		renderTableHeader.call(this);
		sortRows.call(this);
		loadData.call(this);

		return this;
	};

	/**
	 * Gets a list of the column settings.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getColumnSettings
	 * @return {Array} Returns a list of the column settings.
	 * @since 1.2.0
	 **/
	Grid.prototype.getColumnSettings = function () {
		return $.merge([], this.columns);
	};

	/**
	 * Gets the current page index.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getCurrentPage
	 * @return {Number} Returns the current page index.
	 * @since 1.2.0
	 **/
	Grid.prototype.getCurrentPage = function () {
		return this.current;
	};

	/**
	 * Gets the current rows.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getCurrentPage
	 * @return {Array} Returns the current rows.
	 * @since 1.2.0
	 **/
	Grid.prototype.getCurrentRows = function () {
		return $.merge([], this.currentRows);
	};

	/**
	 * Gets a number represents the row count per page.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getRowCount
	 * @return {Number} Returns the row count per page.
	 * @since 1.2.0
	 **/
	Grid.prototype.getRowCount = function () {
		return this.rowCount;
	};

	/**
	 * Gets the actual search phrase.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getSearchPhrase
	 * @return {String} Returns the actual search phrase.
	 * @since 1.2.0
	 **/
	Grid.prototype.getSearchPhrase = function () {
		return this.searchPhrase;
	};

	/**
	 * Gets the complete list of currently selected rows.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getSelectedRows
	 * @return {Array} Returns all selected rows.
	 * @since 1.2.0
	 **/
	Grid.prototype.getSelectedRows = function () {
		return $.merge([], this.selectedRows);
	};

	/**
	 * Gets the sort dictionary which represents the state of column sorting.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getSortDictionary
	 * @return {Object} Returns the sort dictionary.
	 * @since 1.2.0
	 **/
	Grid.prototype.getSortDictionary = function () {
		return $.extend({}, this.sortDictionary);
	};

	/**
	 * Gets a number represents the total page count.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getTotalPageCount
	 * @return {Number} Returns the total page count.
	 * @since 1.2.0
	 **/
	Grid.prototype.getTotalPageCount = function () {
		return this.totalPages;
	};

	/**
	 * Gets a number represents the total row count.
	 * This method returns only for the first grid instance a value.
	 * Therefore be sure that only one grid instance is catched by your selector.
	 *
	 * @method getTotalRowCount
	 * @return {Number} Returns the total row count.
	 * @since 1.2.0
	 **/
	Grid.prototype.getTotalRowCount = function () {
		return this.total;
	};

	/**
	 * Sets the row to editable.
	 *
	 * @method edit
	 * @McCrea Extension
	 **/
	Grid.prototype.editRow = function (row, event) {
		var rowId = $(row).data("row-id");
		if (event.handled !== true) {
			event.preventDefault();

			var $button;

			if ($(event.target).is(":button")) {
				$button = $(event.target);
			} else {
				$button = $(event.target).closest(":button");
			}

			// Get current state before reset to view mode.
			var activated = $button.hasClass('active');

			// Change to view mode columns that are in edit mode.
			Edit.reset($("table").find('td.tabledit-edit-mode')); //TODO: Come back - table might be ok as long as every field gets reset when multiple tables present

			if (!activated) {
				// Change to edit mode for all columns in reverse way.
				$($button.parents('tr').find('td.tabledit-view-mode').get().reverse()).each(function () {
					Mode.edit(this);
				});

				//McCrea - vendor specific code for date picker, input masks and validation
				// Initialize any datepickers, input masks and validators
				$(".date-picker").datepicker(); //jquery ui date picker
				$(":input").inputmask();        //jquery input mask
				$('form').validetta({ realTime: true });          //validetta
			}

			event.handled = true;
		}
	};

	/**
	 * Returns the edits to the row as JSON.
	 *
	 * @method getRow
	 * @McCrea Extension
	 **/
	Grid.prototype.getRow = function (row, event) {
		var rowId = $(row).data("row-id");
		if (event.handled !== true) {
			event.preventDefault();

			// Update all columns and return JSON
			var retJson = Edit.submit(this, $("form").find('.tabledit-edit-mode').parent(), rowId);

			event.handled = true;

			return retJson;
		}

		return "";
	};

	/**
	 * Returns the rows as JSON.
	 *
	 * @method getRows
	 * @McCrea Extension
	 **/
	Grid.prototype.getRows = function (grid, e) {
		if (event.handled !== true) {
			event.preventDefault();

			//McCrea - vendor specific code for validation
			$('form').trigger("validetta:validate");

			if ($('td').hasClass("validetta-error")) {
				return "";
			}

			//var strJson = "{'id': '" + rowId + "'";
			var strJson = "[{";

			// Original thought was to use ajax to submit - decided to let the page handle that, so return json
			//var cells = tr.children("td");

			//McCrea - this seems completely unnecessary but we do not have TR's for the columns which are not visible (at least not ID)
			var cols = [];
			$.each(this.columns, function (i, column) {
				if (column.visible) {
					cols.push(column);
				}
			});

			$(".bootgrid-table tbody tr").each(function () {
				var rowId = $(this).attr("data-row-id");

				if ((rowId != undefined) && rowId > 0) {
					strJson = strJson + "'id': '" + rowId + "'";
				} else {
					strJson = strJson + "'id': '0'";
				}

				var cells = $(this).children("td");

				$.each(cols, function (i, column) {
					var finalText = "";
					var $input = $(cells[i]).find('.tabledit-input');

					if ($input.length > 0) {
						// Set span text with input/select new value.
						if ($input.is('select')) {
							finalText = $input.find('option:selected').val();
							$(cells[i]).find('.tabledit-span').text($input.find('option:selected').text());
						} else {
							if ($input.is(':checkbox')) {
								if ($input.is(':checked')) {
									//need to use the positive indicator text
									var posText = $input.attr("data-positive");
									finalText = posText;
									$(cells[i]).find('.tabledit-span').text(posText);
								} else {
									//need to use the negative indicator text
									var negText = $input.attr("data-negative");
									finalText = negText;
									$(cells[i]).find('.tabledit-span').text(negText);
								}
							} else {
								finalText = column.converter.from($input.val());
								$(cells[i]).find('.tabledit-span').text(column.converter.to($input.val()));
							}
						}
						strJson = strJson + ", '" + column.id + "': '" + finalText + "'";

						//McCrea - vendor specific code for validation
						// Clear up any leftover validations - specific to validetta
						//$('form').validetta();
						$('form').trigger("validetta:clear");

						//Mode.view(cells[i]);
					}
				});

				strJson = strJson + "},{";
			});

			strJson = strJson.slice(0, -2);
			strJson = strJson + "]";

			event.handled = true;

			return strJson;
		}

		return "";
	};

	/**
	 * Removes row from grid.
	 *
	 * @method removeRow
	 * @McCrea Extension
	 **/
	Grid.prototype.removeRow = function (elem, event) {
		if (event.handled !== true) {
			event.preventDefault();

			var row = $(elem).closest("tr");

			$(row).remove();

			event.handled = true;
		}
	};

	/**
	 * Adds configured number of empty rows.
	 *
	 * @method addEmptyRows
	 * @McCrea Extension
	 **/
	Grid.prototype.addEmptyRows = function (e) {
		if (event.handled !== true) {
			event.preventDefault();

			loadRows.call(this);

			triggerEvents.call(this);

			event.handled = true;
		}
	};

	/**
	 * Returns the filter object currently applied.
	 *
	 * @method getFilter
	 * @McCrea Extension
	 **/
	Grid.prototype.getFilter = function () {
		return this.options.filterOptions.filter_rules;
	};

	//McCrea - extension method for sub rows
	Grid.prototype.toggleRow = function (el, callback) {
		var targetId = $(el).data("row-id");
		var targetElAccessor = "#expander-" + targetId;

		if ($(el).hasClass("bg-expanded")) {
			//row is already expanded, need to collapse
			$(el).removeClass("bg-expanded").removeClass("btn-danger").addClass("btn-success");
			$(el).find(".fa").removeClass("fa-minus").addClass("fa-plus");

			$(targetElAccessor).hide();
		} else {
			//row is not expanded
			$(el).addClass("bg-expanded").addClass("btn-danger").removeClass("btn-success");
			$(el).find(".fa").addClass("fa-minus").removeClass("fa-plus");

			$(targetElAccessor).show();
		}

		if (callback != undefined) {
			if (typeof callback === "function") {
				var elemToPass = $(targetElAccessor).find("td");
				callback(targetId, elemToPass);
			}
		}
	};

	// GRID COMMON TYPE EXTENSIONS
	// ============

	$.fn.extend({
		_bgAria: function (name, value) {
			return (value) ? this.attr("aria-" + name, value) : this.attr("aria-" + name);
		},

		_bgBusyAria: function (busy) {
			return (busy == null || busy) ?
				this._bgAria("busy", "true") :
				this._bgAria("busy", "false");
		},

		_bgRemoveAria: function (name) {
			return this.removeAttr("aria-" + name);
		},

		_bgEnableAria: function (enable) {
			return (enable == null || enable) ?
				this.removeClass("disabled")._bgAria("disabled", "false") :
				this.addClass("disabled")._bgAria("disabled", "true");
		},

		_bgEnableField: function (enable) {
			return (enable == null || enable) ?
				this.removeAttr("disabled") :
				this.attr("disabled", "disable");
		},

		_bgShowAria: function (show) {
			return (show == null || show) ?
				this.show()._bgAria("hidden", "false") :
				this.hide()._bgAria("hidden", "true");
		},

		_bgSelectAria: function (select) {
			return (select == null || select) ?
				this.addClass("active")._bgAria("selected", "true") :
				this.removeClass("active")._bgAria("selected", "false");
		},

		_bgId: function (id) {
			return (id) ? this.attr("id", id) : this.attr("id");
		}
	});

	if (!String.prototype.resolve) {
		var formatter = {
			"checked": function (value) {
				if (typeof value === "boolean") {
					return (value) ? "checked=\"checked\"" : "";
				}
				return value;
			}
		};

		String.prototype.resolve = function (substitutes, prefixes) {
			var result = this;
			$.each(substitutes, function (key, value) {
				if (value != null && typeof value !== "function") {
					if (typeof value === "object") {
						var keys = (prefixes) ? $.extend([], prefixes) : [];
						keys.push(key);
						result = result.resolve(value, keys) + "";
					}
					else {
						if (formatter && formatter[key] && typeof formatter[key] === "function") {
							value = formatter[key](value);
						}
						key = (prefixes) ? prefixes.join(".") + "." + key : key;
						var pattern = new RegExp("\\{\\{" + key + "\\}\\}", "gm");
						result = result.replace(pattern, (value.replace) ? value.replace(/\$/gi, "&#36;") : value);
					}
				}
			});
			return result;
		};
	}

	if (!Array.prototype.first) {
		Array.prototype.first = function (condition) {
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
				if (condition(item)) {
					return item;
				}
			}
			return null;
		};
	}

	if (!Array.prototype.contains) {
		Array.prototype.contains = function (condition) {
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
				if (condition(item)) {
					return true;
				}
			}
			return false;
		};
	}

	if (!Array.prototype.page) {
		Array.prototype.page = function (page, size) {
			var skip = (page - 1) * size,
				end = skip + size;
			return (this.length > skip) ?
				(this.length > end) ? this.slice(skip, end) :
					this.slice(skip) : [];
		};
	}

	if (!Array.prototype.where) {
		Array.prototype.where = function (condition) {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
				if (condition(item)) {
					result.push(item);
				}
			}
			return result;
		};
	}

	if (!Array.prototype.propValues) {
		Array.prototype.propValues = function (propName) {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				result.push(this[i][propName]);
			}
			return result;
		};
	}

	// GRID PLUGIN DEFINITION
	// =====================

	var old = $.fn.bootgrid;

	$.fn.bootgrid = function (option) {
		var args = Array.prototype.slice.call(arguments, 1),
			returnValue = null,
			elements = this.each(function (index) {
				var $this = $(this),
					instance = $this.data(namespace),
					options = typeof option === "object" && option;

				if (!instance && option === "destroy") {
					return;
				}
				if (!instance) {
					$this.data(namespace, (instance = new Grid(this, options)));
					init.call(instance);
				}
				if (typeof option === "string") {
					if (option.indexOf("get") === 0 && index === 0) {
						returnValue = instance[option].apply(instance, args);
					}
					else if (option.indexOf("get") !== 0) {
						return instance[option].apply(instance, args);
					}
				}
			});
		return (typeof option === "string" && option.indexOf("get") === 0) ? returnValue : elements;
	};

	$.fn.bootgrid.Constructor = Grid;

	// GRID NO CONFLICT
	// ===============

	$.fn.bootgrid.noConflict = function () {
		$.fn.bootgrid = old;
		return this;
	};

	// GRID DATA-API
	// ============

	$("[data-toggle=\"bootgrid\"]").bootgrid();
})(jQuery, window);