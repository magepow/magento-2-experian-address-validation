<?php
namespace Magepow\ExperianAddressValidation\Helper;
use Magento\Store\Model\ScopeInterface;

class Data extends \Magento\Framework\App\Helper\AbstractHelper
{
    const CONFIG_PATH_AUTOCOMPLETE_ENABLE_MODULE        = 'magepow_experianaddressvalidation/experian_address_validation/active';
    const CONFIG_PATH_AUTOCOMPLETE_EXPERIAN_API_KEY     = 'magepow_experianaddressvalidation/experian_address_validation/experian_api_key';
    const CONFIG_PATH_AUTOCOMPLETE_COUNTRY_IP           = 'magepow_experianaddressvalidation/experian_address_validation/country_ip';
    protected $scopeConfig = null;
    protected $storeManager;
    public function __construct(
        \Magento\Framework\App\Helper\Context $context,
        \Magento\Store\Model\StoreManagerInterface $storeManager
    ) {
        parent::__construct($context);
        $this->storeManager = $storeManager;
        $this->scopeConfig  = $context->getScopeConfig();
    }

    public function IsActive()
    {
        return $this->getStoreConfig(self::CONFIG_PATH_AUTOCOMPLETE_ENABLE_MODULE);
    }
    public function getExperianApi()
    {
        return $this->getStoreConfig(self::CONFIG_PATH_AUTOCOMPLETE_EXPERIAN_API_KEY);
    }
    public function getCountry()
    {
        return $this->getStoreConfig(self::CONFIG_PATH_AUTOCOMPLETE_COUNTRY_IP);
    }
    public function getStoreId()
    {
        return $this->storeManager->getStore()->getStoreId();
    }
    public function getStoreConfig($path)
    {
        return $this->scopeConfig->getValue($path, ScopeInterface::SCOPE_STORE, $this->getStoreId());
    }
}
