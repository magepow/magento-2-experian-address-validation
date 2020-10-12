

;(function(window, document, undefined) {

    "use strict";

// Create ContactDataServices constructor and namespace on the window object (if not already present)
    var ContactDataServices = window.ContactDataServices = window.ContactDataServices || {};

// Default settings
    ContactDataServices.defaults = {
        input: { placeholderText: "Start typing an address...", applyFocus: false },
        formattedAddressContainer: { showHeading: false, headingType: "h3", validatedHeadingText: "Validated address", manualHeadingText: "Manual address entered"  },
        searchAgain: { visible: true, text: ""},
        useAddressEnteredText: "",/*<em>Enter address manually</em>*/
        useSpinner: false,
        language: "en",
        addressLineLabels: [
            "addressLine1",
            "addressLine2",
            "addressLine3",
            "locality",
            "province",
            "postalCode",
            "country"
        ]
    };

// Create configuration by merging custom and default options
    ContactDataServices.mergeDefaultOptions = function(customOptions){
        var instance = customOptions || {};

        instance.enabled = true;
        instance.language = instance.language || ContactDataServices.defaults.language;
        instance.useSpinner = instance.useSpinner || ContactDataServices.defaults.useSpinner;
        instance.lastSearchTerm = "";
        instance.currentSearchTerm = "";
        instance.lastCountryCode = "";
        instance.currentCountryCode = "";
        instance.currentSearchUrl = "";
        instance.currentFormatUrl = "";
        instance.applyFocus = (typeof instance.applyFocus !== "undefined") ? instance.applyFocus : ContactDataServices.defaults.input.applyFocus;
        instance.placeholderText = instance.placeholderText || ContactDataServices.defaults.input.placeholderText;
        instance.searchAgain = instance.searchAgain || {};
        instance.searchAgain.visible = (typeof instance.searchAgain.visible !== "undefined") ? instance.searchAgain.visible : ContactDataServices.defaults.searchAgain.visible;
        instance.searchAgain.text = instance.searchAgain.text || ContactDataServices.defaults.searchAgain.text;
        instance.formattedAddressContainer = instance.formattedAddressContainer || ContactDataServices.defaults.formattedAddressContainer;
        instance.formattedAddressContainer.showHeading = (typeof instance.formattedAddressContainer.showHeading !== "undefined") ? instance.formattedAddressContainer.showHeading : ContactDataServices.defaults.formattedAddressContainer.showHeading;
        instance.formattedAddressContainer.headingType = instance.formattedAddressContainer.headingType || ContactDataServices.defaults.formattedAddressContainer.headingType;
        instance.formattedAddressContainer.validatedHeadingText = instance.formattedAddressContainer.validatedHeadingText || ContactDataServices.defaults.formattedAddressContainer.validatedHeadingText;
        instance.formattedAddressContainer.manualHeadingText = instance.formattedAddressContainer.manualHeadingText || ContactDataServices.defaults.formattedAddressContainer.manualHeadingText;
        instance.elements = instance.elements || {};

        return instance;
    };

// Constructor method event listener (pub/sub type thing)
    ContactDataServices.eventFactory = function(){
        // Create the events object
        var events = {};

        // Create an object to hold the collection of events
        events.collection = {};

        // Subscribe a new event
        events.on = function (event, action) {
            // Create the property array on the collection object
            events.collection[event] = events.collection[event] || [];
            // Push a new action for this event onto the array
            events.collection[event].push(action);
        };

        // Publish (trigger) an event
        events.trigger = function (event, data) {
            // If this event is in our collection (i.e. anyone's subscribed)
            if (events.collection[event]) {
                // Loop over all the actions for this event
                for (var i = 0; i < events.collection[event].length; i++) {
                    // Create array with default data as 1st item
                    var args = [data];

                    // Loop over additional args and add to array
                    for (var a = 2; a < arguments.length; a++){
                        args.push(arguments[a]);
                    }

                    // Call each action for this event type, passing the args
                    try {
                        events.collection[event][i].apply(events.collection, args);
                    } catch (e) {
                        // What to do? Uncomment the below to show errors in your event actions
                        //console.error(e);
                    }
                }
            }
        };

        // Return the new events object to be used by whoever invokes this factory
        return events;
    };

// Translations
    ContactDataServices.translations = {
// language / country / property
        en: {
            gbr: {
                locality: "Town/City",
                province: "County",
                postalCode: "Post code"
            },
            usa: {
                locality: "City",
                province: "State",
                postalCode: "Zip code"
            }
        }
        // Add other languages below
    };

// Method to handle showing of UA (User Assistance) content
    ContactDataServices.ua = {
        banner: {
            show: function(html){
                // Retrieve the existing banner
                var banner = document.querySelector(".ua-banner");

                // Create a new banner if necessary
                if(!banner){
                    var firstChildElement = document.querySelector("body").firstChild;
                    banner = document.createElement("div");
                    banner.classList.add("ua-banner");
                    firstChildElement.parentNode.insertBefore(banner, firstChildElement.nextSibling);
                }

                // Apply the HTML content
                banner.innerHTML = html;
            },
            hide: function(){
                var banner = document.querySelector(".ua-banner");
                if(banner) {
                    banner.parentNode.removeChild(banner);
                }
            }
        }
    };

// Generate the URLs for the various requests
    ContactDataServices.urls = {
        endpoint: "https://api.edq.com/capture/address/v2/search",
        construct: {
            address: {
                // Construct the Search URL by appending query, country & take
                search: function(instance){
                    var url = ContactDataServices.urls.endpoint;
                    url += "?query=" + encodeURIComponent(instance.currentSearchTerm);
                    url += "&country=" + instance.currentCountryCode;
                    url += "&dataset=" + instance.currentDataSet;

                    if (instance.elements.location) {
                        url += "&location=" + instance.elements.location;
                    }

                    url += "&take=" + (instance.maxSize || instance.picklist.maxSize);
                    url += "&auth-token=" + instance.token;
                    return url;
                },
                // Append the token to the Format URL
                format: function(url, instance){
                    return url + "&auth-token=" + instance.token;
                }
            }
        },
        // Get token from query string and set on instance
        getToken: function(instance){
            if(!instance.token) {
                instance.token = ContactDataServices.urls.getParameter("token");
            }
        },
        getParameter: function(name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    };
// Integrate with address searching
    ContactDataServices.address = function(customOptions){
        // Build our new instance by merging custom and default options
        var instance = ContactDataServices.mergeDefaultOptions(customOptions);

        // Create a new object to hold the events from the event factory
        instance.events = new ContactDataServices.eventFactory();

        // Initialise this instance
        instance.init = function(){
            // Get token from the query string
            ContactDataServices.urls.getToken(instance);
            if(!instance.token){
                // Disable searching on this instance
                instance.enabled = false;
                // Display a banner informing the user that they need a token
                ContactDataServices.ua.banner.show("<a href='https://github.com/experiandataquality/GlobalIntuitive#tokens'>Please provide a token for GlobalIntuitive.</a>");
                return;
            }

            instance.hasSearchInputBeenReset = true;
            instance.setCountryList();

            if(instance.elements.input){
                instance.input = instance.elements.input;
                instance.countryCodeMapping = instance.elements.countryCodeMapping || {};

                // Bind an event listener on the input
                instance.input.addEventListener("keyup", instance.search);
                instance.input.addEventListener("keydown", instance.checkTab);
                // Set a placeholder for the input
                instance.input.setAttribute("placeholder", instance.placeholderText);
                // Disable autocomplete on the form
                instance.input.parentNode.setAttribute("autocomplete", "off");
                // Disable form submission for demo purposes
                instance.input.parentNode.addEventListener('submit', function(event){
                    event.preventDefault();
                });
                // Apply focus to input
                if(instance.applyFocus){
                    instance.input.focus();
                }
            }
        };

        instance.unbind = function() {

            if (instance.elements.input) {
                instance.input = instance.elements.input;
                // Unbind previously bound listeners.
                instance.input.removeEventListener("keyup", instance.search);
                instance.input.removeEventListener("keydown", instance.checkTab);
                instance.input.parentNode.removeAttribute("autocomplete");
            }

        };
        // Main function to search for an address from an input string
        instance.search = function(event){
            // Handle keyboard navigation
            var e = event || window.event;
            e = e.which || e.keyCode;
            if (e === 38/*Up*/ || e === 40/*Down*/ || e === 13/*Enter*/) {
                instance.picklist.keyup(e);
                return;
            }

            instance.currentSearchTerm = instance.input.value;

            // Grab the country ISO code and (if it is present) the dataset name from the current value of the countryList (format: {countryIsoCode};{dataset})
            var currentCountryInfo = instance.countryCodeMapping[instance.countryList.value] || instance.countryList.value;

            currentCountryInfo = currentCountryInfo.split(";");
            instance.currentCountryCode = currentCountryInfo[0];
            instance.currentDataSet = currentCountryInfo[1] || "";


            // (Re-)set the property stating whether the search input has been reset.
            // This is needed for instances when the search input is also an address
            // output field. After an address has been returned, you don't want a new
            // search being triggered until the field has been cleared.
            if (instance.currentSearchTerm === "") {
                instance.hasSearchInputBeenReset = true;
            }

            // Check is searching is permitted
            if(instance.canSearch()){
                // Abort any outstanding requests
                if(instance.request.currentRequest){
                    instance.request.currentRequest.abort();
                }

                // Fire an event before a search takes place
                instance.events.trigger("pre-search", instance.currentSearchTerm);

                // Construct the new Search URL
                var url = ContactDataServices.urls.construct.address.search(instance);

                // Store the last search term
                instance.lastSearchTerm = instance.currentSearchTerm;

                // Hide any previous results
                instance.result.hide();

                // Hide the inline search spinner
                instance.searchSpinner.hide();

                // Show an inline spinner whilst searching
                instance.searchSpinner.show();

                // Initiate new Search request
                instance.request.get(url, instance.picklist.show);
            } else if(instance.lastSearchTerm !== instance.currentSearchTerm){
                // Clear the picklist if the search term is cleared/empty
                instance.picklist.hide();
            }
        };

        instance.setCountryList = function(){
            instance.countryList = instance.elements.countryList;

            // If the user hasn't passed us a country list, then create new list?
            if(!instance.countryList){
                instance.createCountryDropdown();
            }
        };

        // Determine whether searching is currently permitted
        instance.canSearch = function(){
            // If searching on this instance is enabled, and
            return (instance.enabled &&
                // If search term is not empty, and
                instance.currentSearchTerm !== "" &&
                // If search term is not the same as previous search term, and
                instance.lastSearchTerm !== instance.currentSearchTerm &&
                // If the country is not empty, and
                instance.countryList.value !== undefined && instance.countryList.value !== "" &&
                // If search input has been reset (if applicable)
                instance.hasSearchInputBeenReset === true);
        };

        //Determine whether tab key was pressed
        instance.checkTab = function(event) {
            var e = event || window.event;
            e = e.which || e.keyCode;
            if (e === 9 /*Tab*/) {
                instance.picklist.keyup(e);
                return;
            }
        };

        instance.createCountryDropdown = function(){
            // What countries?
            // Where to position it?
            instance.countryList = {};
        };

        // Get a final (Formatted) address
        instance.format = function(url){
            // Trigger an event
            instance.events.trigger("pre-formatting-search", url);

            // Hide the searching spinner
            instance.searchSpinner.hide();

            // Construct the format URL (append the token)
            instance.currentFormatUrl = ContactDataServices.urls.construct.address.format(url, instance);

            // Initiate a new Format request
            instance.request.get(instance.currentFormatUrl, instance.result.show);
        };

        instance.picklist = {
            // Set initial size
            size: 0,
            // Set initial max size
            maxSize: 25,
            // Render a picklist of search results
            show: function(items){
                // Store the picklist items
                instance.picklist.items = items.results;

                // Reset any previously selected current item
                instance.picklist.currentItem = null;

                // Update picklist size
                instance.picklist.size = instance.picklist.items.length;

                // Get/Create picklist container element
                instance.picklist.list = instance.picklist.list || instance.picklist.createList();

                // Ensure previous results are cleared
                instance.picklist.list.innerHTML = "";

                // Reset the picklist tab count (used for keyboard navigation)
                instance.picklist.resetTabCount();

                // Hide the inline search spinner
                instance.searchSpinner.hide();

                // Prepend an option for "use address entered"
                instance.picklist.useAddressEntered.element = instance.picklist.useAddressEntered.element || instance.picklist.useAddressEntered.create();

                if(instance.picklist.size > 0){
                    // Fire an event before picklist is created
                    instance.events.trigger("pre-picklist-create", instance.picklist.items);

                    // Iterate over and show results
                    instance.picklist.items.forEach(function(item){
                        // Create a new item/row in the picklist
                        var listItem = instance.picklist.createListItem(item);
                        instance.picklist.list.appendChild(listItem);

                        // Listen for selection on this item
                        instance.picklist.listen(listItem);
                    });

                    // Fire an event after picklist is created
                    instance.events.trigger("post-picklist-create");
                }
            },
            // Remove the picklist
            hide: function(){
                // Clear the current picklist item
                instance.picklist.currentItem = null;
                // Remove the "use address entered" option too
                instance.picklist.useAddressEntered.destroy();
                // Remove the main picklist container
                if(instance.picklist.list){
                    instance.input.parentNode.removeChild(instance.picklist.container);
                    instance.picklist.list = undefined;
                }
            },
            useAddressEntered: {
                // Create a "use address entered" option
                create: function(){
                    var item = {
                        suggestion: ContactDataServices.defaults.useAddressEnteredText,
                        format: ""
                    };
                    var listItem = instance.picklist.createListItem(item);
                    listItem.classList.add("use-address-entered");
                    instance.picklist.list.parentNode.insertBefore(listItem, instance.picklist.list.nextSibling);
                    listItem.addEventListener("click", instance.picklist.useAddressEntered.click);
                    return listItem;
                },
                // Destroy the "use address entered" option
                destroy: function(){
                    if(instance.picklist.useAddressEntered.element){
                        instance.picklist.list.parentNode.removeChild(instance.picklist.useAddressEntered.element);
                        instance.picklist.useAddressEntered.element = undefined;
                    }
                },
                // Use the address entered as the Formatted address
                click: function(){
                    var inputData = {
                        address: []
                    };

                    if(instance.currentSearchTerm){
                        // Try and split into lines by using comma delimiter
                        var lines = instance.currentSearchTerm.split(",");
                        if(lines.length > 0){
                            for(var i = 0; i < lines.length; i++){
                                inputData.address.push(instance.picklist.useAddressEntered.formatManualAddressLine(lines, i));
                            }
                        }

                        // Pad with additional blank fields if needed
                        var maxLines = 7;
                        var additionalLinesNeeded = maxLines - lines.length;
                        if(additionalLinesNeeded > 0){
                            var counterStart = maxLines - additionalLinesNeeded;
                            for(var j = counterStart; j < maxLines; j++){
                                inputData.address.push(instance.picklist.useAddressEntered.formatManualAddressLine([], j));
                            }
                        }
                    }

                    instance.result.show(inputData);
                    instance.result.updateHeading(instance.formattedAddressContainer.manualHeadingText);
                },
                // Create and return an address line object with the key as the label
                formatManualAddressLine: function(lines, i){
                    var key = ContactDataServices.defaults.addressLineLabels[i];
                    var lineObject = {};
                    lineObject[key] = lines[i] || "";
                    return lineObject;
                }
            },
            // Create the picklist list (and container) and inject after the input
            createList: function(){
                var container = document.createElement("div");
                container.classList.add("address-picklist-container");
                // Insert the picklist container after the input
                instance.input.parentNode.insertBefore(container, instance.input.nextSibling);
                instance.picklist.container = container;

                var list = document.createElement("div");
                list.classList.add("address-picklist");
                // Append the picklist to the container
                container.appendChild(list);

                list.addEventListener("keydown", instance.picklist.enter);
                return list;
            },
            // Create a new picklist item/row
            createListItem: function(item){
                var row = document.createElement("div");
                row.innerHTML = instance.picklist.addMatchingEmphasis(item);
                // Store the Format URL
                row.setAttribute("format", item.format);
                return row;
            },
            // Tab count used for keyboard navigation
            tabCount: -1,
            resetTabCount: function () {
                instance.picklist.tabCount = -1;
            },
            // Keyboard navigation
            keyup: function(e){
                if(!instance.picklist.list){
                    return;
                }

                if (e === 13/*Enter*/ || e === 9 /*Tab*/) {
                    instance.picklist.checkEnter();
                    return;
                }

                // Get a list of all the addresses in the picklist
                var addresses = instance.picklist.list.querySelectorAll("div"),
                    firstAddress, lastAddress;

                // If the picklist is empty, just return
                if(addresses.length === 0){
                    return;
                }

                // Set the tabCount based on previous and direction
                if (e === 38/*Up*/) {
                    instance.picklist.tabCount--;
                }
                else {
                    instance.picklist.tabCount++;
                }

                // Set top and bottom positions and enable wrap-around
                if (instance.picklist.tabCount < 0) {
                    instance.picklist.tabCount = addresses.length - 1;
                    lastAddress = true;
                }
                if (instance.picklist.tabCount > addresses.length - 1) {
                    instance.picklist.tabCount = 0;
                    firstAddress = true;
                }

                // Highlight the selected address
                var currentlyHighlighted = addresses[instance.picklist.tabCount];
                // Remove any previously highlighted ones
                var previouslyHighlighted = instance.picklist.list.querySelector(".selected");
                if(previouslyHighlighted){
                    previouslyHighlighted.classList.remove("selected");
                }
                currentlyHighlighted.classList.add("selected");
                // Set the currentItem on the picklist to the currently highlighted address
                instance.picklist.currentItem = currentlyHighlighted;

                // Scroll address into view, if required
                var addressListCoords = {
                    top: instance.picklist.list.offsetTop,
                    bottom: instance.picklist.list.offsetTop + instance.picklist.list.offsetHeight,
                    scrollTop: instance.picklist.list.scrollTop,
                    selectedTop: currentlyHighlighted.offsetTop,
                    selectedBottom: currentlyHighlighted.offsetTop + currentlyHighlighted.offsetHeight,
                    scrollAmount: currentlyHighlighted.offsetHeight
                };
                if (firstAddress) {
                    instance.picklist.list.scrollTop = 0;
                }
                else if (lastAddress) {
                    instance.picklist.list.scrollTop = 999;
                }
                else if (addressListCoords.selectedBottom + addressListCoords.scrollAmount > addressListCoords.bottom) {
                    instance.picklist.list.scrollTop = addressListCoords.scrollTop + addressListCoords.scrollAmount;
                }
                else if (addressListCoords.selectedTop - addressListCoords.scrollAmount - addressListCoords.top < addressListCoords.scrollTop) {
                    instance.picklist.list.scrollTop = addressListCoords.scrollTop - addressListCoords.scrollAmount;
                }
            },
            // Add emphasis to the picklist items highlighting the match
            addMatchingEmphasis: function(item){
                var highlights = item.matched || [],
                    label = item.suggestion;

                for (var i = 0; i < highlights.length; i++) {
                    var replacement = '<b>' + label.substring(highlights[i][0], highlights[i][1]) + '</b>';
                    label = label.substring(0, highlights[i][0]) + replacement + label.substring(highlights[i][1]);
                }

                return label;
            },
            // Listen to a picklist selection
            listen: function(row){
                row.addEventListener("click", instance.picklist.pick.bind(null, row));
            },
            checkEnter: function(){
                var picklistItem;
                // If picklist contains 1 address then use this one to format
                if(instance.picklist.size === 1){
                    picklistItem = instance.picklist.list.querySelectorAll("div")[0];
                } // Else use the currently highlighted one when navigation using keyboard
                else if(instance.picklist.currentItem){
                    picklistItem = instance.picklist.currentItem;
                }
                if(picklistItem){
                    instance.picklist.pick(picklistItem);
                }
            },
            // How to handle a picklist selection
            pick: function(item){
                // Fire an event when an address is picked
                instance.events.trigger("post-picklist-selection", item);

                // Get a final address using picklist item
                instance.format(item.getAttribute("format"));
            }
        };

        instance.result = {
            // Render a Formatted address
            show: function(data){
                // Hide the inline search spinner
                instance.searchSpinner.hide();

                // Hide the picklist
                instance.picklist.hide();

                // Clear search input
                instance.input.value = "";

                if(data.address && data.address.length > 0){

                    // Create an array to hold the hidden input fields
                    var inputArray = [];

                    // Calculate if we needed to generate the formatted address input fields later
                    instance.result.calculateIfAddressLineGenerationRequired();

                    // Get formatted address container element
                    // Only create a container if we're creating inputs. otherwise the user will have their own container.
                    instance.result.formattedAddressContainer = instance.elements.formattedAddressContainer;
                    if(!instance.result.formattedAddressContainer && instance.result.generateAddressLineRequired) {
                        instance.result.createFormattedAddressContainer();
                    }

                    // Loop over each formatted address component
                    for(var i = 0; i < data.address.length; i++){
                        var addressComponent = data.address[i];
                        // The addressComponent object will only have one property, but we don't know the key
                        for (var key in addressComponent) {
                            if (addressComponent.hasOwnProperty(key)) {
                                // Bind the address element to the user's address field (or create a new one)
                                instance.result.updateAddressLine(key, addressComponent, "address-line-input");
                            }
                        }
                    }

                    // Hide country and address search fields (if they have a 'toggle' class)
                    instance.result.hideSearchInputs();

                    // Write the 'Search again' link and insert into DOM
                    instance.result.createSearchAgainLink();

                    // If an address line is also the search input, set property to false.
                    // This ensures that typing in the field again (after an address has been
                    // returned) will not trigger a new search.
                    for(var element in instance.elements){
                        if (instance.elements.hasOwnProperty(element)) {
                            // Excluding the input itself, does another element match the input field?
                            if (element !== "input" && instance.elements[element] === instance.elements.input) {
                                instance.hasSearchInputBeenReset = false;
                                break;
                            }
                        }
                    }
                }

                // Fire an event to say we've got the formatted address
                instance.events.trigger("post-formatting-search", data);
            },
            hide: function(){
                // Delete the formatted address container
                if(instance.result.formattedAddressContainer){
                    instance.input.parentNode.removeChild(instance.result.formattedAddressContainer);
                    instance.result.formattedAddressContainer = undefined;
                }
                // Delete the search again link
                if(instance.searchAgain.link){
                    instance.searchAgain.link.parentNode.removeChild(instance.searchAgain.link);
                    instance.searchAgain.link = undefined;
                }
                // Remove previous value from user's result field
                // Loop over their elements
                for(var element in instance.elements){
                    if (instance.elements.hasOwnProperty(element)) {
                        // If it matches an "address" element
                        for(var i = 0; i < ContactDataServices.defaults.addressLineLabels.length; i++){
                            var label = ContactDataServices.defaults.addressLineLabels[i];
                            // Only reset the value if it's not an input field
                            if(label === element && instance.elements[element] !== instance.elements.input) {
                                instance.elements[element].value = "";
                                break;
                            }
                        }
                    }
                }
            },
            // Create the formatted address container and inject after the input
            createFormattedAddressContainer: function(){
                var container = document.createElement("div");
                container.classList.add("formatted-address");

                // Insert the container after the input
                instance.input.parentNode.insertBefore(container, instance.input.nextSibling);
                instance.result.formattedAddressContainer = container;
            },
            // Create a heading for the formatted address container
            createHeading: function(){
                // Create a heading for the formatted address
                if(instance.formattedAddressContainer.showHeading){
                    var heading = document.createElement(instance.formattedAddressContainer.headingType);
                    heading.innerHTML = instance.formattedAddressContainer.validatedHeadingText;
                    instance.result.formattedAddressContainer.appendChild(heading);
                }
            },
            // Update the heading text in the formatted address container
            updateHeading: function(text){
                //Change the heading text to "Manual address entered"
                if(instance.formattedAddressContainer.showHeading){
                    var heading = instance.result.formattedAddressContainer.querySelector(instance.formattedAddressContainer.headingType);
                    heading.innerHTML = text;
                }
            },
            calculateIfAddressLineGenerationRequired: function(){
                instance.result.generateAddressLineRequired = true;
                for(var i = 0; i < ContactDataServices.defaults.addressLineLabels.length; i++){
                    var key = ContactDataServices.defaults.addressLineLabels[i];
                    if(instance.elements[key]){
                        instance.result.generateAddressLineRequired = false;
                        break;
                    }
                }
            },
            updateAddressLine: function(key, addressLineObject, className){
                // Either append the result to the user's address field or create a new field for them
                if (instance.elements[key]){
                    var addressField = instance.elements[key];
                    var value = addressLineObject[key];
                    // If a value is already present, prepend a comma and space
                    if(addressField.value && value) {
                        value = ", " + value;
                    }
                    // Decide what property of the node we need to update. i.e. if it's not a form field, update the innerText.
                    if (addressField.nodeName === "INPUT" || addressField.nodeName === "TEXTAREA" || addressField.nodeName === "SELECT") {
                        addressField.value += value;
                    } else {
                        addressField.innerText += value;
                    }
                    // Store a record of their last address field
                    instance.result.lastAddressField = addressField;
                } else if (instance.result.generateAddressLineRequired){
                    // Create an input to store the address line
                    var label = instance.result.createAddressLine.label(key);
                    var field = instance.result.createAddressLine.input(label, addressLineObject[key], className);
                    // Insert into DOM
                    instance.result.formattedAddressContainer.appendChild(field);
                }
            },
            createAddressLine: {
                // Create an input to store the address line
                input: function(key, value, className){
                    // Create a wrapper
                    var div  = document.createElement("div");
                    div.classList.add(className);

                    // Create the label
                    var label = document.createElement("label");
                    label.innerHTML = key.replace(/([A-Z])/g, ' $1') // Add space before capital Letters
                        .replace(/([0-9])/g, ' $1') // Add space before numbers
                        .replace(/^./, function (str) { return str.toUpperCase(); }); // Make first letter of word a capital letter
                    div.appendChild(label);

                    // Create the input
                    var input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.setAttribute("name", key);
                    input.setAttribute("value", value);
                    div.appendChild(input);
                    return div;
                },
                // Create the address line label based on the country and language
                label: function(key){
                    var label = key;
                    var language = instance.language.toLowerCase();
                    var country = instance.currentCountryCode.toLowerCase();
                    var translations = ContactDataServices.translations;
                    if(translations){
                        try {
                            var translatedLabel = translations[language][country][key];
                            if(translatedLabel){
                                label = translatedLabel;
                            }
                        } catch(e) {
                            // Translation doesn't exist for key
                        }
                    }
                    return label;
                }
            },
            // Create the 'Search again' link that resets the search
            createSearchAgainLink: function(){
                if(instance.searchAgain.visible){
                    var link = document.createElement("a");
                    link.setAttribute("href", "#");
                    link.classList.add("search-again-link");
                    link.innerHTML = instance.searchAgain.text;
                    // Bind event listener
                    link.addEventListener("click", instance.reset);
                    // Store a reference to the link element
                    instance.searchAgain.link = link;

                    // Insert into the formatted address container
                    if(instance.result.formattedAddressContainer) {
                        instance.result.formattedAddressContainer.appendChild(link);
                    } else {
                        // Insert after last address field
                        instance.result.lastAddressField.parentNode.insertBefore(link, instance.result.lastAddressField.nextSibling);
                    }
                }
            },
            // Write the list of hidden address line inputs to the DOM
            renderInputList: function(inputArray){
                if(inputArray.length > 0){
                    for(var i = 0; i < inputArray.length; i++){
                        instance.result.formattedAddressContainer.appendChild(inputArray[i]);
                    }
                }
            },
            // Hide the initial country and address search inputs
            hideSearchInputs: function(){
                instance.toggleVisibility(instance.input.parentNode);
            }
        };

        // Toggle the visibility of elements
        instance.toggleVisibility = function(scope){
            scope = scope || document;
            var elements = scope.querySelectorAll(".toggle");
            for (var i = 0; i < elements.length; i++) {
                if(elements[i].classList.contains("hidden")){
                    elements[i].classList.remove("hidden");
                } else {
                    elements[i].classList.add("hidden");
                }
            }
        };

        instance.searchSpinner = {
            show: function(){
                // Return if we're not displaying a spinner
                if(!instance.useSpinner){
                    return;
                }
                // Create the spinner container
                var spinnerContainer = document.createElement("div");
                spinnerContainer.classList.add("loader");
                spinnerContainer.classList.add("loader-inline");

                // Create the spinner
                var spinner = document.createElement("div");
                spinner.classList.add("spinner");
                spinnerContainer.appendChild(spinner);

                // Insert the spinner after the field
                instance.input.parentNode.insertBefore(spinnerContainer, instance.input.nextSibling);
            },

            hide: function(){
                // Return if we're not displaying a spinner
                if(!instance.useSpinner){
                    return;
                }
                var spinner = instance.input.parentNode.querySelector(".loader-inline");
                if(spinner){
                    instance.input.parentNode.removeChild(spinner);
                }
            }
        };

        // Reset the search
        instance.reset = function(event){
            if(event){
                event.preventDefault();
            }
            // Enable searching
            instance.enabled = true;
            // Hide formatted address
            instance.result.hide();
            // Clear the input field
            instance.input.value = "";
            // Reset search input back
            instance.hasSearchInputBeenReset = true;
            // Show search input
            instance.toggleVisibility(instance.input.parentNode);
            // Apply focus to input
            instance.input.focus();

            // Fire an event after a reset
            instance.events.trigger("post-reset");
        };

        // How to handle request errors
        instance.handleError = {
            // How to handle 400 Bad Request
            badRequest: function(xhr){
                instance.enabled = false;

                // As searching is disabled, show button to render final address instead
                instance.handleError.showSubmitButton();

                // Fire an event to notify users of the error
                instance.events.trigger("request-error-400", xhr);
            },

            // How to handle 401 Unauthorized (invalid token?) requests
            unauthorized: function(xhr){
                instance.enabled = false;

                // As searching is disabled, show button to render final address instead
                instance.handleError.showSubmitButton();

                // Fire an event to notify users of the error
                instance.events.trigger("request-error-401", xhr);
            },

            // How to handle 403 Forbidden requests
            forbidden: function(xhr){
                instance.enabled = false;

                // As searching is disabled, show button to render final address instead
                instance.handleError.showSubmitButton();

                // Fire an event to notify users of the error
                instance.events.trigger("request-error-403", xhr);
            },

            // How to handle 404 Not Found requests
            notFound: function(xhr){
                instance.enabled = false;

                // As searching is disabled, show button to render final address instead
                instance.handleError.showSubmitButton();

                // Fire an event to notify users of the error
                instance.events.trigger("request-error-404", xhr);
            },

            // As searching is disabled, show button to render final address instead
            showSubmitButton: function(){
                var button = document.createElement("button");
                button.innerText = "Submit";
                instance.input.parentNode.insertBefore(button, instance.input.nextSibling);
                button.addEventListener("click", function(){
                    // Simulate a manual "use address entered" entry
                    instance.picklist.useAddressEntered.click();
                    // Remove the button
                    instance.input.parentNode.removeChild(button);
                });
            }
        };

        // Use this to initiate and track XMLHttpRequests
        instance.request = {
            currentRequest: null,
            get: function(url, callback){
                instance.request.currentRequest = new XMLHttpRequest();
                instance.request.currentRequest.open('GET', url, true);
                instance.request.currentRequest.timeout = 5000; // 5 seconds

                instance.request.currentRequest.onload = function(xhr) {
                    if (instance.request.currentRequest.status >= 200 && instance.request.currentRequest.status < 400) {
                        // Success!
                        var data = JSON.parse(instance.request.currentRequest.responseText);
                        instance.request.latestResult = data;
                        callback(data);
                    } else {
                        instance.request.latestResult = {};

                        // We reached our target server, but it returned an error
                        instance.searchSpinner.hide();

                        // Fire an event to notify users of an error
                        instance.events.trigger("request-error", xhr);

                        // If the request is 400 Bad Request
                        if (instance.request.currentRequest.status === 400){
                            instance.handleError.badRequest(xhr);
                        }
                        // If the request is 401 Unauthorized (invalid token) we should probably disable future requests
                        else if (instance.request.currentRequest.status === 401){
                            instance.handleError.unauthorized(xhr);
                        }
                        // If the request is 403 Forbidden
                        else if (instance.request.currentRequest.status === 403){
                            instance.handleError.forbidden(xhr);
                        }
                        // If the request is 404 Not Found
                        else if (instance.request.currentRequest.status === 404){
                            instance.handleError.notFound(xhr);
                        }
                    }
                };

                instance.request.currentRequest.onerror = function(xhr) {
                    // There was a connection error of some sort
                    // Hide the inline search spinner
                    instance.searchSpinner.hide();

                    // Fire an event to notify users of an error
                    instance.events.trigger("request-error", xhr);
                };

                instance.request.currentRequest.ontimeout = function(xhr) {
                    // There was a connection timeout
                    // Hide the inline search spinner
                    instance.searchSpinner.hide();

                    // Fire an event to notify users of the timeout
                    instance.events.trigger("request-timeout", xhr);
                };

                instance.request.currentRequest.send();
            }
        };

        // Initialise this instance of ContactDataServices
        instance.init();

        // Return the instance object to the invoker
        return instance;
    };
})(window, window.document);

