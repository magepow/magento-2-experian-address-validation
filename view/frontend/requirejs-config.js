var config = {
    map: {
        '*': {
            dataservices: 'Magepow_ExperianAddressValidation/js/datasetservices'
        },
        paths: {
            'magepow/dataservices': 'Magepow_ExperianAddressValidation/js/datasetservices',
        },
        shim: {
            dataservices: {
                deps: ['jquery']
            },

        }
    }
};
