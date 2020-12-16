<?php
namespace Magepow\ExperianAddressValidation\Model;
use Magento\Checkout\Model\ConfigProviderInterface;


class DataCustomer implements ConfigProviderInterface
{

    private $helper;

    public function __construct(
        \Magepow\ExperianAddressValidation\Helper\Data $helper
    ) {

        $this->helper = $helper;
    }
    public function getConfig()
    {
        $config['magepow_experianaddressvalidation'] = [
            'active'            => $this->helper->getStoreConfig('magepow_experianaddressvalidation/experian_address_validation/active'),
            'api_key'           => $this->helper->getStoreConfig('magepow_experianaddressvalidation/experian_address_validation/experian_api_key'),
            'country_ip'         => $this->helper->getStoreConfig('magepow_experianaddressvalidation/experian_address_validation/country_ip'),
        ];
        return $config;
    }
}
