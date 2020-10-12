<?php

namespace Magepow\ExperianAddressValidation\Model\Source\Config;
use Magento\Directory\Model\ResourceModel\Country\CollectionFactory;
use Magento\Framework\Escaper;
class Config implements \Magento\Framework\Option\ArrayInterface
{
    protected $collectionFactory;
    protected $escaper;
    public function __construct(CollectionFactory $collectionFactory, Escaper $escaper)
    {
        $this->collectionFactory = $collectionFactory;
        $this->escaper = $escaper;
    }
    public function toOptionArray()
    {
        return $this->getAvailableGroups();
    }
    private function getAvailableGroups()
    {
        $collection = $this->collectionFactory->create()->loadByStore();
        $result = [];
        $result[] = ['value' => ' ', 'label' => 'Select Country...'];
        foreach ($collection as $time) {
            $result[] = ['value' => $time->getCountryId(), 'label' => $this->escaper->escapeHtml($time->getName())];
        }
        return $result;
    }

}

