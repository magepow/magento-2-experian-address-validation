define([
    'jquery',
    'uiComponent',
    'dataservices',
    'Magento_Checkout/js/checkout-data' ,
    'uiRegistry',
    'mage/url'
], function (
    $,
    Component,
    dataservices,
    checkoutData,
    uiRegistry,
    url

) {

    setTimeout(function () {

        var apiKey =  window.checkoutConfig.magepow_experianaddressvalidation.api_key;
        var countryIp =  window.checkoutConfig.magepow_experianaddressvalidation.country_ip;
        var countryDomID    = uiRegistry.get('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.country_id').uid;
        var cityDomID       = uiRegistry.get('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.city').uid;
        var postcodeDomID   = uiRegistry.get('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.postcode').uid;
        var regionDomId     = uiRegistry.get('checkout.steps.shipping-step.shippingAddress.shipping-address-fieldset.region_id').uid;
        var hideShowFill    = $("#shipping-new-address-form div[name='shippingAddress.city'], div[name='shippingAddress.postcode'], div[name='shippingAddress.region_id']");
        hideShowFill.hide();
        $("input[name='street[1]'], input[name='street[2]']").hide();

        var search_input = document.querySelector("input[name='street[0]']");
        var countryMap = {"AU":"AUS;DataFusion","US": "USA"};
        var countryArray = countryIp.split(/[\s,]+/);
        $('#'+countryDomID).on('change', function (){
            var countryValue = $(this).val();
            if (countryArray.indexOf(countryValue) != -1){
                hideShowFill.hide();
            }else {
                hideShowFill.show();
                $('#'+cityDomID).val('');
                $('#'+postcodeDomID).val('');
            }
        })
        var options = {
            token: apiKey,
            elements: {
                input: search_input,
                countryList: document.querySelector('#'+countryDomID),
                countryCodeMapping : countryMap,
                addressLine1: document.querySelector("input[name='street[0]']"),
                addressLine2: document.querySelector("input[name='street[0]']"),
                addressLine3: document.querySelector("input[name='street[0]']"),
                locality:     document.querySelector("input[name='street[0]']"),
                province:     document.querySelector("input[name='street[0]']"),
                postalCode:   document.querySelector("input[name='street[0]']")
            }
        };
        var address = window.ContactDataServices.address(options);
        var checkShipping    = document.querySelector("#shipping-new-address-form");
        checkShipping.style.display = "flex";
        checkShipping.style.flexDirection  = "column";
        var checkCountry            = document.querySelector("#shipping-new-address-form div[name='shippingAddress.country_id']");
        checkCountry.style.order    = "1";
        let langs =['Clear Search'];
        let nodes = langs.map(lang => {
            let buttonElement = document.createElement('div');
            buttonElement.textContent = lang;
            buttonElement.classList.add("clear-street");
            return buttonElement;
        });
        checkCountry.append(...nodes);
        $(".clear-street").on('click', function (){
            $("input[name='street[0]']").val('');
        })
        var checkStreet             = document.querySelector("#shipping-new-address-form fieldset");
        checkStreet.style.order     = "2";
        let fillinAddress =['User Address Search'];
        let userAddress = fillinAddress.map(lang => {let showElement = document.createElement('div');
            showElement.textContent = lang;
            showElement.classList.add("show-filladdress");
            return showElement;
        });
        checkStreet.append(...userAddress);
        let hiddenAddress =['Manual Entry'];
        let hideAddress = hiddenAddress.map(lang => {let hideElement = document.createElement('div');
            hideElement.textContent = lang;
            hideElement.classList.add("hide-filladdress");
            return hideElement;
        });
        checkStreet.append(...hideAddress);
        $(document).on('click', '.show-filladdress', function (){
            hideShowFill.show();
            $(this).hide();$('.hide-filladdress').show();
            var text = $('input[name="street[0]"]').val();
            var patt1 = /^[^,]+/;
            var result = text.match(patt1);
            $('input[name="street[0]"]').val(result);
        })
        $(document).on('click','.address-picklist-container .address-picklist div' ,function() {
            var text        = $(this).text();
            let fillCity   = text.split(/[\s,]+/);
            let cityEAV    = fillCity[fillCity.length -3];
            let regionEAV  = fillCity[fillCity.length -2];
            let fillcode   = fillCity[fillCity.length -1];
            $('#'+cityDomID).val(cityEAV);
            $('#'+cityDomID).trigger('change');
            $('#'+postcodeDomID).val(fillcode);
            $('#'+postcodeDomID).trigger('change');
            var country = $('#'+countryDomID).val();
            var getUrl = url.build('experian/experian/region');
            $.ajax({
                url: getUrl,
                type: "POST",
                data: {country : country, region: regionEAV},
                showLoader: true,
                cache: false,
                dataType: 'json',
                success: function(data){
                    var regionId = data[regionEAV];
                    $("select[name='region_id'] option[value='"+regionId+"']").attr('selected', true);
                    $('#'+regionDomId).trigger('change');
                }
            });

        })
        $(document).on('click', '.hide-filladdress', function (){
            hideShowFill.hide();
            $(this).hide();$('.show-filladdress').show();
        })
        document.querySelector("#shipping-new-address-form div[name='shippingAddress.city']").style.order       = "3";
        document.querySelector("#shipping-new-address-form div[name='shippingAddress.region_id']").style.order  = "4";
        document.querySelector("#shipping-new-address-form div[name='shippingAddress.region']").style.order     = "4";
        document.querySelector("#shipping-new-address-form div[name='shippingAddress.postcode']").style.order   = "5";
        document.querySelector("#shipping-new-address-form div[name='shippingAddress.telephone']").style.order  = "6";
    }, 7000);

    return Component;

});
