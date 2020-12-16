var config = {
    map: {
        '*': {
            dataservices: 'Magepow_ExperianAddressValidation/js/datasetservices'
        },
        paths: {
            'av/dataservices': 'Magepow_ExperianAddressValidation/js/datasetservices',
        },
        shim: {
            dataservices: {
                deps: ['jquery']
            },

        }
    }
};
